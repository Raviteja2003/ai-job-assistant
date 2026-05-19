from pydantic import BaseModel
from typing import List

class SkillGapRequest(BaseModel):
    missing_skills: List[str]
    role: str
    job_id: int  # for context only, not DB lookup

class LearningResource(BaseModel):
    title: str
    type: str        # "course" | "documentation" | "project idea" | "book"
    url: str
    duration: str    # e.g. "4 hours", "2 weeks"
    level: str       # "beginner" | "intermediate" | "advanced"
    why: str         # why this is relevant to the role

class SkillGapItem(BaseModel):
    skill: str
    priority: str    # "high" | "medium" | "low"
    context: str     # 1-sentence why this skill matters for the role
    resources: List[LearningResource]

class SkillGapResponse(BaseModel):
    role: str
    items: List[SkillGapItem]
    learning_path: List[str]   # ordered list: "Start with X, then Y..."