import json
import re
from google import genai
from app.config import settings

def parse_job_with_ai(raw_text: str) -> dict:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""You are a job description parser. Extract structured information from the job description below.
Return ONLY a valid JSON object with exactly this structure, no extra text:
{{
  "required_skills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"]
}}

Job description:
{raw_text}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    response_text = response.text.strip()
    response_text = re.sub(r"^```(?:json)?\s*", "", response_text)
    response_text = re.sub(r"\s*```$", "", response_text)
    response_text = response_text.strip()

    print(f"[job_parser] Gemini raw response:\n{response_text[:500]}")

    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"[job_parser] JSON parse error: {e}")
        raise ValueError(f"Gemini returned invalid JSON: {e}")