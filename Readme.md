# 🧠 AI Job Assistant

An AI-powered job application toolkit that helps you tailor your resume, generate cover letters, prep for interviews, and track your job search — all in one place.

---

## ✨ Features

- **Resume Upload & Parsing** — Upload PDF or DOCX resumes; AI extracts skills, experience, and projects automatically
- **Job Description Parser** — Paste any job description; AI extracts required skills and responsibilities
- **Resume Tailoring** — Get a match score, identify missing skills, and receive AI-improved bullet points for your resume
- **Cover Letter Generator** — Generate tailored cover letters in Formal, Casual, or Creative tone
- **Job Tracker** — Track every application from Saved → Applied → Interview → Offer / Rejected with notes, salary, and links
- **Interview Prep AI** — Generate tailored interview questions from your resume and job description, categorized by type and difficulty with sample answers
- **Skill Gap Analyzer** — Get personalized learning resources for every missing skill, with priority ratings and a recommended learning path
- **Email Generator** — Generate professional Follow-Up, Thank-You, and Withdrawal emails tailored to your resume and the role

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS + Zustand + React Router |
| Backend | FastAPI + Python + SQLAlchemy + JWT Auth |
| Database | PostgreSQL |
| AI | Google Gemini API (`gemini-2.5-flash`) |
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
│       │   ├── job.py
│       │   └── tracked_job.py
│       │
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── resume.py
│       │   ├── job.py
│       │   ├── tailor.py
│       │   ├── cover_letter.py
│       │   ├── tracker.py
│       │   ├── interview.py
│       │   ├── skill_gap.py
│       │   └── email_generator.py
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── resume_parser.py
│       │   ├── job_parser.py
│       │   ├── tailor_service.py
│       │   ├── cover_letter_service.py
│       │   ├── interview_service.py
│       │   ├── skill_gap_service.py
│       │   └── email_service.py
│       │
│       └── api/
│           ├── __init__.py
│           ├── deps.py
│           ├── auth.py
│           ├── resume.py
│           ├── job.py
│           ├── tailor.py
│           ├── cover_letter.py
│           ├── tracker.py
│           ├── interview.py
│           ├── skill_gap.py
│           └── email_generator.py
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
        │   ├── skillGap.ts
        │   └── emailGenerator.ts
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
            ├── Dashboard.tsx
            ├── Results.tsx
            ├── CoverLetter.tsx
            ├── Tracker.tsx
            ├── InterviewPrep.tsx
            └── EmailGenerator.tsx
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
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=aijobassistant
DATABASE_URL=postgresql://postgres:yourpassword@db:5432/aijobassistant

# Auth
SECRET_KEY=your-secret-key-here
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
| POST | `/resume/upload` | Upload and AI-parse a resume |
| GET | `/resume/` | List all resumes |
| GET | `/resume/{id}` | Get resume by ID |
| DELETE | `/resume/{id}` | Delete a resume |

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
| POST | `/tailor/analyze` | Analyze resume vs job description |

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

### Phase 3 — Planned 🔲
- [ ] Analytics Dashboard — application funnel, response rate charts

---

## 🔧 Development Notes

- Database tables are **auto-created** on startup via `Base.metadata.create_all` — no manual migrations needed
- Live reload is enabled via Docker volumes — no rebuild needed for code changes
- Rebuild containers only when changing `requirements.txt`:
```bash
  docker compose up --build
```
- Backend uses `bcrypt==4.2.1` (pinned for passlib compatibility) and `httpx==0.27.2`
- All AI calls use `gemini-2.5-flash` — the only free-tier model currently available
- Type-only imports in frontend use `import type` syntax to comply with Vite `verbatimModuleSyntax`

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
Key changes from your previous README:

Added all 3 Phase 2 features to the Features section
Added 3 new endpoint tables for Interview Prep, Skill Gap, and Email Generator
Split the Roadmap into Phase 1 (complete) and Phase 2 (complete) with Phase 3 as the remaining Analytics Dashboard
Added the Vite verbatimModuleSyntax note to Development Notes
Updated the opening description to mention the new features
