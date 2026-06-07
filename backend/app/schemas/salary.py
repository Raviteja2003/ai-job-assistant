from pydantic import BaseModel
from typing import List

class SalaryRequest(BaseModel):
    role: str
    location: str
    experience_level: str  # "entry", "mid", "senior", "lead"
    skills: List[str]

class SalaryRange(BaseModel):
    min: int
    max: int
    currency: str
    period: str  # "per year", "per month"

class SalaryResponse(BaseModel):
    role: str
    location: str
    experience_level: str
    salary_range: SalaryRange
    market_context: str
    top_companies: List[str]
    negotiation_tips: List[str]
    confidence: str  # "low", "medium", "high"
    disclaimer: str