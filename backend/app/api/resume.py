from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
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
    # Validate file type
    if not file.filename.lower().endswith((".pdf", ".docx", ".doc")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")

    # Validate file size (5MB max)
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 5MB")

    # Extract raw text
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

    # Parse with Claude AI
    try:
        parsed = parse_resume_with_ai(raw_text)
        print(f"[resume/upload] AI parsing succeeded — skills: {len(parsed.get('skills', []))}, "
              f"experience: {len(parsed.get('experience', []))}, "
              f"projects: {len(parsed.get('projects', []))}")
    except Exception as e:
        # Log the real error — never silently fail during development
        print(f"[resume/upload] AI parsing FAILED: {type(e).__name__}: {e}")
        parsed = {"skills": [], "experience": [], "projects": []}

    # Save to DB
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=raw_text,
        skills=parsed.get("skills", []),
        experience=parsed.get("experience", []),
        projects=parsed.get("projects", [])
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
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes


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