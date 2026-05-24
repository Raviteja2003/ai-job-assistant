import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Make sure ALL these have the export keyword
export type EmailType = "follow-up" | "thank-you" | "withdrawal";
export type EmailTone = "formal" | "casual" | "enthusiastic";

export interface EmailGenerateRequest {
  resume_id: number;
  job_id: number;
  email_type: EmailType;
  tone: EmailTone;
  interviewer_name?: string;
  days_since_applied?: number;
}

export interface EmailGenerateResponse {  // ← make sure 'export' is here
  subject: string;
  body: string;
  email_type: string;
  tone: string;
  company: string;
  role: string;
}

export const generateEmail = async (
  payload: EmailGenerateRequest
): Promise<EmailGenerateResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/email/generate`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};