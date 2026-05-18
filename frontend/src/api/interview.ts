import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "role-specific" | "situational";
  difficulty: "easy" | "medium" | "hard";
  sample_answer: string;
}

export interface InterviewGenerateResponse {
  company: string;
  role: string;
  questions: InterviewQuestion[];
  tips: string[];
}

export const generateInterviewQuestions = async (
  resume_id: number,
  job_id: number
): Promise<InterviewGenerateResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/interview/generate`,
    { resume_id, job_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};