import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ImprovedBullet {
  original: string;
  improved: string;
}

export interface ResumeVersionCreate {
  resume_id: number;
  job_id: number;
  version_name: string;
  match_score: number;
  missing_skills: string[];
  improved_bullets: ImprovedBullet[];
}

export interface ResumeVersionOut {
  id: number;
  resume_id: number;
  job_id: number;
  version_name: string;
  match_score: number;
  missing_skills: string[];
  improved_bullets: ImprovedBullet[];
  created_at: string;
}

export const saveResumeVersion = async (
  data: ResumeVersionCreate,
  token: string
): Promise<ResumeVersionOut> => {
  const res = await axios.post(`${API_BASE}/resume-versions/save`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const listResumeVersions = async (
  token: string
): Promise<ResumeVersionOut[]> => {
  const res = await axios.get(`${API_BASE}/resume-versions/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteResumeVersion = async (
  id: number,
  token: string
): Promise<void> => {
  await axios.delete(`${API_BASE}/resume-versions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};