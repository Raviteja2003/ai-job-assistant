from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.user import User
from app.config import settings

# Tells passlib to use bcrypt algorithm for hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

def hash_password(password: str) -> str:
    # "password123" → "$2b$12$abc...xyz" (irreversible hash)
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    # Checks if plain password matches the stored hash
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: int, email: str) -> str:
    # JWT payload - data we embed inside the token
    payload = {
        "sub": str(user_id),       # subject = who this token belongs to
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    # Sign the token with our SECRET_KEY so we can verify it later
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def register_user(db: Session, name: str, email: str, password: str) -> User:
    # Check if email already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("Email already registered")
    
    user = User(
        name=name,
        email=email,
        password=hash_password(password)   # NEVER store plain text
    )
    db.add(user)
    db.commit()
    db.refresh(user)   # reload from DB to get the generated id
    return user

def login_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    
    # Same error message for both cases - don't tell attackers which one failed
    if not user or not verify_password(password, user.password):
        raise ValueError("Invalid email or password")
    
    return user