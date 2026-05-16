from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobDescription
from app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from app.services.cover_letter_service import generate_cover_letter

router = APIRouter()


@router.post("/generate", response_model=CoverLetterResponse)
def generate(
    payload: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job = (
        db.query(JobDescription)
        .filter(
            JobDescription.id == payload.job_id,
            JobDescription.user_id == current_user.id,
        )
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    cover_letter_text = generate_cover_letter(
        resume_text=resume.raw_text,
        job_text=job.raw_text,
        company=job.company,
        role=job.role,
        tone=payload.tone,
        candidate_name=current_user.name,
    )

    return CoverLetterResponse(
        cover_letter=cover_letter_text,
        tone=payload.tone,
        company=job.company,
        role=job.role,
    )