from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobDescription
from app.schemas.interview import InterviewGenerateRequest, InterviewGenerateResponse
from app.services.interview_service import generate_interview_questions

router = APIRouter()

@router.post("/generate", response_model=InterviewGenerateResponse)
async def generate_questions(
    request: InterviewGenerateRequest,
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
        data = await generate_interview_questions(
            resume_text=resume.raw_text,
            job_raw_text=job.raw_text,
            skills=resume.skills or [],
            company=job.company,
            role=job.role,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return InterviewGenerateResponse(
        company=job.company,
        role=job.role,
        questions=data["questions"],
        tips=data.get("tips", []),
    )