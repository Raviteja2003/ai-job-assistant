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