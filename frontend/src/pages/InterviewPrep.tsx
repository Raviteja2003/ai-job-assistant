import { useState, useEffect } from "react";
import { generateInterviewQuestions, type InterviewGenerateResponse } from "../api/interview";
import type { Resume, Job } from "../types";
import { ResumeDetailModal } from "../components/ResumeDetailModal";
import { JobDetailModal } from "../components/JobDetailModal";
import { getJobs as fetchJobs } from "../api/job";
import { getResumes as fetchResumes } from "../api/resume";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  behavioral:      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  technical:       { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  "role-specific": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  situational:     { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" },
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  easy:   { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  hard:   { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

// ── Radio dot ────────────────────────────────────────────────
function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: selected ? "2px solid #2563EB" : "2px solid #D1D5DB",
        background: "#fff",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 0.15s",
      }}
    >
      {selected && (
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#2563EB",
          }}
        />
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
function Badge({
  label,
  colors,
}: {
  label: string;
  colors: { bg: string; text: string; border: string };
}) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 9px",
        borderRadius: 5,
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        textTransform: "capitalize",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
}

// ── Filter pill ───────────────────────────────────────────────
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 13px",
        borderRadius: 20,
        border: `1.5px solid ${active ? "#2563EB" : "#E5E7EB"}`,
        background: active ? "#2563EB" : "#fff",
        color: active ? "#fff" : "#6B7280",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
        textTransform: "capitalize",
      }}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────
export default function InterviewPrep() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [result, setResult] = useState<InterviewGenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [viewResume, setViewResume] = useState<Resume | null>(null);
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchResumes().then(setResumes).catch(() => {});
    fetchJobs().then(setJobs).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedResumeId || !selectedJobId) return;
    setLoading(true);
    setError("");
    setResult(null);
    setExpandedIdx(null);
    setFilterCategory("all");
    setFilterDifficulty("all");
    try {
      const data = await generateInterviewQuestions(selectedResumeId, selectedJobId);
      setResult(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail || "Failed to generate questions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions =
    result?.questions.filter((q) => {
      const catOk = filterCategory === "all" || q.category === filterCategory;
      const diffOk = filterDifficulty === "all" || q.difficulty === filterDifficulty;
      return catOk && diffOk;
    }) ?? [];

  const copyAnswer = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const canGenerate = !!selectedResumeId && !!selectedJobId && !loading;

  return (
    <div style={{ padding: "32px 32px 60px", maxWidth: 880, margin: "0 auto" }}>
      {/* Header */}
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
        Interview Prep
      </h1>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 28 }}>
        Generate tailored interview questions based on your resume and a job description.
      </p>

      {/* Selection grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* ── Resume selector ── */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
            Select Resume
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resumes.map((r) => {
              const selected = selectedResumeId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedResumeId(selected ? null : r.id)}
                  style={{
                    border: `1.5px solid ${selected ? "#2563EB" : "#E5E7EB"}`,
                    borderRadius: 10,
                    padding: "11px 14px",
                    cursor: "pointer",
                    background: selected ? "#EFF6FF" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <RadioDot selected={selected} />
                  <span
                    style={{
                      fontSize: 13,
                      color: "#111827",
                      fontWeight: 500,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.filename}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewResume(r);
                    }}
                    style={{
                      fontSize: 12,
                      color: "#2563EB",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                      fontWeight: 500,
                    }}
                  >
                    View
                  </button>
                </div>
              );
            })}
            {resumes.length === 0 && (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>No resumes uploaded yet.</p>
            )}
          </div>
        </div>

        {/* ── Job selector ── */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
            Select Job Description
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {jobs.map((j) => {
              const selected = selectedJobId === j.id;
              return (
                <div
                  key={j.id}
                  onClick={() => setSelectedJobId(selected ? null : j.id)}
                  style={{
                    border: `1.5px solid ${selected ? "#2563EB" : "#E5E7EB"}`,
                    borderRadius: 10,
                    padding: "11px 14px",
                    cursor: "pointer",
                    background: selected ? "#EFF6FF" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <RadioDot selected={selected} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#111827",
                        fontWeight: 500,
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {j.role}
                    </span>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>{j.company}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewJob(j);
                    }}
                    style={{
                      fontSize: 12,
                      color: "#2563EB",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                      fontWeight: 500,
                    }}
                  >
                    View
                  </button>
                </div>
              );
            })}
            {jobs.length === 0 && (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>No job descriptions added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        style={{
          background: canGenerate ? "#2563EB" : "#E5E7EB",
          color: canGenerate ? "#fff" : "#9CA3AF",
          border: "none",
          borderRadius: 8,
          padding: "10px 26px",
          fontSize: 14,
          fontWeight: 600,
          cursor: canGenerate ? "pointer" : "not-allowed",
          marginBottom: 28,
          transition: "background 0.15s",
        }}
      >
        {loading ? "Generating questions…" : "Generate Interview Questions"}
      </button>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1.5px solid #FECACA",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 14,
            color: "#DC2626",
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Result header */}
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
              {result.role} at {result.company}
            </h2>
            <p style={{ fontSize: 13, color: "#6B7280" }}>
              {result.questions.length} questions generated
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF", marginRight: 2 }}>Category:</span>
            {["all", "behavioral", "technical", "role-specific", "situational"].map((cat) => (
              <FilterPill
                key={cat}
                label={cat}
                active={filterCategory === cat}
                onClick={() => setFilterCategory(cat)}
              />
            ))}
            <div style={{ width: 1, height: 20, background: "#E5E7EB", margin: "0 6px" }} />
            <span style={{ fontSize: 12, color: "#9CA3AF", marginRight: 2 }}>Difficulty:</span>
            {["all", "easy", "medium", "hard"].map((diff) => (
              <FilterPill
                key={diff}
                label={diff}
                active={filterDifficulty === diff}
                onClick={() => setFilterDifficulty(diff)}
              />
            ))}
          </div>

          {/* Question cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {filteredQuestions.map((q, idx) => {
              const isOpen = expandedIdx === idx;
              const catColors =
                CATEGORY_COLORS[q.category] ?? { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
              const diffColors =
                DIFFICULTY_COLORS[q.difficulty] ?? { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };

              return (
                <div
                  key={idx}
                  style={{
                    border: `1.5px solid ${isOpen ? "#BFDBFE" : "#E5E7EB"}`,
                    borderRadius: 10,
                    background: "#fff",
                    overflow: "hidden",
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* Question row */}
                  <div
                    onClick={() => setExpandedIdx(isOpen ? null : idx)}
                    style={{
                      padding: "13px 16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      background: isOpen ? "#F8FAFF" : "#fff",
                      transition: "background 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#9CA3AF",
                          minWidth: 22,
                          paddingTop: 2,
                        }}
                      >
                        {idx + 1}.
                      </span>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#111827",
                          margin: 0,
                          lineHeight: 1.55,
                          fontWeight: 450,
                        }}
                      >
                        {q.question}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Badge label={q.category} colors={catColors} />
                      <Badge label={q.difficulty} colors={diffColors} />
                      <span
                        style={{
                          color: "#9CA3AF",
                          fontSize: 13,
                          marginLeft: 2,
                          transition: "transform 0.2s",
                          display: "inline-block",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Sample answer */}
                  {isOpen && (
                    <div
                      style={{
                        borderTop: "1px solid #E8F0FE",
                        padding: "14px 16px 16px",
                        background: "#F8FAFF",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#93C5FD",
                            margin: 0,
                            letterSpacing: "0.06em",
                          }}
                        >
                          SAMPLE ANSWER
                        </p>
                        <button
                          onClick={() => copyAnswer(idx, q.sample_answer)}
                          style={{
                            fontSize: 12,
                            color: copiedIdx === idx ? "#16A34A" : "#2563EB",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            fontWeight: 500,
                            transition: "color 0.15s",
                          }}
                        >
                          {copiedIdx === idx ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#374151",
                          margin: 0,
                          lineHeight: 1.65,
                        }}
                      >
                        {q.sample_answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <p
                style={{
                  fontSize: 13,
                  color: "#9CA3AF",
                  textAlign: "center",
                  padding: "28px 0",
                }}
              >
                No questions match the selected filters.
              </p>
            )}
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div
              style={{
                background: "#EFF6FF",
                border: "1.5px solid #BFDBFE",
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1D4ED8",
                  marginBottom: 10,
                  letterSpacing: "0.02em",
                }}
              >
                💡 Interview Tips
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {result.tips.map((tip, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 13,
                      color: "#1E40AF",
                      marginBottom: 6,
                      lineHeight: 1.55,
                    }}
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {viewResume && (
        <ResumeDetailModal resume={viewResume} onClose={() => setViewResume(null)} />
      )}
      {viewJob && (
        <JobDetailModal job={viewJob} onClose={() => setViewJob(null)} />
      )}
    </div>
  );
}