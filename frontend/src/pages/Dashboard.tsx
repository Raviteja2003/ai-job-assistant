import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getResumes, uploadResume } from "../api/resume";
import { getJobs, addJob } from "../api/job";
import { analyzeResume } from "../api/tailor";
import { useAuthStore } from "../store/authStore";
import { type Resume, type Job } from "../types";

// ─── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 13V7M10 7L7.5 9.5M10 7L12.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 13.5A3.5 3.5 0 014.5 7a5 5 0 019.9-.5A3 3 0 0117 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" stroke="#6B7280" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M9 2v4h4" stroke="#6B7280" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="#6B7280" strokeWidth="1.3"/>
    <path d="M5 5V4a2 2 0 014 0v1" stroke="#6B7280" strokeWidth="1.3"/>
    <path d="M2 9h12" stroke="#6B7280" strokeWidth="1.3"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M13 5L5 13M5 5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M11 3.5l-.7 7.7a1 1 0 01-1 .8H4.7a1 1 0 01-1-.8L3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Upload Resume Modal ───────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (r: Resume) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.name.endsWith(".docx"))) {
      setFile(dropped);
      setError("");
    } else {
      setError("Only PDF or DOCX files are supported.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setError(""); }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const resume = await uploadResume(file);
      onSuccess(resume);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", fontFamily: "'Playfair Display', serif" }}>Upload Resume</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>PDF or DOCX — AI will parse your skills & experience</p>
          </div>
          <button onClick={onClose} style={iconBtnStyle}><CloseIcon /></button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#2563EB" : file ? "#16A34A" : "#D1D5DB"}`,
            borderRadius: 12,
            padding: "32px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "#EFF6FF" : file ? "#F0FDF4" : "#FAFAFA",
            transition: "all 0.2s",
            marginBottom: 16,
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={handleFileChange} />
          {file ? (
            <>
              <div style={{ width: 44, height: 44, background: "#DCFCE7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11l5 5L18 6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#16A34A" }}>{file.name}</p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
            </>
          ) : (
            <>
              <div style={{ width: 44, height: 44, background: "#F3F4F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#9CA3AF" }}>
                <UploadIcon />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>Drop your file here</p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>or <span style={{ color: "#2563EB" }}>browse files</span> · PDF, DOCX</p>
            </>
          )}
        </div>

        {error && <p style={{ fontSize: 13, color: "#DC2626", marginBottom: 12 }}>{error}</p>}

        {loading && (
          <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 16, height: 16, border: "2px solid #BFDBFE", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: "#1D4ED8" }}>AI is parsing your resume — this may take a moment…</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={secondaryBtnStyle} disabled={loading}>Cancel</button>
          <button onClick={handleUpload} disabled={!file || loading} style={primaryBtnStyle}>
            {loading ? "Uploading…" : "Upload Resume →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Job Modal ─────────────────────────────────────────────────────────────
function AddJobModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (j: Job) => void }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!company.trim() || !role.trim() || !description.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const job = await addJob(company.trim(), role.trim(), description.trim());
      onSuccess(job);
    } catch {
      setError("Failed to add job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827", fontFamily: "'Playfair Display', serif" }}>Add Job Description</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>AI will extract required skills & responsibilities</p>
          </div>
          <button onClick={onClose} style={iconBtnStyle}><CloseIcon /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Company</label>
              <input
                style={inputStyle}
                placeholder="Google"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <input
                style={inputStyle}
                placeholder="Software Engineer"
                value={role}
                onChange={e => setRole(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Job Description</label>
            <textarea
              style={{ ...inputStyle, height: 180, resize: "vertical", lineHeight: 1.6 }}
              placeholder="Paste the full job description here…"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: "#DC2626", marginTop: 12 }}>{error}</p>}

        {loading && (
          <div style={{ background: "#EFF6FF", borderRadius: 8, padding: "12px 16px", marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 16, height: 16, border: "2px solid #BFDBFE", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: "#1D4ED8" }}>AI is parsing the job description…</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={onClose} style={secondaryBtnStyle} disabled={loading}>Cancel</button>
          <button onClick={handleAdd} disabled={loading || !company || !role || !description} style={primaryBtnStyle}>
            {loading ? "Adding…" : "Add Job →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  backdropFilter: "blur(4px)",
};

const modalStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 16, padding: "28px 28px",
  width: "100%", maxWidth: 480,
  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
};

const iconBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: "#9CA3AF", padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
  borderRadius: 6, transition: "color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  border: "1.5px solid #E5E7EB", borderRadius: 8,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#111827",
  outline: "none", background: "#fff",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "10px 20px", background: "#2563EB", color: "#fff",
  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500,
  fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "10px 20px", background: "#F3F4F6", color: "#374151",
  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500,
  fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [analyzeError, setAnalyzeError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, j] = await Promise.all([getResumes(), getJobs()]);
        setResumes(r);
        setJobs(j);
      } catch {
        setFetchError("Failed to load your data. Please refresh.");
      }
    };
    fetchData();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResumeId || !selectedJobId) return;
    setAnalyzeError("");
    setLoading(true);
    try {
      const result = await analyzeResume(selectedResumeId, selectedJobId);
      navigate("/results", { state: { result } });
    } catch {
      setAnalyzeError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const canAnalyze = selectedResumeId !== null && selectedJobId !== null && !loading;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeUp 0.35s ease forwards; }
        .resume-card, .job-card {
          background: #fff;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .resume-card:hover, .job-card:hover {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }
        .resume-card.selected, .job-card.selected {
          border-color: #2563EB;
          background: #EFF6FF;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }
        .skill-tag {
          display: inline-block;
          padding: 2px 8px;
          background: #F3F4F6;
          color: #374151;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #2563EB;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
        }
        .add-btn:hover { background: #1D4ED8; }
        .section-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }
        .section-count {
          font-size: 12px;
          color: #9CA3AF;
          margin-left: 6px;
          font-weight: 400;
        }
        .empty-box {
          background: #fff;
          border: 2px dashed #E5E7EB;
          border-radius: 10px;
          padding: 32px 24px;
          text-align: center;
        }
        .analyze-btn {
          padding: 14px 40px;
          background: #2563EB;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .analyze-btn:hover:not(:disabled) {
          background: #1D4ED8;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .analyze-btn:disabled {
          background: #E5E7EB;
          color: #9CA3AF;
          cursor: not-allowed;
        }
        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #D1D5DB;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .resume-card:hover .delete-btn,
        .job-card:hover .delete-btn { opacity: 1; }
        .delete-btn:hover { color: #EF4444; }
        .nav-link {
          font-size: 13px;
          color: #6B7280;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 6px 12px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .nav-link:hover { background: #F3F4F6; color: #111827; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "#2563EB", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 13L8 3.5L13.5 13H2.5Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: "#111827" }}>JobAssist</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 13, color: "#6B7280", marginRight: 8 }}>{user?.name}</span>
          <button className="nav-link" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Page title ── */}
        <div className="fade-in" style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563EB", marginBottom: 6 }}>Resume Tailoring</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, color: "#111827", lineHeight: 1.25 }}>
            Match your resume<br />to the right role.
          </h1>
        </div>

        {fetchError && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "#DC2626" }}>{fetchError}</p>
          </div>
        )}

        {/* ── Two-column grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>

          {/* ── Resumes ── */}
          <section>
            <div className="section-header">
              <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
                <span className="section-title">My Resumes</span>
                <span className="section-count">({resumes.length})</span>
              </div>
              <button className="add-btn" onClick={() => setShowUploadModal(true)}>
                <PlusIcon /> Upload
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {resumes.length === 0 ? (
                <div className="empty-box">
                  <div style={{ width: 40, height: 40, background: "#F3F4F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#9CA3AF" }}>
                    <UploadIcon />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 4 }}>No resumes yet</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>Upload a PDF or DOCX to get started</p>
                  <button className="add-btn" style={{ margin: "0 auto" }} onClick={() => setShowUploadModal(true)}>
                    <PlusIcon /> Upload Resume
                  </button>
                </div>
              ) : (
                resumes.map(resume => (
                  <div
                    key={resume.id}
                    className={`resume-card ${selectedResumeId === resume.id ? "selected" : ""}`}
                    onClick={() => setSelectedResumeId(resume.id === selectedResumeId ? null : resume.id)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                        {/* Radio circle */}
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                          border: `2px solid ${selectedResumeId === resume.id ? "#2563EB" : "#D1D5DB"}`,
                          background: selectedResumeId === resume.id ? "#2563EB" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s",
                        }}>
                          {selectedResumeId === resume.id && <CheckIcon />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <FileIcon />
                            <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {resume.filename}
                            </p>
                          </div>
                          <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                            {resume.skills?.length ?? 0} skills · {resume.experience?.length ?? 0} roles
                          </p>
                          {resume.skills?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                              {resume.skills.slice(0, 4).map(s => (
                                <span key={s} className="skill-tag">{s}</span>
                              ))}
                              {resume.skills.length > 4 && (
                                <span className="skill-tag">+{resume.skills.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={e => {
                          e.stopPropagation();
                          setResumes(prev => prev.filter(r => r.id !== resume.id));
                          if (selectedResumeId === resume.id) setSelectedResumeId(null);
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Jobs ── */}
          <section>
            <div className="section-header">
              <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
                <span className="section-title">Job Descriptions</span>
                <span className="section-count">({jobs.length})</span>
              </div>
              <button className="add-btn" onClick={() => setShowAddJobModal(true)}>
                <PlusIcon /> Add Job
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {jobs.length === 0 ? (
                <div className="empty-box">
                  <div style={{ width: 40, height: 40, background: "#F3F4F6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#9CA3AF" }}>
                    <BriefcaseIcon />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 4 }}>No jobs added yet</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>Paste a job description to analyze it</p>
                  <button className="add-btn" style={{ margin: "0 auto" }} onClick={() => setShowAddJobModal(true)}>
                    <PlusIcon /> Add Job
                  </button>
                </div>
              ) : (
                jobs.map(job => (
                  <div
                    key={job.id}
                    className={`job-card ${selectedJobId === job.id ? "selected" : ""}`}
                    onClick={() => setSelectedJobId(job.id === selectedJobId ? null : job.id)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0 }}>
                        {/* Radio circle */}
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                          border: `2px solid ${selectedJobId === job.id ? "#2563EB" : "#D1D5DB"}`,
                          background: selectedJobId === job.id ? "#2563EB" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.15s",
                        }}>
                          {selectedJobId === job.id && <CheckIcon />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <BriefcaseIcon />
                            <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {job.role}
                            </p>
                          </div>
                          <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                            {job.company} · {job.required_skills?.length ?? 0} required skills
                          </p>
                          {job.required_skills?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                              {job.required_skills.slice(0, 4).map(s => (
                                <span key={s} className="skill-tag">{s}</span>
                              ))}
                              {job.required_skills.length > 4 && (
                                <span className="skill-tag">+{job.required_skills.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={e => {
                          e.stopPropagation();
                          setJobs(prev => prev.filter(j => j.id !== job.id));
                          if (selectedJobId === job.id) setSelectedJobId(null);
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ── Analyze section ── */}
        <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Run Analysis</p>
              <p style={{ fontSize: 13, color: "#6B7280" }}>
                {!selectedResumeId && !selectedJobId
                  ? "Select a resume and a job description to continue"
                  : !selectedResumeId
                  ? "Select a resume to continue"
                  : !selectedJobId
                  ? "Select a job description to continue"
                  : "Ready to analyze — click the button"}
              </p>
            </div>

            {/* Selection pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {selectedResumeId && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 20 }}>
                  <FileIcon />
                  <span style={{ fontSize: 12, color: "#1D4ED8", fontWeight: 500 }}>
                    {resumes.find(r => r.id === selectedResumeId)?.filename}
                  </span>
                </div>
              )}
              {selectedResumeId && selectedJobId && (
                <span style={{ fontSize: 16, color: "#D1D5DB" }}>→</span>
              )}
              {selectedJobId && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 20 }}>
                  <BriefcaseIcon />
                  <span style={{ fontSize: 12, color: "#1D4ED8", fontWeight: 500 }}>
                    {jobs.find(j => j.id === selectedJobId)?.role} @ {jobs.find(j => j.id === selectedJobId)?.company}
                  </span>
                </div>
              )}
            </div>

            <button className="analyze-btn" onClick={handleAnalyze} disabled={!canAnalyze}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Analyzing…
                </>
              ) : (
                <>Analyze Match →</>
              )}
            </button>
          </div>

          {analyzeError && (
            <p style={{ fontSize: 13, color: "#DC2626", marginTop: 12 }}>{analyzeError}</p>
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={(resume) => {
            setResumes(prev => [...prev, resume]);
            setSelectedResumeId(resume.id);
            setShowUploadModal(false);
          }}
        />
      )}

      {showAddJobModal && (
        <AddJobModal
          onClose={() => setShowAddJobModal(false)}
          onSuccess={(job) => {
            setJobs(prev => [...prev, job]);
            setSelectedJobId(job.id);
            setShowAddJobModal(false);
          }}
        />
      )}
    </div>
  );
}