from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db import Base

class Resume(Base):
    __tablename__ = "resumes"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename   = Column(String, nullable=False)
    raw_text   = Column(Text, nullable=False)

    # Identity fields parsed from the resume
    name       = Column(String, nullable=True)         # "Ravi Teja"
    contact    = Column(JSONB, default=dict)            # {email, phone, linkedin, location}
    summary    = Column(Text, nullable=True)            # professional summary / objective

    # Structured sections
    skills     = Column(JSONB, default=list)            # ["Python", "AWS", ...]
    experience = Column(JSONB, default=list)            # [{title, company, dates, bullets}]
    projects   = Column(JSONB, default=list)            # [{name, description, tech, dates, bullets}]
    education  = Column(JSONB, default=list)            # [{institution, degree, dates}]

    created_at = Column(DateTime(timezone=True), server_default=func.now())