from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db import Base

class Resume(Base):
    __tablename__ = "resumes"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename     = Column(String, nullable=False)
    raw_text     = Column(Text, nullable=False)        # full extracted text
    skills       = Column(JSONB, default=list)         # ["Python", "AWS", ...]
    experience   = Column(JSONB, default=list)         # [{title, company, duration, bullets}]
    projects     = Column(JSONB, default=list)         # [{name, description, tech}]
    created_at   = Column(DateTime(timezone=True), server_default=func.now())