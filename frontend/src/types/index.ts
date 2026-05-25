export interface Resume {
  id: number;
  filename: string;
  skills: string[];
  experience: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  created_at: string;
}

export interface Job {
  id: number;
  company: string;
  role: string;
  raw_text: string;
  required_skills: string[];
  responsibilities: string[];
  created_at: string;
}

export interface ImprovedBullet {
  original: string;
  improved: string;
}

export interface TailorResult {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  improved_bullets: ImprovedBullet[];
  summary: string;
}


export interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "role-specific" | "situational";
  difficulty: "easy" | "medium" | "hard";
  sample_answer: string;
}

export interface InterviewResult {
  company: string;
  role: string;
  questions: InterviewQuestion[];
  tips: string[];
}


export interface LearningResource {
  title: string;
  type: "course" | "documentation" | "project idea" | "book";
  url: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  why: string;
}

export interface SkillGapItem {
  skill: string;
  priority: "high" | "medium" | "low";
  context: string;
  resources: LearningResource[];
}

export interface SkillGapResult {
  role: string;
  items: SkillGapItem[];
  learning_path: string[];
}


export type EmailType = "follow-up" | "thank-you" | "withdrawal";
export type EmailTone = "formal" | "casual" | "enthusiastic";

export interface EmailResult {
  subject: string;
  body: string;
  email_type: string;
  tone: string;
  company: string;
  role: string;
}


export interface TrackerStats {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}