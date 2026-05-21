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
import { type Resume, type Job } from "../types";
import { useAuthStore } from "../store/authStore";
import { ResumeDetailModal } from "../components/ResumeDetailModal";
import { JobDetailModal } from "../components/JobDetailModal";

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
    try {
      const result = await analyzeResume(selectedResumeId, selectedJobId);
      navigate("/results", {
        state: {
          result,
          role: jobs.find((j) => j.id === selectedJobId)?.role || "",
          job_id: selectedJobId,
        },
      });
    } catch {
      setAnalyzeError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
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

  return (
    <div
      style={{
        padding: "32px 36px",
        maxWidth: 900,
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
    </div>
  );
}
