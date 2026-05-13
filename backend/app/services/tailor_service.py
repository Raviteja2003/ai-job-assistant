import json
import re
from google import genai
from app.config import settings


client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _clean_json(text: str) -> str:
    """Strip markdown code fences if Gemini wraps the response."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


async def analyze_resume_vs_job(
    resume_raw_text: str,
    resume_skills: list[str],
    resume_experience: list,
    resume_projects: list,
    job_raw_text: str,
    job_required_skills: list[str],
    job_responsibilities: list[str],
) -> dict:
    """
    Compare a resume against a job description using Gemini.
    Returns a dict matching TailorResponse schema.
    """

    prompt = f"""
You are an expert resume coach and ATS optimization specialist.

Compare the candidate's resume against the job description below and return a structured analysis.

---
RESUME SKILLS: {json.dumps(resume_skills)}

RESUME EXPERIENCE (JSON): {json.dumps(resume_experience)}

RESUME PROJECTS (JSON): {json.dumps(resume_projects)}

FULL RESUME TEXT:
{resume_raw_text}

---
JOB REQUIRED SKILLS: {json.dumps(job_required_skills)}

JOB RESPONSIBILITIES: {json.dumps(job_responsibilities)}

FULL JOB DESCRIPTION:
{job_raw_text}

---
INSTRUCTIONS:
1. Calculate a match_score from 0 to 100 based on how well the resume aligns with the job.
2. List matched_skills — skills present in both resume and job requirements.
3. List missing_skills — skills required by the job but absent from the resume.
4. For each bullet point found in the resume experience and projects sections, provide an improved version that:
   - Uses strong action verbs
   - Adds quantifiable impact where possible
   - Incorporates relevant job keywords naturally
   - Is ATS-optimized
   Only improve bullets that are relevant to this specific job. Skip unrelated ones.
5. Write a short summary (2–3 sentences) of the overall fit and top recommendation.

Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.
Format:
{{
  "match_score": <integer 0-100>,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "improved_bullets": [
    {{"original": "...", "improved": "..."}},
    ...
  ],
  "summary": "..."
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    raw = _clean_json(response.text)
    result = json.loads(raw)

    # Ensure match_score is clamped to 0–100
    result["match_score"] = max(0, min(100, int(result.get("match_score", 0))))

    return result