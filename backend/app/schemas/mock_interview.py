from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StartRequest(BaseModel):
    resume_id: int
    job_id: int
    total_questions: int = 5


class StartResponse(BaseModel):
    session_id: int
    question: str
    turn: int
    total_questions: int


class RespondRequest(BaseModel):
    answer: str


class AnswerFeedback(BaseModel):
    score: int               # 1-10
    feedback: str
    strengths: list[str]
    improvements: list[str]


class FinalReport(BaseModel):
    overall_score: float
    strengths: list[str]
    improvements: list[str]
    recommendation: str      # "Strong Hire" | "Hire" | "No Hire"


class RespondResponse(BaseModel):
    turn: int
    question: Optional[str]
    feedback: AnswerFeedback
    is_complete: bool
    final_report: Optional[FinalReport]


class MessageOut(BaseModel):
    turn: int
    question: str
    user_answer: Optional[str]
    ai_feedback: Optional[str]
    score: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: int
    resume_id: int
    job_id: int
    status: str
    total_questions: int
    created_at: datetime
    messages: list[MessageOut]

    class Config:
        from_attributes = True


class SessionSummary(BaseModel):
    id: int
    status: str
    total_questions: int
    created_at: datetime

    class Config:
        from_attributes = True