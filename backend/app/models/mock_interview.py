from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.db import Base

class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    status = Column(String, default="active")        # active | completed
    total_questions = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    messages = relationship("MockInterviewMessage", back_populates="session", order_by="MockInterviewMessage.turn")


class MockInterviewMessage(Base):
    __tablename__ = "mock_interview_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("mock_interviews.id"), nullable=False)
    turn = Column(Integer, nullable=False)            # 1-5
    question = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)            # 1-10
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("MockInterview", back_populates="messages")