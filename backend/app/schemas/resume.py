from pydantic import BaseModel
from typing import Any
from datetime import datetime

class ResumeUploadResponse(BaseModel):
    id: int
    filename: str
    name: str | None
    contact: dict | None
    summary: str | None
    skills: list[Any]
    experience: list[Any]
    projects: list[Any]
    education: list[Any]
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeListItem(BaseModel):
    id: int
    filename: str
    name: str | None
    contact: dict | None
    summary: str | None
    skills: list[Any]
    experience: list[Any]
    projects: list[Any]
    education: list[Any]
    created_at: datetime

    class Config:
        from_attributes = True