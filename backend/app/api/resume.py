from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import get_db
from app.models.resume import Resume
from app.schemas.resume import ResumeUploadResponse, ResumeListItem
from app.services.resume_parser import extract_text, parse_resume_with_ai
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeUploadResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 5MB")

    try:
        raw_text = extract_text(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[resume/upload] Text extraction FAILED: {type(e).__name__}: {e}")
        raise HTTPException(status_code=422, detail="Could not extract text from file")

    if not raw_text:
        raise HTTPException(status_code=422, detail="No text found in file")

    print(f"[resume/upload] Extracted {len(raw_text)} characters from {file.filename}")

    try:
        parsed = parse_resume_with_ai(raw_text)
        print(f"[resume/upload] AI parsing succeeded — "
              f"name: {parsed.get('name', '')}, "
              f"skills: {len(parsed.get('skills', []))}, "
              f"experience: {len(parsed.get('experience', []))}, "
              f"projects: {len(parsed.get('projects', []))}, "
              f"education: {len(parsed.get('education', []))}")
    except Exception as e:
        print(f"[resume/upload] AI parsing FAILED: {type(e).__name__}: {e}")
        parsed = {
            "name": "", "contact": {}, "summary": "",
            "skills": [], "experience": [], "projects": [], "education": []
        }

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=raw_text,
        name=parsed.get("name", ""),
        contact=parsed.get("contact", {}),
        summary=parsed.get("summary", ""),
        skills=parsed.get("skills", []),
        experience=parsed.get("experience", []),
        projects=parsed.get("projects", []),
        education=parsed.get("education", []),
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


@router.get("/", response_model=list[ResumeListItem])
def get_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Resume).filter(Resume.user_id == current_user.id).all()


@router.get("/{resume_id}", response_model=ResumeUploadResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.delete("/{resume_id}", status_code=204)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Delete dependent rows in child tables before removing the resume
    db.execute(
        text("DELETE FROM mock_interviews WHERE resume_id = :rid"),
        {"rid": resume_id},
    )
    db.execute(
        text("DELETE FROM resume_versions WHERE resume_id = :rid"),
        {"rid": resume_id},
    )

    db.delete(resume)
    db.commit()