from pydantic import BaseModel
from typing import Literal

class EmailGenerateRequest(BaseModel):
    resume_id: int
    job_id: int
    email_type: Literal["follow-up", "thank-you", "withdrawal"]
    tone: Literal["formal", "casual", "enthusiastic"]
    interviewer_name: str | None = None   # optional, used in thank-you
    days_since_applied: int | None = None # optional, used in follow-up

class EmailGenerateResponse(BaseModel):
    subject: str
    body: str
    email_type: str
    tone: str
    company: str
    role: str