import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface LearningResource {
  title: string;
  type: "course" | "documentation" | "project idea" | "book";
  url: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  why: string;
}

export interface SkillGapItem {
  skill: string;
  priority: "high" | "medium" | "low";
  context: string;
  resources: LearningResource[];
}

export interface SkillGapResponse {
  role: string;
  items: SkillGapItem[];
  learning_path: string[];
}

export const getSkillGapResources = async (
  missing_skills: string[],
  role: string,
  job_id: number
): Promise<SkillGapResponse> => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/skill-gap/resources`,
    { missing_skills, role, job_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};