from sqlalchemy import Column, Integer, String, Text, ARRAY, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.db import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=False)
    required_skills = Column(ARRAY(String), default=[])
    responsibilities = Column(ARRAY(Text), default=[])
    created_at = Column(DateTime, default=datetime.utcnow)