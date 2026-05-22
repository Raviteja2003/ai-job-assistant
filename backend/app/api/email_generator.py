from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobDescription
from app.schemas.email_generator import EmailGenerateRequest, EmailGenerateResponse
from app.services.email_service import generate_email

router = APIRouter()

@router.post("/generate", response_model=EmailGenerateResponse)
async def generate_email_endpoint(
    request: EmailGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == request.resume_id,
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job = db.query(JobDescription).filter(
        JobDescription.id == request.job_id,
        JobDescription.user_id == current_user.id,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    try:
        data = await generate_email(
            resume_text=resume.raw_text,
            job_raw_text=job.raw_text,
            company=job.company,
            role=job.role,
            email_type=request.email_type,
            tone=request.tone,
            interviewer_name=request.interviewer_name,
            days_since_applied=request.days_since_applied,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return EmailGenerateResponse(
        subject=data["subject"],
        body=data["body"],
        email_type=request.email_type,
        tone=request.tone,
        company=job.company,
        role=job.role,
    )