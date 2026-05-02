from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services.auth_service import register_user, login_user, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(db, body.name, body.email, body.password)
        token = create_access_token(user.id, user.email)
        return TokenResponse(
            access_token=token,
            user_id=user.id,
            name=user.name,
            email=user.email
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = login_user(db, body.email, body.password)
        token = create_access_token(user.id, user.email)
        return TokenResponse(
            access_token=token,
            user_id=user.id,
            name=user.name,
            email=user.email
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))