from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobDescription
from app.schemas.tailor import TailorRequest, TailorResponse
from app.services.tailor_service import analyze_resume_vs_job

router = APIRouter()


@router.post("/analyze", response_model=TailorResponse)
async def analyze(
    payload: TailorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Fetch resume — must belong to current user
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Fetch job — must belong to current user
    job = (
        db.query(JobDescription)
        .filter(JobDescription.id == payload.job_id, JobDescription.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    try:
        result = await analyze_resume_vs_job(
            resume_raw_text=resume.raw_text or "",
            resume_skills=resume.skills or [],
            resume_experience=resume.experience or [],
            resume_projects=resume.projects or [],
            job_raw_text=job.raw_text or "",
            job_required_skills=job.required_skills or [],
            job_responsibilities=job.responsibilities or [],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    return TailorResponse(**result)