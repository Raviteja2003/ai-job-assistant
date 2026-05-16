from google import genai
from app.config import settings


client = genai.Client(api_key=settings.GEMINI_API_KEY)


TONE_INSTRUCTIONS = {
    "formal": (
        "Write in a highly professional, formal tone. Use complete sentences, "
        "structured paragraphs, and business-appropriate language. Avoid contractions "
        "and colloquialisms. The letter should feel polished and executive."
    ),
    "casual": (
        "Write in a warm, conversational tone. Be personable and approachable while "
        "still being professional. Use natural language, light contractions are fine. "
        "The letter should feel genuine and human, not stiff."
    ),
    "creative": (
        "Write in a bold, memorable tone that stands out. Open with a compelling hook "
        "or anecdote. Show personality and enthusiasm. Take creative risks with "
        "phrasing while keeping it relevant and professional enough for a job application."
    ),
}


def generate_cover_letter(
    resume_text: str,
    job_text: str,
    company: str,
    role: str,
    tone: str,
    candidate_name: str,
) -> str:
    tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["formal"])

    prompt = f"""You are an expert career coach and professional writer.
Generate a tailored cover letter for the following job application.

TONE INSTRUCTION:
{tone_instruction}

CANDIDATE NAME: {candidate_name}
COMPANY: {company}
ROLE: {role}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_text}

INSTRUCTIONS:
- Write a complete, ready-to-send cover letter (no placeholders like [Your Name])
- Use the candidate's actual name: {candidate_name}
- Address it to "Hiring Manager" at {company}
- 3–4 paragraphs: opening hook, why this role/company, relevant accomplishments from the resume, closing call to action
- Highlight 2–3 specific skills or experiences from the resume that directly match the job description
- Keep it under 400 words
- Do NOT include a subject line or email headers — just the letter body starting from "Dear Hiring Manager,"
- End with a professional sign-off and the candidate's name

Return ONLY the cover letter text. No preamble, no explanation, no markdown.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text.strip()