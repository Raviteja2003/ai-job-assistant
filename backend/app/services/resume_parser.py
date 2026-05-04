import io
import json
import pdfplumber
import docx
import anthropic
from app.config import settings

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    return text.strip()

def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def parse_resume_with_ai(raw_text: str) -> dict:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    prompt = f"""You are a resume parser. Extract structured information from the resume below.

Return ONLY a valid JSON object with exactly this structure, no extra text:
{{
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2022 - Present",
      "bullets": ["responsibility 1", "responsibility 2"]
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "What it does",
      "tech": ["tech1", "tech2"]
    }}
  ]
}}

Resume text:
{raw_text}"""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = message.content[0].text.strip()

    # Strip markdown code blocks if Claude wraps in ```json
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]
    
    return json.loads(response_text)