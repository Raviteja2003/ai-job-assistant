import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type JobStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface TrackedJob {
  id: number;
  user_id: number;
  company: string;
  role: string;
  job_url: string | null;
  location: string | null;
  salary: string | null;
  notes: string | null;
  status: JobStatus;
  applied_date: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TrackedJobCreate {
  company: string;
  role: string;
  job_url?: string;
  location?: string;
  salary?: string;
  notes?: string;
  status?: JobStatus;
  applied_date?: string;
}

export interface TrackedJobUpdate extends Partial<TrackedJobCreate> {}

export interface TrackerStats {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

const headers = (token: string) => ({ Authorization: `Bearer ${token}` });

export const createTrackedJob = async (payload: TrackedJobCreate, token: string) =>
  (await axios.post<TrackedJob>(`${API_BASE}/tracker/`, payload, { headers: headers(token) })).data;

export const listTrackedJobs = async (token: string, status?: JobStatus) =>
  (await axios.get<TrackedJob[]>(`${API_BASE}/tracker/`, {
    headers: headers(token),
    params: status ? { status } : {},
  })).data;

export const getTrackerStats = async (token: string) =>
  (await axios.get<TrackerStats>(`${API_BASE}/tracker/stats`, { headers: headers(token) })).data;

export const updateTrackedJob = async (id: number, payload: TrackedJobUpdate, token: string) =>
  (await axios.patch<TrackedJob>(`${API_BASE}/tracker/${id}`, payload, { headers: headers(token) })).data;

export const deleteTrackedJob = async (id: number, token: string) =>
  axios.delete(`${API_BASE}/tracker/${id}`, { headers: headers(token) });


export interface TimelineEntry {
  date: string;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export interface TimelineResponse {
  entries: TimelineEntry[];
}

export const getTimeline = async (): Promise<TimelineResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/tracker/timeline`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};