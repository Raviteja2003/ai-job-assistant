from pydantic import BaseModel
from typing import Literal


class CoverLetterRequest(BaseModel):
    resume_id: int
    job_id: int
    tone: Literal["formal", "casual", "creative"] = "formal"


class CoverLetterResponse(BaseModel):
    cover_letter: str
    tone: str
    company: str
    role: str