from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.api import auth

# Import models so SQLAlchemy knows about them when creating tables
from app.models import user  # noqa

app = FastAPI(title="AI Job Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables on startup if they don't exist
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

# Include auth routes
app.include_router(auth.router)

@app.get("/health")
def health():
    return {"status": "ok"}