from sqlalchemy import Column, Integer, String, Float, ForeignKey, ARRAY, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.db import Base

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    version_name = Column(String, nullable=False)        # "{Company} — {Role}"
    match_score = Column(Float, nullable=False)
    missing_skills = Column(ARRAY(String), default=[])
    improved_bullets = Column(JSONB, default=[])         # list of {original, improved}
    created_at = Column(DateTime(timezone=True), server_default=func.now())