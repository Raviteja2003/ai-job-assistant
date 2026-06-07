from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume_version import ResumeVersion
from app.schemas.resume_version import ResumeVersionCreate, ResumeVersionOut
from typing import List

router = APIRouter()

@router.post("/save", response_model=ResumeVersionOut)
def save_version(
    payload: ResumeVersionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    version = ResumeVersion(
        user_id=current_user.id,
        resume_id=payload.resume_id,
        job_id=payload.job_id,
        version_name=payload.version_name,
        match_score=payload.match_score,
        missing_skills=payload.missing_skills,
        improved_bullets=[b.model_dump() for b in payload.improved_bullets],
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version

@router.get("/", response_model=List[ResumeVersionOut])
def list_versions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(ResumeVersion)
        .filter(ResumeVersion.user_id == current_user.id)
        .order_by(ResumeVersion.created_at.desc())
        .all()
    )

@router.get("/{version_id}", response_model=ResumeVersionOut)
def get_version(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    version = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.id == version_id, ResumeVersion.user_id == current_user.id)
        .first()
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version

@router.delete("/{version_id}")
def delete_version(
    version_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    version = (
        db.query(ResumeVersion)
        .filter(ResumeVersion.id == version_id, ResumeVersion.user_id == current_user.id)
        .first()
    )
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    db.delete(version)
    db.commit()
    return {"detail": "Deleted"}