import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface CoverLetterRequest {
  resume_id: number;
  job_id: number;
  tone: "formal" | "casual" | "creative";
}

export interface CoverLetterResponse {
  cover_letter: string;
  tone: string;
  company: string;
  role: string;
}

export async function generateCoverLetter(
  payload: CoverLetterRequest,
  token: string
): Promise<CoverLetterResponse> {
  const { data } = await axios.post<CoverLetterResponse>(
    `${API_BASE}/cover-letter/generate`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}