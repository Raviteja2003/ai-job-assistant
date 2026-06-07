import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: string;
}

export interface SalaryResponse {
  role: string;
  location: string;
  experience_level: string;
  salary_range: SalaryRange;
  market_context: string;
  top_companies: string[];
  negotiation_tips: string[];
  confidence: "low" | "medium" | "high";
  disclaimer: string;
}

export interface SalaryRequest {
  role: string;
  location: string;
  experience_level: string;
  skills: string[];
}

export const estimateSalary = async (
  data: SalaryRequest,
  token: string
): Promise<SalaryResponse> => {
  const res = await axios.post(`${API_BASE}/salary/estimate`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};