from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

# This is the actual connection to PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# A session is like a conversation with the DB
# Each request gets its own session, then it closes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all our models (tables) will inherit from
class Base(DeclarativeBase):
    pass

# This function gives each API request its own DB session
# and guarantees it closes when the request is done
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()