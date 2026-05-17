from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db import Base


class TrackedJob(Base):
    __tablename__ = "tracked_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    job_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    salary = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    # status: saved | applied | interview | offer | rejected
    status = Column(String, nullable=False, default="saved")

    applied_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())