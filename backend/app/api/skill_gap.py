from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse
from app.services.skill_gap_service import generate_skill_gap_resources

router = APIRouter()

@router.post("/resources", response_model=SkillGapResponse)
async def get_skill_gap_resources(
    request: SkillGapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not request.missing_skills:
        return SkillGapResponse(role=request.role, items=[], learning_path=[])

    try:
        data = await generate_skill_gap_resources(
            missing_skills=request.missing_skills,
            role=request.role,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return SkillGapResponse(
        role=request.role,
        items=data.get("items", []),
        learning_path=data.get("learning_path", []),
    )