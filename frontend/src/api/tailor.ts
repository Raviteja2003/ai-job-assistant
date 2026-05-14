import api from "./auth";
import { type TailorResult } from "../types";

export const analyzeResume = async (
  resume_id: number,
  job_id: number
): Promise<TailorResult> => {
  const res = await api.post("/tailor/analyze", { resume_id, job_id });
  return res.data;
};