import json
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_interview_questions(
    resume_text: str,
    job_raw_text: str,
    skills: list,
    company: str,
    role: str,
) -> dict:
    prompt = f"""
You are an expert technical interviewer. Based on the resume and job description below, generate exactly 10 interview questions.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_raw_text}

CANDIDATE SKILLS: {", ".join(skills)}
COMPANY: {company}
ROLE: {role}

Return ONLY a valid JSON object with this exact structure:
{{
  "questions": [
    {{
      "question": "...",
      "category": "behavioral" | "technical" | "role-specific" | "situational",
      "difficulty": "easy" | "medium" | "hard",
      "sample_answer": "A 2-3 sentence strong answer the candidate could give."
    }}
  ],
  "tips": [
    "3 to 5 short interview tips specific to this role and company."
  ]
}}

Rules:
- Include at least 2 questions per category: behavioral, technical, role-specific, situational
- Difficulty distribution: 3 easy, 4 medium, 3 hard
- sample_answer should be specific to the candidate's resume, not generic
- tips should reference the company name and role
- Return ONLY the JSON, no markdown fences, no preamble
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    raw = response.text.strip()
    # Strip markdown fences if Gemini wraps anyway
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    data = json.loads(raw)
    return data