import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";;

function authHeaders() {
  const token = useAuthStore.getState().token;
  return { Authorization: `Bearer ${token}` };
}

export interface StartRequest {
  resume_id: number;
  job_id: number;
  total_questions: number;
}

export interface StartResponse {
  session_id: number;
  question: string;
  turn: number;
  total_questions: number;
}

export interface AnswerFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface FinalReport {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  recommendation: 'Strong Hire' | 'Hire' | 'No Hire';
}

export interface RespondResponse {
  turn: number;
  question: string | null;
  feedback: AnswerFeedback;
  is_complete: boolean;
  final_report: FinalReport | null;
}

export interface SessionSummary {
  id: number;
  status: string;
  total_questions: number;
  created_at: string;
}

export interface MessageOut {
  turn: number;
  question: string;
  user_answer: string | null;
  ai_feedback: string | null;
  score: number | null;
  created_at: string;
}

export interface SessionOut {
  id: number;
  resume_id: number;
  job_id: number;
  status: string;
  total_questions: number;
  created_at: string;
  messages: MessageOut[];
}

export const startSession = async (data: StartRequest): Promise<StartResponse> => {
  const res = await axios.post(`${BASE}/mock-interview/start`, data, { headers: authHeaders() });
  return res.data;
};

export const respondToQuestion = async (
  sessionId: number,
  answer: string
): Promise<RespondResponse> => {
  const res = await axios.post(
    `${BASE}/mock-interview/${sessionId}/respond`,
    { answer },
    { headers: authHeaders() }
  );
  return res.data;
};

export const listSessions = async (): Promise<SessionSummary[]> => {
  const res = await axios.get(`${BASE}/mock-interview/`, { headers: authHeaders() });
  return res.data;
};

export const getSession = async (sessionId: number): Promise<SessionOut> => {
  const res = await axios.get(`${BASE}/mock-interview/${sessionId}`, { headers: authHeaders() });
  return res.data;
};

export const deleteSession = async (sessionId: number): Promise<void> => {
  await axios.delete(`${BASE}/mock-interview/${sessionId}`, { headers: authHeaders() });
};