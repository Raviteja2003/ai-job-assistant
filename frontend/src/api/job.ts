import api from "./auth";
import { type Job } from "../types";

export const getJobs = async (): Promise<Job[]> => {
  const res = await api.get("/job/");
  return res.data;
};

export const getJob = async (id: number): Promise<Job> => {
  const res = await api.get(`/job/${id}`);
  return res.data;
};


export const addJob = async (
  company: string,
  role: string,
  description: string
): Promise<Job> => {
  const res = await api.post("/job/add", {
    company,
    role,
    raw_text: description,  
  });
  return res.data;
};

export const deleteJob = async (id: number, token: string): Promise<void> => {
  await api.delete(`/job/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
 