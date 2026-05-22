import json
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

EMAIL_TYPE_CONTEXT = {
    "follow-up": "a follow-up email sent after submitting a job application to express continued interest and check on the status",
    "thank-you": "a thank-you email sent after a job interview to express gratitude and reinforce interest in the role",
    "withdrawal": "a professional withdrawal email to politely remove the candidate from consideration while maintaining a positive relationship",
}

async def generate_email(
    resume_text: str,
    job_raw_text: str,
    company: str,
    role: str,
    email_type: str,
    tone: str,
    interviewer_name: str | None = None,
    days_since_applied: int | None = None,
) -> dict:
    type_context = EMAIL_TYPE_CONTEXT.get(email_type, "a professional job application email")

    extra_context = ""
    if interviewer_name:
        extra_context += f"\nThe interviewer's name is {interviewer_name}."
    if days_since_applied:
        extra_context += f"\nIt has been {days_since_applied} days since the candidate applied."

    prompt = f"""
You are an expert career coach helping a candidate write {type_context}.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_raw_text}

COMPANY: {company}
ROLE: {role}
EMAIL TYPE: {email_type}
TONE: {tone}{extra_context}

Write a {tone} {email_type} email for this candidate applying to the {role} position at {company}.

Return ONLY a valid JSON object with this exact structure:
{{
  "subject": "Email subject line here",
  "body": "Full email body here, with proper line breaks using \\n"
}}

Rules:
- Subject should be concise and professional
- Body should be 3-4 short paragraphs
- Use the candidate's actual experience and skills from the resume to make it specific
- Reference the company name and role naturally
- Tone must match: formal = professional language, casual = friendly but still professional, enthusiastic = energetic and excited
- For thank-you: reference the interview and interviewer if name provided
- For follow-up: mention days since applied if provided, express continued interest
- For withdrawal: be gracious and professional, leave door open for future opportunities
- Do NOT include placeholder text like [Your Name] — end the email naturally
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