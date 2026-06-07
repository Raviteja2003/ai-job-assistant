import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { estimateSalary } from "../api/salary";
import type { SalaryResponse } from "../api/salary";

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level (0–2 yrs)" },
  { value: "mid", label: "Mid Level (2–5 yrs)" },
  { value: "senior", label: "Senior Level (5–8 yrs)" },
  { value: "lead", label: "Lead / Staff (8+ yrs)" },
];

const CONFIDENCE_COLOR: Record<string, string> = {
  low: "#D97706",
  medium: "#2563EB",
  high: "#16A34A",
};

const CONFIDENCE_BG: Record<string, string> = {
  low: "#FFFBEB",
  medium: "#EFF6FF",
  high: "#F0FDF4",
};

export default function SalaryInsights() {
  const { token } = useAuthStore();

  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SalaryResponse | null>(null);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async () => {
    if (!role.trim() || !location.trim()) {
      setError("Role and location are required.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await estimateSalary(
        { role, location, experience_level: experienceLevel, skills },
        token!
      );
      setResult(data);
    } catch {
      setError("Failed to estimate salary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div style={{ padding: "32px", maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>
          Salary Insights
        </h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 6 }}>
          Get AI-estimated market salary ranges based on role, skills, and location.
        </p>
      </div>

      {/* Form Card */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1.5px solid #E5E7EB",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Role */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
              Job Role <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
              Location <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hyderabad, India"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Experience Level */}
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
            Experience Level
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setExperienceLevel(lvl.value)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1.5px solid",
                  borderColor: experienceLevel === lvl.value ? "#2563EB" : "#E5E7EB",
                  background: experienceLevel === lvl.value ? "#EFF6FF" : "#FFFFFF",
                  color: experienceLevel === lvl.value ? "#1D4ED8" : "#374151",
                  fontSize: 13,
                  fontWeight: experienceLevel === lvl.value ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
            Skills <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional — press Enter or comma to add)</span>
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              padding: "8px 10px",
              border: "1.5px solid #E5E7EB",
              borderRadius: 8,
              minHeight: 44,
              alignItems: "center",
            }}
          >
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  background: "#F3F4F6",
                  color: "#374151",
                  borderRadius: 4,
                  fontSize: 12,
                  padding: "3px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {skill}
                <span
                  onClick={() => removeSkill(skill)}
                  style={{ cursor: "pointer", color: "#9CA3AF", fontWeight: 600, fontSize: 13, lineHeight: 1 }}
                >
                  ×
                </span>
              </span>
            ))}
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              onBlur={addSkill}
              placeholder={skills.length === 0 ? "e.g. React, Python, AWS" : ""}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#111827",
                flex: 1,
                minWidth: 120,
                background: "transparent",
              }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: "#DC2626", fontSize: 13, marginTop: 12 }}>{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: 20,
            padding: "10px 24px",
            background: loading ? "#93C5FD" : "#2563EB",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Estimating..." : "Estimate Salary"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Salary Range Hero */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5E7EB",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
              Estimated Market Salary · {result.location} · {EXPERIENCE_LEVELS.find(l => l.value === result.experience_level)?.label}
            </p>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#111827", margin: "8px 0" }}>
              {formatSalary(result.salary_range.min, result.salary_range.currency)}
              {" – "}
              {formatSalary(result.salary_range.max, result.salary_range.currency)}
            </div>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>{result.salary_range.period}</p>

            {/* Confidence Badge */}
            <span
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: CONFIDENCE_BG[result.confidence],
                color: CONFIDENCE_COLOR[result.confidence],
              }}
            >
              {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
            </span>
          </div>

          {/* Market Context */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5E7EB",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginTop: 0, marginBottom: 10 }}>
              Market Context
            </h3>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 }}>
              {result.market_context}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Top Companies */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginTop: 0, marginBottom: 12 }}>
                Top Paying Companies
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.top_companies.map((company, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#EFF6FF",
                        color: "#2563EB",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 14, color: "#374151" }}>{company}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Negotiation Tips */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginTop: 0, marginBottom: 12 }}>
                Negotiation Tips
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.negotiation_tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#16A34A", fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", padding: "0 16px" }}>
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}