from pydantic import BaseModel, EmailStr

# What the frontend sends to /register
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr        # pydantic validates it's a real email format
    password: str

# What the frontend sends to /login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# What we send BACK after successful register or login
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str