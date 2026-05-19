from pydantic import BaseModel
from typing import List, Literal

class InterviewGenerateRequest(BaseModel):
    resume_id: int
    job_id: int

class InterviewQuestion(BaseModel):
    question: str
    category: Literal["behavioral", "technical", "role-specific", "situational"]
    difficulty: Literal["easy", "medium", "hard"]
    sample_answer: str

class InterviewGenerateResponse(BaseModel):
    company: str
    role: str
    questions: List[InterviewQuestion]
    tips: List[str]