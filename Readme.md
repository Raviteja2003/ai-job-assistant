# 🧠 AI Job Assistant

An AI-powered job application toolkit that helps you tailor your resume, generate cover letters, prep for interviews, and track your job search — all in one place.

---

## ✨ Features

- **Resume Upload & Parsing** — Upload PDF or DOCX resumes; AI extracts name, contact info, skills, experience, projects, education, and summary automatically
- **Job Description Parser** — Paste any job description; AI extracts required skills and responsibilities
- **Resume Tailoring** — Get a match score, identify missing skills, and receive AI-improved bullet points for your resume
- **Resume Version Manager** — Save multiple tailored resume versions per job application and manage them from a dedicated page
- **Export to PDF** — Download tailored resumes as professionally formatted PDFs with AI-improved bullets highlighted, and cover letters as PDFs
- **Salary Insights** — Get AI-estimated market salary ranges based on role, location, experience level, and skills; auto-detects currency by location (USD, INR, GBP, etc.) with market context, top paying companies, negotiation tips, and confidence rating
- **Cover Letter Generator** — Generate tailored cover letters in Formal, Casual, or Creative tone
- **Job Tracker** — Track every application from Saved → Applied → Interview → Offer / Rejected with notes, salary, and links
- **Interview Prep AI** — Generate tailored interview questions from your resume and job description, categorized by type and difficulty with sample answers
- **AI Mock Interview** — Practice with a chat-style mock interview tailored to your resume and job description; get per-answer scores, strengths, and improvement tips, plus a final hiring report with an overall score and recommendation
- **Skill Gap Analyzer** — Get personalized learning resources for every missing skill, with priority ratings and a recommended learning path
- **Email Generator** — Generate professional Follow-Up, Thank-You, and Withdrawal emails tailored to your resume and the role
- **Analytics Dashboard** — Visualize your job search pipeline with an application funnel, activity timeline, status breakdown, and response/offer rates

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS + Zustand + React Router |
| Backend | FastAPI + Python + SQLAlchemy + JWT Auth |
| Database | PostgreSQL |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| PDF Generation | WeasyPrint |
| DevOps | Docker + Docker Compose |

---

## 📁 Project Structure

```text
ai-job-assistant/
├── docker-compose.yml
├── .env
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   │
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── db.py
│       │
│       ├── models/
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── resume.py
│       │   ├── resume_version.py
│       │   ├── job.py
│       │   ├── mock_interview.py
│       │   └── tracked_job.py
│       │
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── resume.py
│       │   ├── resume_version.py
│       │   ├── salary.py
│       │   ├── job.py
│       │   ├── tailor.py
│       │   ├── cover_letter.py
│       │   ├── tracker.py
│       │   ├── interview.py
│       │   ├── mock_interview.py
│       │   ├── skill_gap.py
│       │   └── email_generator.py
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── resume_parser.py
│       │   ├── job_parser.py
│       │   ├── mock_interview_service.py
│       │   ├── tailor_service.py
│       │   ├── cover_letter_service.py
│       │   ├── interview_service.py
│       │   ├── skill_gap_service.py
│       │   ├── email_service.py
│       │   ├── salary_service.py
│       │   └── pdf_service.py
│       │
│       └── api/
│           ├── __init__.py
│           ├── deps.py
│           ├── auth.py
│           ├── resume.py
│           ├── resume_version.py
│           ├── job.py
│           ├── tailor.py
│           ├── cover_letter.py
│           ├── tracker.py
│           ├── interview.py
│           ├── mock_interview.py
│           ├── skill_gap.py
│           ├── email_generator.py
│           ├── salary.py
│           └── pdf_export.py
│
└── frontend/
    ├── Dockerfile
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    │
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        │
        ├── types/
        │   └── index.ts
        │
        ├── store/
        │   └── authStore.ts
        │
        ├── api/
        │   ├── auth.ts
        │   ├── resume.ts
        │   ├── job.ts
        │   ├── tailor.ts
        │   ├── coverLetter.ts
        │   ├── tracker.ts
        │   ├── interview.ts
        │   ├── mockInterview.ts
        │   ├── skillGap.ts
        │   ├── emailGenerator.ts
        │   ├── resume_version.ts
        │   ├── salary.ts
        │   └── pdfExport.ts
        │
        ├── components/
        │   ├── ProtectedRoute.tsx
        │   ├── Sidebar.tsx
        │   ├── AppLayout.tsx
        │   ├── ResumeDetailModal.tsx
        │   └── JobDetailModal.tsx
        │
        └── pages/
            ├── Login.tsx
            ├── Register.tsx
            ├── Home.tsx
            ├── Dashboard.tsx
            ├── ResumeVersions.tsx
            ├── SalaryInsights.tsx
            ├── CoverLetter.tsx
            ├── Tracker.tsx
            ├── InterviewPrep.tsx
            ├── MockInterview.tsx
            ├── EmailGenerator.tsx
            └── Analytics.tsx
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-job-assistant.git
cd ai-job-assistant
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=assistant
DATABASE_URL=postgresql://jobuser:jobpassword@db:5432/jobassistant

# Auth
SECRET_KEY=your-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

# AI
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Start the application

```bash
docker compose up --build
```

This starts all three containers:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### 4. Register and start using

Navigate to `http://localhost:3000`, create an account, and you're ready to go.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |

### Resume
| Method | Endpoint | Description |
|---|---|---|
| POST | `/resume/upload` | Upload and AI-parse a resume (extracts name, contact, summary, skills, experience, projects, education) |
| GET | `/resume/` | List all resumes |
| GET | `/resume/{id}` | Get resume by ID |
| DELETE | `/resume/{id}` | Delete a resume (cascades to mock interviews and resume versions) |

### Job Description
| Method | Endpoint | Description |
|---|---|---|
| POST | `/job/add` | Add and AI-parse a job description |
| GET | `/job/` | List all job descriptions |
| GET | `/job/{id}` | Get job by ID |
| DELETE | `/job/{id}` | Delete a job |

### Tailor
| Method | Endpoint | Description |
|---|---|---|
| POST | `/tailor/analyze` | Analyze resume vs job description — returns match score, missing skills, and improved bullets |

### Resume Versions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/resume-versions/save` | Save a tailored resume version |
| GET | `/resume-versions/` | List all saved resume versions |
| GET | `/resume-versions/{id}` | Get a specific resume version |
| DELETE | `/resume-versions/{id}` | Delete a resume version |

### Export to PDF
| Method | Endpoint | Description |
|---|---|---|
| GET | `/export/resume-version/{id}` | Export a tailored resume as a full formatted PDF with AI-improved bullets merged in |
| POST | `/export/cover-letter` | Export a cover letter as PDF |

### Salary Insights
| Method | Endpoint | Description |
|---|---|---|
| POST | `/salary/estimate` | Estimate market salary range based on role, location, experience level, and skills |

### Cover Letter
| Method | Endpoint | Description |
|---|---|---|
| POST | `/cover-letter/generate` | Generate a tailored cover letter |

### Job Tracker
| Method | Endpoint | Description |
|---|---|---|
| POST | `/tracker/` | Add a tracked job |
| GET | `/tracker/` | List all tracked jobs (optional `?status=` filter) |
| GET | `/tracker/stats` | Get counts per status |
| GET | `/tracker/timeline` | Get daily activity for last 30 days |
| GET | `/tracker/{id}` | Get tracked job by ID |
| PATCH | `/tracker/{id}` | Update a tracked job |
| DELETE | `/tracker/{id}` | Delete a tracked job |

### Interview Prep
| Method | Endpoint | Description |
|---|---|---|
| POST | `/interview/generate` | Generate interview questions from resume + job |

### Skill Gap
| Method | Endpoint | Description |
|---|---|---|
| POST | `/skill-gap/resources` | Get learning resources for missing skills |

### Email Generator
| Method | Endpoint | Description |
|---|---|---|
| POST | `/email/generate` | Generate a job application email |

### AI Mock Interview
| Method | Endpoint | Description |
|---|---|---|
| POST | `/mock-interview/start` | Start a new mock interview session |
| POST | `/mock-interview/{session_id}/respond` | Submit answer; returns per-answer feedback and final hiring report on last turn |
| GET | `/mock-interview/` | List all mock interview sessions |
| GET | `/mock-interview/{session_id}` | Get session details |
| DELETE | `/mock-interview/{session_id}` | Delete a session |

---

## 🗺️ Roadmap

### Phase 1 — Complete ✅
- [x] Auth — Register, login, JWT
- [x] Resume upload + AI parsing
- [x] Job description input + AI parsing
- [x] AI resume tailoring (match score, missing skills, improved bullets)
- [x] Cover letter generator (Formal / Casual / Creative tone)
- [x] Job tracker dashboard (CRUD + status pipeline)

### Phase 2 — Complete ✅
- [x] Interview Prep AI — 10 categorized questions with difficulty tags and sample answers
- [x] Skill Gap Analyzer — prioritized learning resources and recommended learning path
- [x] Email Generator — Follow-Up, Thank-You, and Withdrawal emails with tone selection

### Phase 3 — Complete ✅
- [x] Analytics Dashboard — application funnel, activity timeline, status breakdown, response rate and offer rate charts

### Phase 4 — Complete ✅
- [x] AI Mock Interview — chat-style mock interview with per-answer AI feedback and a final hiring report

### Phase 5 — Complete ✅
- [x] Resume Version Manager — save multiple tailored resume versions per job, view and delete from a dedicated page
- [x] Export to PDF — download tailored resumes as professionally formatted PDFs (with AI-improved bullets merged in) and cover letters as PDFs
- [x] Salary Insights — AI-estimated market salary range based on role, skills, and location with auto-detected currency, market context, top paying companies, and negotiation tips

---

## 🔧 Development Notes

- Database tables are **auto-created** on startup via `Base.metadata.create_all` — no manual migrations needed
- New columns added after initial setup require a manual `ALTER TABLE` — see below
- Live reload is enabled via Docker volumes — no rebuild needed for code changes
- Rebuild containers only when changing `requirements.txt`:

```bash
docker compose up --build
```

### Manual DB migrations (if upgrading an existing instance)

If you started the app before Resume Version Manager and PDF export were added, run these once against your running DB container:

```bash
docker exec -it job_assistant_db psql -U jobuser -d jobassistant -c "
  ALTER TABLE resumes ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]';
  ALTER TABLE resumes ADD COLUMN IF NOT EXISTS name VARCHAR;
  ALTER TABLE resumes ADD COLUMN IF NOT EXISTS contact JSONB DEFAULT '{}';
  ALTER TABLE resumes ADD COLUMN IF NOT EXISTS summary TEXT;
"
```

After running migrations, re-upload any existing resumes so the new fields (name, contact, summary, education) are populated by the AI parser.

### PDF export notes

- PDFs are generated server-side using **WeasyPrint**
- AI-improved bullet points are merged into the original resume structure using string similarity matching (`difflib.SequenceMatcher`, threshold 0.6)
- Candidate name, contact line, and summary appear in the header if present on the resume
- Existing resumes uploaded before the name/contact/summary fields were added will need to be re-uploaded to show a full header

---

## 📄 License

MIT License — feel free to use, modify, and distribute.