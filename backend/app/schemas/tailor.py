from pydantic import BaseModel
from typing import List


class ImprovedBullet(BaseModel):
    original: str
    improved: str


class TailorRequest(BaseModel):
    resume_id: int
    job_id: int


class TailorResponse(BaseModel):
    match_score: int                        # 0–100
    matched_skills: List[str]
    missing_skills: List[str]
    improved_bullets: List[ImprovedBullet]
    summary: str