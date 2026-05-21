import json
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

async def generate_skill_gap_resources(
    missing_skills: list[str],
    role: str,
) -> dict:
    if not missing_skills:
        return {"items": [], "learning_path": []}

    skills_str = ", ".join(missing_skills)

    prompt = f"""
You are a senior engineering mentor. A candidate is missing these skills for a {role} role: {skills_str}.

Return ONLY a valid JSON object with this exact structure:
{{
  "items": [
    {{
      "skill": "skill name",
      "priority": "high" | "medium" | "low",
      "context": "One sentence explaining why this skill matters for a {role}.",
      "resources": [
        {{
          "title": "Resource name",
          "type": "course" | "documentation" | "project idea" | "book",
          "url": "https://...",
          "duration": "e.g. 6 hours or 3 weeks",
          "level": "beginner" | "intermediate" | "advanced",
          "why": "One sentence on why this specific resource is valuable."
        }}
      ]
    }}
  ],
  "learning_path": [
    "Step 1: Start with X because...",
    "Step 2: Move to Y once...",
    "Step 3: ..."
  ]
}}

Rules:
- Cover every skill in: {skills_str}
- Assign priority: high if critical to the role, medium if useful, low if nice-to-have
- Provide exactly 2-3 resources per skill
- Resources must be real, well-known sources (Coursera, Udemy, official docs, freeCodeCamp, YouTube, etc.)
- URLs must be real and accurate — use the actual homepage of the course/doc if unsure of exact URL
- learning_path should be 3-5 ordered steps covering all skills in priority order
- Return ONLY the JSON, no markdown fences, no preamble
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)