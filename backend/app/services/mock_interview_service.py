import json
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _build_context(resume_text: str, job_text: str, role: str, company: str) -> str:
    return f"""You are an expert technical interviewer at {company} hiring for the role: {role}.

Candidate's Resume:
{resume_text[:3000]}

Job Description:
{job_text[:2000]}"""


def generate_first_question(resume_text: str, job_text: str, role: str, company: str) -> str:
    context = _build_context(resume_text, job_text, role, company)
    prompt = f"""{context}

Start the mock interview. Ask ONE strong opening interview question.
It should be relevant to the role and the candidate's background.
Mix behavioral and technical questions across the session.
Respond with ONLY the question text — no preamble, no labels."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text.strip()


def evaluate_answer_and_next_question(
    resume_text: str,
    job_text: str,
    role: str,
    company: str,
    conversation_history: list[dict],
    current_answer: str,
    current_turn: int,
    total_questions: int,
) -> dict:
    context = _build_context(resume_text, job_text, role, company)

    history_text = ""
    for item in conversation_history[:-1]:  # exclude current turn from history display
        history_text += f"\nQ{item['turn']}: {item['question']}\nA{item['turn']}: {item['answer']}\n"

    is_last = current_turn >= total_questions

    if is_last:
        json_schema = """{
  "score": <1-10 integer>,
  "feedback": "<2-3 sentence evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "next_question": null
}"""
        next_q_instruction = "This was the FINAL question. Set next_question to null."
    else:
        json_schema = f"""{{
  "score": <1-10 integer>,
  "feedback": "<2-3 sentence evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "next_question": "<write question {current_turn + 1} of {total_questions} here — must not be null or empty>"
}}"""
        next_q_instruction = (
            f"You MUST generate the next interview question as question {current_turn + 1} of {total_questions}. "
            f"next_question must be a non-empty string. "
            f"Vary the type — mix behavioral, technical, situational, and role-specific questions."
        )

    prompt = f"""{context}

Interview conversation so far:
{history_text}
Current question (Q{current_turn}): {conversation_history[-1]['question']}
Candidate's answer: {current_answer}

Evaluate this answer and respond in JSON only (no markdown fences):
{json_schema}

{next_q_instruction}
Respond ONLY with the raw JSON object."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(text)


def generate_final_report(
    resume_text: str,
    job_text: str,
    role: str,
    company: str,
    messages: list[dict],
) -> dict:
    context = _build_context(resume_text, job_text, role, company)

    full_transcript = ""
    for m in messages:
        full_transcript += f"\nQ{m['turn']}: {m['question']}\nA: {m['answer']}\nScore: {m['score']}/10 — {m['feedback']}\n"

    prompt = f"""{context}

Complete interview transcript:
{full_transcript}

Generate a comprehensive final interview report in JSON only (no markdown fences):
{{
  "overall_score": <float 1.0-10.0, average of all scores>,
  "strengths": ["<overall strength 1>", "<overall strength 2>", "<overall strength 3>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>"],
  "recommendation": "<one of: Strong Hire | Hire | No Hire>"
}}

Respond ONLY with the raw JSON object."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip().replace("```json", "").replace("```", "").strip()
    return json.loads(text)