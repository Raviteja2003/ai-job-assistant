import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getResumes,
  uploadResume,
  deleteResume,
  getResume,
} from "../api/resume";
import { getJobs, addJob, deleteJob, getJob } from "../api/job";
import { analyzeResume } from "../api/tailor";
import { type Resume, type Job, type TailorResult } from "../types";
import { useAuthStore } from "../store/authStore";
import { ResumeDetailModal } from "../components/ResumeDetailModal";
import { JobDetailModal } from "../components/JobDetailModal";
import {
  getSkillGapResources,
  type SkillGapResponse,
  type SkillGapItem,
} from "../api/skillGap";
import { saveResumeVersion } from "../api/resume_version";

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 2v10M2 7h10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M12 4L4 12M4 4l8 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M11 3.5l-.7 7.7a1 1 0 01-1 .8H4.7a1 1 0 01-1-.8L3 3.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path
      d="M1.5 5l2.5 2.5 4.5-4.5"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconUpload = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M11 14V7M11 7L8 10M11 7l3 3"
      stroke="#9CA3AF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 14.5A4 4 0 015 7.1a6 6 0 0111.9-.1A3.5 3.5 0 0119 11v.5"
      stroke="#9CA3AF"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IconBriefcase = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect
      x="3"
      y="8"
      width="16"
      height="11"
      rx="2"
      stroke="#9CA3AF"
      strokeWidth="1.5"
    />
    <path
      d="M7 8V6.5A2.5 2.5 0 0115 6.5V8"
      stroke="#9CA3AF"
      strokeWidth="1.5"
    />
    <path d="M3 13h16" stroke="#9CA3AF" strokeWidth="1.5" />
  </svg>
);

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.35)",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};
const modalBase: React.CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  padding: "28px 28px 24px",
  width: "100%",
  maxWidth: 480,
  boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
};
const inputSt: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 13.5,
  fontFamily: "'DM Sans',sans-serif",
  color: "#111827",
  outline: "none",
  background: "#fff",
};
const btnP: React.CSSProperties = {
  padding: "9px 20px",
  background: "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: "'DM Sans',sans-serif",
  cursor: "pointer",
};
const btnS: React.CSSProperties = {
  padding: "9px 20px",
  background: "#F3F4F6",
  color: "#374151",
  border: "none",
  borderRadius: 8,
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: "'DM Sans',sans-serif",
  cursor: "pointer",
};

const IconEye = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ── Shared Section wrapper ────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          marginBottom: 10,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        background: copied ? "#F0FDF4" : "#F3F4F6",
        border: `1px solid ${copied ? "#BBF7D0" : "#E5E7EB"}`,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        color: copied ? "#16A34A" : "#6B7280",
        cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif",
        flexShrink: 0,
      }}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M2 6.5l3 3 6-6"
            stroke="#16A34A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect
            x="4"
            y="4"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M2 9V2.5A.5.5 0 012.5 2H9"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 50,
    circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#16A34A" : score >= 50 ? "#D97706" : "#DC2626";
  const bg = score >= 75 ? "#F0FDF4" : score >= 50 ? "#FFFBEB" : "#FEF2F2";
  const label =
    score >= 75
      ? "Strong match"
      : score >= 50
        ? "Moderate match"
        : "Weak match";
  return (
    <div
      style={{
        background: bg,
        border: `1.5px solid ${color}20`,
        borderRadius: 12,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle
          cx="62"
          cy="62"
          r={r}
          fill="none"
          stroke={`${color}25`}
          strokeWidth="8"
        />
        <circle
          cx="62"
          cy="62"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 62 62)"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        <text
          x="62"
          y="57"
          textAnchor="middle"
          fontSize="26"
          fontWeight="600"
          fill={color}
          fontFamily="'DM Sans',sans-serif"
        >
          {score}
        </text>
        <text
          x="62"
          y="73"
          textAnchor="middle"
          fontSize="11"
          fill={color}
          fontFamily="'DM Sans',sans-serif"
          opacity="0.65"
        >
          / 100
        </text>
      </svg>
      <p style={{ fontSize: 13, fontWeight: 600, color }}>{label}</p>
      <p style={{ fontSize: 11.5, color: "#9CA3AF" }}>Match score</p>
    </div>
  );
}

const PRIORITY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  high: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  low: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
};

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  beginner: { bg: "#F0FDF4", text: "#16A34A" },
  intermediate: { bg: "#FFFBEB", text: "#D97706" },
  advanced: { bg: "#FEF2F2", text: "#DC2626" },
};

const TYPE_ICONS: Record<string, string> = {
  course: "🎓",
  documentation: "📄",
  "project idea": "🛠️",
  book: "📚",
};

function SkillGapTab({
  data,
  loading,
  error,
  missingSkills,
}: {
  data: SkillGapResponse | null;
  loading: boolean;
  error: string;
  missingSkills: string[];
}) {
  if (!missingSkills.length) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          background: "#F0FDF4",
          borderRadius: 10,
          border: "1.5px solid #BBF7D0",
        }}
      >
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#16A34A",
            marginBottom: 4,
          }}
        >
          No skill gaps detected 🎉
        </p>
        <p style={{ fontSize: 13, color: "#6B7280" }}>
          Your resume matches all required skills for this role.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div
          style={{
            width: 18,
            height: 18,
            border: "2px solid #E5E7EB",
            borderTopColor: "#2563EB",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Loading learning resources...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "#FEF2F2",
          border: "1.5px solid #FECACA",
          borderRadius: 8,
          padding: "14px 16px",
          fontSize: 14,
          color: "#DC2626",
        }}
      >
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      {/* Learning path */}
      {data.learning_path.length > 0 && (
        <div
          style={{
            background: "#EFF6FF",
            border: "1.5px solid #BFDBFE",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1D4ED8",
              marginBottom: 10,
            }}
          >
            Recommended Learning Path
          </p>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {data.learning_path.map((step, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  color: "#1E40AF",
                  marginBottom: 6,
                  lineHeight: 1.5,
                }}
              >
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Skill items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.items.map((item: SkillGapItem, i: number) => (
          <div
            key={i}
            style={{
              border: "1.5px solid #E5E7EB",
              borderRadius: 10,
              background: "#fff",
              overflow: "hidden",
            }}
          >
            {/* Skill header */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #F1F2F4",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <span
                  style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}
                >
                  {item.skill}
                </span>
                <p
                  style={{ fontSize: 12, color: "#6B7280", margin: "3px 0 0" }}
                >
                  {item.context}
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 4,
                  background: PRIORITY_COLORS[item.priority]?.bg,
                  color: PRIORITY_COLORS[item.priority]?.text,
                  border: `1px solid ${PRIORITY_COLORS[item.priority]?.border}`,
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                  marginLeft: 12,
                }}
              >
                {item.priority} priority
              </span>
            </div>

            {/* Resources */}
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {item.resources.map((res, j) => (
                <div
                  key={j}
                  style={{
                    background: "#F8F9FA",
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>
                        {TYPE_ICONS[res.type] || "🔗"}
                      </span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#2563EB",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.textDecoration = "none")
                        }
                      >
                        {res.title}
                      </a>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        margin: "0 0 2px",
                      }}
                    >
                      {res.why}
                    </p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                      ⏱ {res.duration}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      alignItems: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        padding: "2px 7px",
                        borderRadius: 4,
                        background: LEVEL_COLORS[res.level]?.bg,
                        color: LEVEL_COLORS[res.level]?.text,
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {res.level}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 4,
                        background: "#F3F4F6",
                        color: "#374151",
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {res.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (r: Resume) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const pick = (f: File) => {
    if (f.type === "application/pdf" || f.name.endsWith(".docx")) {
      setFile(f);
      setError("");
    } else setError("Only PDF or DOCX files are supported.");
  };
  const go = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      onSuccess(await uploadResume(file));
    } catch {
      setError("Upload failed. Please try again.");
      setLoading(false);
    }
  };
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalBase} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 3,
              }}
            >
              Upload resume
            </p>
            <p style={{ fontSize: 13, color: "#6B7280" }}>
              PDF or DOCX — AI parses skills & experience
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
            }}
          >
            <IconX />
          </button>
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) pick(f);
          }}
          onClick={() => ref.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#2563EB" : file ? "#16A34A" : "#E5E7EB"}`,
            borderRadius: 10,
            padding: "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "#EFF6FF" : file ? "#F0FDF4" : "#FAFAFA",
            transition: "all 0.15s",
            marginBottom: 14,
          }}
        >
          <input
            ref={ref}
            type="file"
            accept=".pdf,.docx"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pick(f);
            }}
          />
          {file ? (
            <>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#DCFCE7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 10l5 5L17 5"
                    stroke="#16A34A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "#16A34A" }}>
                {file.name}
              </p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
                {(file.size / 1024).toFixed(1)} KB · Click to change
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  margin: "0 auto 10px",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconUpload />
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "#374151" }}>
                Drop your file here
              </p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }}>
                or <span style={{ color: "#2563EB" }}>browse</span> · PDF, DOCX
              </p>
            </>
          )}
        </div>
        {error && (
          <p style={{ fontSize: 12.5, color: "#DC2626", marginBottom: 12 }}>
            {error}
          </p>
        )}
        {loading && (
          <div
            style={{
              background: "#EFF6FF",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                border: "2px solid #BFDBFE",
                borderTopColor: "#2563EB",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                flexShrink: 0,
              }}
            />
            <p style={{ fontSize: 13, color: "#1D4ED8" }}>
              AI is parsing your resume…
            </p>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button style={btnS} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            style={{ ...btnP, opacity: !file || loading ? 0.5 : 1 }}
            onClick={go}
            disabled={!file || loading}
          >
            {loading ? "Uploading…" : "Upload →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddJobModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (j: Job) => void;
}) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const go = async () => {
    if (!company.trim() || !role.trim() || !description.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      onSuccess(await addJob(company.trim(), role.trim(), description.trim()));
    } catch {
      setError("Failed to add job. Please try again.");
      setLoading(false);
    }
  };
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={{ ...modalBase, maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 3,
              }}
            >
              Add job description
            </p>
            <p style={{ fontSize: 13, color: "#6B7280" }}>
              AI extracts required skills & responsibilities
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
            }}
          >
            <IconX />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#374151",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Company
              </label>
              <input
                style={inputSt}
                placeholder="Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#374151",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Role title
              </label>
              <input
                style={inputSt}
                placeholder="Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: "#374151",
                display: "block",
                marginBottom: 5,
              }}
            >
              Job description
            </label>
            <textarea
              style={{
                ...inputSt,
                height: 160,
                resize: "vertical",
                lineHeight: 1.6,
              }}
              placeholder="Paste the full job description here…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        {error && (
          <p style={{ fontSize: 12.5, color: "#DC2626", marginTop: 10 }}>
            {error}
          </p>
        )}
        {loading && (
          <div
            style={{
              background: "#EFF6FF",
              borderRadius: 8,
              padding: "10px 14px",
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                border: "2px solid #BFDBFE",
                borderTopColor: "#2563EB",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                flexShrink: 0,
              }}
            />
            <p style={{ fontSize: 13, color: "#1D4ED8" }}>
              AI is parsing the job description…
            </p>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <button style={btnS} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            style={{
              ...btnP,
              opacity: !company || !role || !description || loading ? 0.5 : 1,
            }}
            onClick={go}
            disabled={!company || !role || !description || loading}
          >
            {loading ? "Adding…" : "Add job →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [analyzeError, setAnalyzeError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);
  const { token } = useAuthStore();
  const [viewResume, setViewResume] = useState<Resume | null>(null);
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TailorResult | null>(
    null,
  );
  const [versionSaved, setVersionSaved] = useState(false);
  const [versionSaving, setVersionSaving] = useState(false);
  const [analysisJobId, setAnalysisJobId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "skill-gap">(
    "analysis",
  );
  const [skillGapData, setSkillGapData] = useState<SkillGapResponse | null>(
    null,
  );
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [skillGapError, setSkillGapError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [r, j] = await Promise.all([getResumes(), getJobs()]);
        setResumes(r);
        setJobs(j);
      } catch {
        setFetchError("Failed to load data. Please refresh.");
      }
    })();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResumeId || !selectedJobId) return;
    setAnalyzeError("");
    setLoading(true);
    setAnalysisResult(null);
    setSkillGapData(null);
    setSkillGapError("");
    setActiveTab("analysis");
    setVersionSaved(false);
    try {
      const result = await analyzeResume(selectedResumeId, selectedJobId);
      setAnalysisResult(result);
      setAnalysisJobId(selectedJobId);
    } catch {
      setAnalyzeError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!analysisResult || !selectedResumeId || !analysisJobId) return;
    const job = jobs.find((j) => j.id === analysisJobId);
    if (!job) return;
    setVersionSaving(true);
    try {
      await saveResumeVersion(
        {
          resume_id: selectedResumeId,
          job_id: analysisJobId,
          version_name: `${job.company} — ${job.role}`,
          match_score: analysisResult.match_score,
          missing_skills: analysisResult.missing_skills,
          improved_bullets: analysisResult.improved_bullets,
        },
        token!,
      );
      setVersionSaved(true);
    } catch {
      // optionally surface an error
    } finally {
      setVersionSaving(false);
    }
  };

  const canAnalyze =
    selectedResumeId !== null && selectedJobId !== null && !loading;
  const selResume = resumes.find((r) => r.id === selectedResumeId);
  const selJob = jobs.find((j) => j.id === selectedJobId);

  const handleViewResume = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewLoading(true);
    try {
      const data = await getResume(id);
      setViewResume(data);
    } catch {
      // optionally show error
    } finally {
      setViewLoading(false);
    }
  };

  const handleViewJob = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewLoading(true);
    try {
      const data = await getJob(id);
      setViewJob(data);
    } catch {
      // optionally show error
    } finally {
      setViewLoading(false);
    }
  };

  const handleLoadSkillGap = async (
    missingSkills: string[],
    role: string,
    jobId: number,
  ) => {
    if (skillGapData) return;
    if (!missingSkills.length) return;
    setSkillGapLoading(true);
    setSkillGapError("");
    try {
      const data = await getSkillGapResources(missingSkills, role, jobId);
      setSkillGapData(data);
    } catch {
      setSkillGapError("Failed to load skill gap resources. Please try again.");
    } finally {
      setSkillGapLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "32px 36px",
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .fade-in{animation:fadeUp 0.3s ease both;}
        .sel-card{background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;padding:12px 14px;cursor:pointer;transition:border-color 0.15s,box-shadow 0.15s;display:flex;align-items:flex-start;gap:10px;}
        .sel-card:hover{border-color:#93C5FD;box-shadow:0 0 0 3px #EFF6FF;}
        .sel-card.selected{border-color:#2563EB;box-shadow:0 0 0 3px #DBEAFE;}
        .del-btn{background:none;border:none;cursor:pointer;color:#D1D5DB;padding:3px;border-radius:4px;display:flex;align-items:center;opacity:0;transition:opacity 0.15s,color 0.15s;}
        .sel-card:hover .del-btn{opacity:1;}
        .del-btn:hover{color:#EF4444;}
        .skill-pill{display:inline-block;padding:2px 8px;background:#F3F4F6;color:#374151;border-radius:4px;font-size:11.5px;font-weight:500;}
        .add-btn{display:flex;align-items:center;gap:6px;padding:6px 14px;background:#2563EB;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background 0.15s;}
        .add-btn:hover{background:#1D4ED8;}
        .analyze-btn{display:flex;align-items:center;gap:8px;padding:11px 28px;background:#2563EB;color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;}
        .analyze-btn:hover:not(:disabled){background:#1D4ED8;transform:translateY(-1px);box-shadow:0 4px 14px rgba(37,99,235,0.3);}
        .analyze-btn:disabled{background:#E5E7EB;color:#9CA3AF;cursor:not-allowed;}
        .empty-state{background:#fff;border:2px dashed #E5E7EB;border-radius:10px;padding:32px 20px;text-align:center;}
      `}</style>

      <div className="fade-in" style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#2563EB",
            marginBottom: 5,
          }}
        >
          Resume tailoring
        </p>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#111827",
            letterSpacing: "-0.02em",
          }}
        >
          Match your resume to the right role
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 5 }}>
          Upload a resume, add a job — then run the AI analysis.
        </p>
      </div>

      {fetchError && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 13, color: "#DC2626" }}>{fetchError}</p>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Resumes */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Resumes
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  background: "#F3F4F6",
                  padding: "1px 7px",
                  borderRadius: 10,
                }}
              >
                {resumes.length}
              </span>
            </div>
            <button className="add-btn" onClick={() => setShowUpload(true)}>
              <IconPlus /> Upload
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {resumes.length === 0 ? (
              <div className="empty-state">
                <div
                  style={{
                    margin: "0 auto 10px",
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconUpload />
                </div>
                <p
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  No resumes yet
                </p>
                <p
                  style={{ fontSize: 12.5, color: "#9CA3AF", marginBottom: 14 }}
                >
                  Upload a PDF or DOCX to get started
                </p>
                <button
                  className="add-btn"
                  style={{ margin: "0 auto" }}
                  onClick={() => setShowUpload(true)}
                >
                  <IconPlus /> Upload resume
                </button>
              </div>
            ) : (
              resumes.map((r) => (
                <div
                  key={r.id}
                  className={`sel-card ${selectedResumeId === r.id ? "selected" : ""}`}
                  onClick={() =>
                    setSelectedResumeId(r.id === selectedResumeId ? null : r.id)
                  }
                >
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      border: `2px solid ${selectedResumeId === r.id ? "#2563EB" : "#D1D5DB"}`,
                      background:
                        selectedResumeId === r.id ? "#2563EB" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {selectedResumeId === r.id && <IconCheck />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: "#111827",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 2,
                      }}
                    >
                      {r.filename}
                    </p>
                    <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                      {r.skills?.length ?? 0} skills ·{" "}
                      {r.experience?.length ?? 0} roles
                    </p>
                    {r.skills?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                          marginTop: 7,
                        }}
                      >
                        {r.skills.slice(0, 4).map((s) => (
                          <span key={s} className="skill-pill">
                            {s}
                          </span>
                        ))}
                        {r.skills.length > 4 && (
                          <span className="skill-pill">
                            +{r.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="del-btn"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await deleteResume(r.id, token);
                        setResumes((p) => p.filter((x) => x.id !== r.id));
                        if (selectedResumeId === r.id)
                          setSelectedResumeId(null);
                      } catch {
                        // optionally show error
                      }
                    }}
                  >
                    <IconTrash />
                  </button>
                  <button
                    className="del-btn"
                    onClick={(e) => handleViewResume(r.id, e)}
                    style={{ marginRight: 2 }}
                    title="View details"
                  >
                    <IconEye />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Jobs */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Job descriptions
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  background: "#F3F4F6",
                  padding: "1px 7px",
                  borderRadius: 10,
                }}
              >
                {jobs.length}
              </span>
            </div>
            <button className="add-btn" onClick={() => setShowAddJob(true)}>
              <IconPlus /> Add job
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {jobs.length === 0 ? (
              <div className="empty-state">
                <div
                  style={{
                    margin: "0 auto 10px",
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconBriefcase />
                </div>
                <p
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  No jobs added yet
                </p>
                <p
                  style={{ fontSize: 12.5, color: "#9CA3AF", marginBottom: 14 }}
                >
                  Paste a job description to analyze it
                </p>
                <button
                  className="add-btn"
                  style={{ margin: "0 auto" }}
                  onClick={() => setShowAddJob(true)}
                >
                  <IconPlus /> Add job
                </button>
              </div>
            ) : (
              jobs.map((j) => (
                <div
                  key={j.id}
                  className={`sel-card ${selectedJobId === j.id ? "selected" : ""}`}
                  onClick={() =>
                    setSelectedJobId(j.id === selectedJobId ? null : j.id)
                  }
                >
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      border: `2px solid ${selectedJobId === j.id ? "#2563EB" : "#D1D5DB"}`,
                      background: selectedJobId === j.id ? "#2563EB" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {selectedJobId === j.id && <IconCheck />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13.5,
                        fontWeight: 500,
                        color: "#111827",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 2,
                      }}
                    >
                      {j.role}
                    </p>
                    <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                      {j.company} · {j.required_skills?.length ?? 0} required
                      skills
                    </p>
                    {j.required_skills?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                          marginTop: 7,
                        }}
                      >
                        {j.required_skills.slice(0, 4).map((s) => (
                          <span key={s} className="skill-pill">
                            {s}
                          </span>
                        ))}
                        {j.required_skills.length > 4 && (
                          <span className="skill-pill">
                            +{j.required_skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="del-btn"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await deleteJob(j.id, token);
                        setJobs((p) => p.filter((x) => x.id !== j.id));
                        if (selectedJobId === j.id) setSelectedJobId(null);
                      } catch {
                        // optionally show error
                      }
                    }}
                  >
                    <IconTrash />
                  </button>
                  <button
                    className="del-btn"
                    onClick={(e) => handleViewJob(j.id, e)}
                    style={{ marginRight: 2 }}
                    title="View details"
                  >
                    <IconEye />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Analyze bar */}
      <div
        style={{
          background: "#fff",
          border: "1.5px solid #E5E7EB",
          borderRadius: 12,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 4,
            }}
          >
            Run analysis
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {selResume ? (
              <span
                style={{
                  fontSize: 12.5,
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontWeight: 500,
                }}
              >
                {selResume.filename}
              </span>
            ) : (
              <span style={{ fontSize: 12.5, color: "#9CA3AF" }}>
                No resume selected
              </span>
            )}
            <span style={{ fontSize: 12, color: "#D1D5DB" }}>→</span>
            {selJob ? (
              <span
                style={{
                  fontSize: 12.5,
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontWeight: 500,
                }}
              >
                {selJob.role} @ {selJob.company}
              </span>
            ) : (
              <span style={{ fontSize: 12.5, color: "#9CA3AF" }}>
                No job selected
              </span>
            )}
          </div>
          {analyzeError && (
            <p style={{ fontSize: 12.5, color: "#DC2626", marginTop: 6 }}>
              {analyzeError}
            </p>
          )}
        </div>
        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Analyzing…
            </>
          ) : (
            "Analyze match →"
          )}
        </button>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(r) => {
            setResumes((p) => [...p, r]);
            setSelectedResumeId(r.id);
            setShowUpload(false);
          }}
        />
      )}
      {showAddJob && (
        <AddJobModal
          onClose={() => setShowAddJob(false)}
          onSuccess={(j) => {
            setJobs((p) => [...p, j]);
            setSelectedJobId(j.id);
            setShowAddJob(false);
          }}
        />
      )}
      {viewResume && (
        <ResumeDetailModal
          resume={viewResume}
          onClose={() => setViewResume(null)}
        />
      )}
      {viewJob && (
        <JobDetailModal job={viewJob} onClose={() => setViewJob(null)} />
      )}

      {analysisResult && (
        <div style={{ marginTop: 32 }}>
          {/* Score + Summary */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              gap: 18,
              marginBottom: 28,
            }}
          >
            <ScoreRing score={analysisResult.match_score} />
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: "20px 22px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "#9CA3AF",
                  marginBottom: 12,
                }}
              >
                AI summary
              </p>
              <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.75 }}>
                {analysisResult.summary}
              </p>
            </div>
          </div>

          {/* Save Version */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 16,
            }}
          >
            <button
              onClick={handleSaveVersion}
              disabled={versionSaved || versionSaving}
              style={{
                padding: "8px 18px",
                background: versionSaved
                  ? "#F0FDF4"
                  : versionSaving
                    ? "#93C5FD"
                    : "#2563EB",
                color: versionSaved ? "#16A34A" : "#FFFFFF",
                border: versionSaved ? "1.5px solid #BBF7D0" : "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor:
                  versionSaved || versionSaving ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {versionSaved
                ? "✓ Version Saved"
                : versionSaving
                  ? "Saving..."
                  : "💾 Save Version"}
            </button>
          </div>

          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              borderBottom: "1.5px solid #E5E7EB",
              marginBottom: 28,
            }}
          >
            {[
              { id: "analysis", label: "Analysis" },
              {
                id: "skill-gap",
                label: `Skill Gap${analysisResult.missing_skills?.length ? ` (${analysisResult.missing_skills.length})` : ""}`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as "analysis" | "skill-gap");
                  if (tab.id === "skill-gap") {
                    handleLoadSkillGap(
                      analysisResult.missing_skills || [],
                      jobs.find((j) => j.id === analysisJobId)?.role ||
                        "Software Engineer",
                      analysisJobId || 0,
                    );
                  }
                }}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 500,
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid #2563EB"
                      : "2px solid transparent",
                  color: activeTab === tab.id ? "#2563EB" : "#6B7280",
                  cursor: "pointer",
                  marginBottom: -1.5,
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Analysis tab */}
          {activeTab === "analysis" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase" as const,
                        color: "#9CA3AF",
                        margin: 0,
                      }}
                    >
                      Matched skills
                    </p>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#16A34A",
                        background: "#F0FDF4",
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      {analysisResult.matched_skills.length}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap" as const,
                      gap: 6,
                    }}
                  >
                    {analysisResult.matched_skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 500,
                          background: "#F0FDF4",
                          color: "#16A34A",
                          border: "1px solid #BBF7D0",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase" as const,
                        color: "#9CA3AF",
                        margin: 0,
                      }}
                    >
                      Missing skills
                    </p>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#DC2626",
                        background: "#FEF2F2",
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      {analysisResult.missing_skills.length}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap" as const,
                      gap: 6,
                    }}
                  >
                    {analysisResult.missing_skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 500,
                          background: "#FEF2F2",
                          color: "#DC2626",
                          border: "1px solid #FECACA",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Improved bullets */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                      color: "#9CA3AF",
                      margin: 0,
                    }}
                  >
                    Improved bullet points
                  </p>
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                    {analysisResult.improved_bullets.length} suggestion
                    {analysisResult.improved_bullets.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {analysisResult.improved_bullets.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 12,
                      padding: "18px 20px",
                      borderLeft: "4px solid #E5E7EB",
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#9CA3AF",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          marginBottom: 5,
                        }}
                      >
                        Original
                      </p>
                      <p
                        style={{
                          fontSize: 13.5,
                          color: "#9CA3AF",
                          lineHeight: 1.65,
                          textDecoration: "line-through",
                          textDecorationColor: "#D1D5DB",
                        }}
                      >
                        {b.original}
                      </p>
                    </div>
                    <div
                      style={{
                        height: 1,
                        background: "#F3F4F6",
                        marginBottom: 12,
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#2563EB",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase" as const,
                            marginBottom: 5,
                          }}
                        >
                          Improved
                        </p>
                        <p
                          style={{
                            fontSize: 13.5,
                            color: "#111827",
                            lineHeight: 1.65,
                            fontWeight: 500,
                          }}
                        >
                          {b.improved}
                        </p>
                      </div>
                      <CopyButton text={b.improved} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill gap tab */}
          {activeTab === "skill-gap" && (
            <SkillGapTab
              data={skillGapData}
              loading={skillGapLoading}
              error={skillGapError}
              missingSkills={analysisResult.missing_skills || []}
            />
          )}
        </div>
      )}
    </div>
  );
}
