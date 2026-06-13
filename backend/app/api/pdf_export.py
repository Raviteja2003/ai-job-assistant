from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume_version import ResumeVersion
from app.models.resume import Resume
from app.services.pdf_service import generate_resume_pdf, generate_cover_letter_pdf
from pydantic import BaseModel

router = APIRouter()


@router.get("/resume-version/{version_id}")
def export_resume_version(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    version = (
        db.query(ResumeVersion)
        .filter(
            ResumeVersion.id == version_id,
            ResumeVersion.user_id == current_user.id,
        )
        .first()
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == version.resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Original resume not found")

    resume_raw = {
        "name":       resume.name or "",
        "contact":    resume.contact or {},
        "summary":    resume.summary or "",
        "skills":     resume.skills or [],
        "experience": resume.experience or [],
        "projects":   resume.projects or [],
        "education":  resume.education or [],
    }

    pdf_bytes = generate_resume_pdf(
        version_name=version.version_name,
        resume_raw=resume_raw,
        improved_bullets=version.improved_bullets or [],
    )

    filename = version.version_name.replace(" ", "_").replace("—", "-") + ".pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


class CoverLetterExportRequest(BaseModel):
    company: str
    role: str
    content: str
    tone: str


@router.post("/cover-letter")
def export_cover_letter(
    payload: CoverLetterExportRequest,
    current_user: User = Depends(get_current_user),
):
    pdf_bytes = generate_cover_letter_pdf(
        company=payload.company,
        role=payload.role,
        content=payload.content,
        tone=payload.tone,
    )
    filename = f"Cover_Letter_{payload.company}_{payload.role}.pdf".replace(" ", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )