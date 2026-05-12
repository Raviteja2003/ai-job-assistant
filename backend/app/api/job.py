from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.job import JobDescription
from app.schemas.job import JobAddRequest, JobResponse, JobListItem
from app.services.job_parser import parse_job_with_ai
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/job", tags=["Job"])

@router.post("/add", response_model=JobResponse, status_code=201)
def add_job(
    payload: JobAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        parsed = parse_job_with_ai(payload.raw_text)
        print(f"[job/add] AI parsing succeeded — skills: {len(parsed.get('required_skills', []))}, "
              f"responsibilities: {len(parsed.get('responsibilities', []))}")
    except Exception as e:
        print(f"[job/add] AI parsing FAILED: {type(e).__name__}: {e}")
        parsed = {"required_skills": [], "responsibilities": []}

    job = JobDescription(
        user_id=current_user.id,
        company=payload.company,
        role=payload.role,
        raw_text=payload.raw_text,
        required_skills=parsed.get("required_skills", []),
        responsibilities=parsed.get("responsibilities", [])
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/", response_model=list[JobListItem])
def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(JobDescription).filter(JobDescription.user_id == current_user.id).all()

@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(JobDescription).filter(
        JobDescription.id == job_id,
        JobDescription.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job