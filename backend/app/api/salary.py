from fastapi import APIRouter, Depends, HTTPException
from app.schemas.salary import SalaryRequest, SalaryResponse, SalaryRange
from app.services.salary_service import estimate_salary
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/estimate", response_model=SalaryResponse)
async def get_salary_estimate(
    request: SalaryRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        data = await estimate_salary(
            role=request.role,
            location=request.location,
            experience_level=request.experience_level,
            skills=request.skills
        )
        return SalaryResponse(
            role=request.role,
            location=request.location,
            experience_level=request.experience_level,
            salary_range=SalaryRange(**data["salary_range"]),
            market_context=data["market_context"],
            top_companies=data["top_companies"],
            negotiation_tips=data["negotiation_tips"],
            confidence=data["confidence"],
            disclaimer=data["disclaimer"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))