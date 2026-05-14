import api from "./auth";
import { type Resume } from "../types";

export const getResumes = async (): Promise<Resume[]> => {
  const res = await api.get("/resume/");
  return res.data;
};

export const getResume = async (id: number): Promise<Resume> => {
  const res = await api.get(`/resume/${id}`);
  return res.data;
};

export const uploadResume = async (file: File): Promise<Resume> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteResume = async (id: number): Promise<void> => {
  await api.delete(`/resume/${id}`);
};