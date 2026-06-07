import json
import re
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def estimate_salary(role: str, location: str, experience_level: str, skills: list[str]) -> dict:
    skills_str = ", ".join(skills) if skills else "general"

    prompt = f"""You are a compensation expert with up-to-date knowledge of tech industry salaries globally.

Estimate the market salary for the following profile:
- Role: {role}
- Location: {location}
- Experience Level: {experience_level}
- Key Skills: {skills_str}

Return ONLY a JSON object with this exact structure:
{{
  "salary_range": {{
    "min": <integer, no commas>,
    "max": <integer, no commas>,
    "currency": "<3-letter ISO code, e.g. USD, INR, GBP — infer from location>",
    "period": "<'per year' or 'per month' — use whichever is standard for this location>"
  }},
  "market_context": "<2-3 sentences about market conditions for this role/location>",
  "top_companies": ["<company1>", "<company2>", "<company3>", "<company4>", "<company5>"],
  "negotiation_tips": ["<tip1>", "<tip2>", "<tip3>"],
  "confidence": "<'low', 'medium', or 'high' based on data availability>",
  "disclaimer": "<one sentence noting this is an AI estimate, not financial advice>"
}}

Rules:
- Infer currency from location (Hyderabad/Bangalore/India → INR, US cities → USD, London/UK → GBP, etc.)
- Use 'per month' for India, 'per year' for US/UK/EU
- Return ONLY the JSON. No markdown, no explanation."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip()
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()

    return json.loads(raw)