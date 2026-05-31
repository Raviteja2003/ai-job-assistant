from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


Status = Literal["saved", "applied", "interview", "offer", "rejected"]


class TrackedJobCreate(BaseModel):
    company: str
    role: str
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    notes: Optional[str] = None
    status: Status = "saved"
    applied_date: Optional[datetime] = None


class TrackedJobUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[Status] = None
    applied_date: Optional[datetime] = None


class TrackedJobResponse(BaseModel):
    id: int
    user_id: int
    company: str
    role: str
    job_url: Optional[str]
    location: Optional[str]
    salary: Optional[str]
    notes: Optional[str]
    status: Status
    applied_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class TrackedJobStatsResponse(BaseModel):
    total: int
    saved: int
    applied: int
    interview: int
    offer: int
    rejected: int
    
class TimelineEntry(BaseModel):
    date: str        # "2024-01-15"
    applied: int
    interview: int
    offer: int
    rejected: int

class TimelineResponse(BaseModel):
    entries: list[TimelineEntry]