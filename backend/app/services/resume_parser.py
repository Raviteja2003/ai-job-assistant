import io
import json
import re
import pdfplumber
import docx
from google import genai
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
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""You are a resume parser. Extract structured information from the resume below.

Return ONLY a valid JSON object with exactly this structure, no extra text:
{{
  "name": "Full Name",
  "contact": {{
    "email": "email@example.com",
    "phone": "+1 234 567 8900",
    "linkedin": "linkedin.com/in/handle",
    "location": "City, Country"
  }},
  "summary": "One or two sentence professional summary from the resume, or empty string if not present.",
  "skills": ["skill1", "skill2"],
  "experience": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "dates": "Jan 2022 - Present",
      "bullets": ["responsibility 1", "responsibility 2"]
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "What it does",
      "tech": ["tech1", "tech2"],
      "dates": "Jan 2023 - Mar 2023",
      "bullets": ["what was built", "impact or outcome"]
    }}
  ],
  "education": [
    {{
      "institution": "University Name",
      "degree": "Bachelor of Science in Computer Science",
      "dates": "2018 - 2022"
    }}
  ]
}}

If a field is not present in the resume, use an empty string, empty list, or empty object as appropriate.

Resume text:
{raw_text}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    response_text = response.text.strip()

    # Strip markdown fences
    response_text = re.sub(r"^```(?:json)?\s*", "", response_text)
    response_text = re.sub(r"\s*```$", "", response_text)
    response_text = response_text.strip()

    print(f"[resume_parser] Gemini raw response:\n{response_text[:500]}")

    try:
        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"[resume_parser] JSON parse error: {e}")
        print(f"[resume_parser] Full response:\n{response_text}")
        raise ValueError(f"Gemini returned invalid JSON: {e}")