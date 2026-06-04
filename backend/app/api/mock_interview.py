from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobDescription
from app.models.mock_interview import MockInterview, MockInterviewMessage
from app.schemas.mock_interview import (
    StartRequest, StartResponse,
    RespondRequest, RespondResponse,
    AnswerFeedback, FinalReport,
    SessionOut, SessionSummary,
)
from app.services import mock_interview_service

router = APIRouter(prefix="/mock-interview", tags=["mock-interview"])


@router.post("/start", response_model=StartResponse)
def start_session(
    body: StartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(
        Resume.id == body.resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found")

    job = db.query(JobDescription).filter(
        JobDescription.id == body.job_id,
        JobDescription.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(404, "Job not found")

    question = mock_interview_service.generate_first_question(
        resume_text=resume.raw_text,
        job_text=job.raw_text,
        role=job.role or "the position",
        company=job.company or "the company",
    )

    session = MockInterview(
        user_id=current_user.id,
        resume_id=body.resume_id,
        job_id=body.job_id,
        total_questions=body.total_questions,
        status="active",
    )
    db.add(session)
    db.flush()

    msg = MockInterviewMessage(
        session_id=session.id,
        turn=1,
        question=question,
    )
    db.add(msg)
    db.commit()
    db.refresh(session)

    return StartResponse(
        session_id=session.id,
        question=question,
        turn=1,
        total_questions=session.total_questions,
    )


@router.post("/{session_id}/respond", response_model=RespondResponse)
def respond(
    session_id: int,
    body: RespondRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(MockInterview).filter(
        MockInterview.id == session_id,
        MockInterview.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(404, "Session not found")
    if session.status == "completed":
        raise HTTPException(400, "Session already completed")

    # Find the unanswered message (pending question for this turn)
    current_msg = db.query(MockInterviewMessage).filter(
        MockInterviewMessage.session_id == session_id,
        MockInterviewMessage.user_answer == None
    ).order_by(MockInterviewMessage.turn).first()
    if not current_msg:
        raise HTTPException(400, "No pending question found")

    resume = db.query(Resume).filter(Resume.id == session.resume_id).first()
    job = db.query(JobDescription).filter(JobDescription.id == session.job_id).first()

    # Build conversation history — previously answered turns
    answered_msgs = db.query(MockInterviewMessage).filter(
        MockInterviewMessage.session_id == session_id,
        MockInterviewMessage.user_answer != None
    ).order_by(MockInterviewMessage.turn).all()

    history = [
        {"turn": m.turn, "question": m.question, "answer": m.user_answer}
        for m in answered_msgs
    ]
    # Append current turn so service has full context
    history.append({
        "turn": current_msg.turn,
        "question": current_msg.question,
        "answer": body.answer
    })

    result = mock_interview_service.evaluate_answer_and_next_question(
        resume_text=resume.raw_text,
        job_text=job.raw_text,
        role=job.role or "the position",
        company=job.company or "the company",
        conversation_history=history,
        current_answer=body.answer,
        current_turn=current_msg.turn,
        total_questions=session.total_questions,
    )

    # Persist answer + feedback onto current message
    current_msg.user_answer = body.answer
    current_msg.ai_feedback = result["feedback"]
    current_msg.score = result["score"]

    is_complete = current_msg.turn >= session.total_questions
    next_question = result.get("next_question")

    # Guard: Gemini must return a next question on non-final turns
    if not is_complete and not next_question:
        raise HTTPException(500, "AI failed to generate the next question. Please retry.")

    final_report = None

    if is_complete:
        session.status = "completed"

        # Build full message list for final report (include current msg with fresh data)
        all_msgs = db.query(MockInterviewMessage).filter(
            MockInterviewMessage.session_id == session_id
        ).order_by(MockInterviewMessage.turn).all()

        report_msgs = []
        for m in all_msgs:
            if m.id == current_msg.id:
                report_msgs.append({
                    "turn": m.turn,
                    "question": m.question,
                    "answer": body.answer,
                    "score": result["score"],
                    "feedback": result["feedback"],
                })
            else:
                report_msgs.append({
                    "turn": m.turn,
                    "question": m.question,
                    "answer": m.user_answer,
                    "score": m.score,
                    "feedback": m.ai_feedback,
                })

        report_data = mock_interview_service.generate_final_report(
            resume_text=resume.raw_text,
            job_text=job.raw_text,
            role=job.role or "the position",
            company=job.company or "the company",
            messages=report_msgs,
        )
        final_report = FinalReport(**report_data)

    else:
        # Save next question as the new pending message
        next_msg = MockInterviewMessage(
            session_id=session_id,
            turn=current_msg.turn + 1,
            question=next_question,
        )
        db.add(next_msg)

    db.commit()

    return RespondResponse(
        turn=current_msg.turn,
        question=next_question,
        feedback=AnswerFeedback(
            score=result["score"],
            feedback=result["feedback"],
            strengths=result.get("strengths", []),
            improvements=result.get("improvements", []),
        ),
        is_complete=is_complete,
        final_report=final_report,
    )


@router.get("/", response_model=list[SessionSummary])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(MockInterview)
        .filter(MockInterview.user_id == current_user.id)
        .order_by(MockInterview.created_at.desc())
        .all()
    )


@router.get("/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(MockInterview).filter(
        MockInterview.id == session_id,
        MockInterview.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(MockInterview).filter(
        MockInterview.id == session_id,
        MockInterview.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(404, "Session not found")

    db.query(MockInterviewMessage).filter(
        MockInterviewMessage.session_id == session_id
    ).delete()
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}