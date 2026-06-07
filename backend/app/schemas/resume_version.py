from pydantic import BaseModel
from typing import List
from datetime import datetime

class ImprovedBullet(BaseModel):
    original: str
    improved: str

class ResumeVersionCreate(BaseModel):
    resume_id: int
    job_id: int
    version_name: str
    match_score: float
    missing_skills: List[str]
    improved_bullets: List[ImprovedBullet]

class ResumeVersionOut(BaseModel):
    id: int
    resume_id: int
    job_id: int
    version_name: str
    match_score: float
    missing_skills: List[str]
    improved_bullets: List[ImprovedBullet]
    created_at: datetime

    class Config:
        from_attributes = True