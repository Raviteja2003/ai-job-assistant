from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.tracked_job import TrackedJob
from app.schemas.tracker import (
    TrackedJobCreate,
    TrackedJobUpdate,
    TrackedJobResponse,
    TrackedJobStatsResponse,
)

router = APIRouter()


@router.post("/", response_model=TrackedJobResponse, status_code=201)
def create_tracked_job(
    payload: TrackedJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = TrackedJob(**payload.model_dump(), user_id=current_user.id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=List[TrackedJobResponse])
def list_tracked_jobs(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(TrackedJob).filter(TrackedJob.user_id == current_user.id)
    if status:
        query = query.filter(TrackedJob.status == status)
    return query.order_by(TrackedJob.created_at.desc()).all()


@router.get("/stats", response_model=TrackedJobStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(TrackedJob.status, func.count(TrackedJob.id))
        .filter(TrackedJob.user_id == current_user.id)
        .group_by(TrackedJob.status)
        .all()
    )
    counts = {status: count for status, count in rows}
    total = sum(counts.values())
    return TrackedJobStatsResponse(
        total=total,
        saved=counts.get("saved", 0),
        applied=counts.get("applied", 0),
        interview=counts.get("interview", 0),
        offer=counts.get("offer", 0),
        rejected=counts.get("rejected", 0),
    )


@router.get("/{job_id}", response_model=TrackedJobResponse)
def get_tracked_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(TrackedJob)
        .filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.patch("/{job_id}", response_model=TrackedJobResponse)
def update_tracked_job(
    job_id: int,
    payload: TrackedJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(TrackedJob)
        .filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=204)
def delete_tracked_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = (
        db.query(TrackedJob)
        .filter(TrackedJob.id == job_id, TrackedJob.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()