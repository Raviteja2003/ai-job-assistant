from pydantic import BaseModel
from datetime import datetime
from typing import List

class JobAddRequest(BaseModel):
    company: str
    role: str
    raw_text: str

class JobResponse(BaseModel):
    id: int
    user_id: int
    company: str
    role: str
    raw_text: str
    required_skills: List[str]
    responsibilities: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class JobListItem(BaseModel):
    id: int
    company: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True