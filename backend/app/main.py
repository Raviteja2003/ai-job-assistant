from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.api import auth, resume
from app.models import user, resume as resume_model  # noqa
from app.api.job import router as job_router
from app.api import tailor
from app.api.cover_letter import router as cover_letter_router
from app.api.tracker import router as tracker_router
from app.api import interview
from app.api import skill_gap

app = FastAPI(title="AI Job Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(job_router)
app.include_router(tailor.router, prefix="/tailor", tags=["tailor"])
app.include_router(cover_letter_router, prefix="/cover-letter", tags=["cover-letter"])
app.include_router(tracker_router, prefix="/tracker", tags=["tracker"])
app.include_router(interview.router, prefix="/interview", tags=["interview"])
app.include_router(skill_gap.router, prefix="/skill-gap", tags=["skill-gap"])

@app.get("/health")
def health():
    return {"status": "ok"}