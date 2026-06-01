import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getResumes, getResume, deleteResume } from "../api/resume";
import { getJobs, getJob, deleteJob } from "../api/job";
import { generateCoverLetter } from "../api/coverLetter";
import { ResumeDetailModal } from "../components/ResumeDetailModal";
import { JobDetailModal } from "../components/JobDetailModal";
import type { Resume, Job } from "../types";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconDoc = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconBriefcase = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconSparkle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />
    <path d="M19 3L19.75 5.25L22 6L19.75 6.75L19 9L18.25 6.75L16 6L18.25 5.25L19 3Z" />
    <path d="M5 17L5.5 18.5L7 19L5.5 19.5L5 21L4.5 19.5L3 19L4.5 18.5L5 17Z" />
  </svg>
);
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

// ─── Tone config ──────────────────────────────────────────────────────────────

type Tone = "formal" | "casual" | "creative";
const TONES: { id: Tone; label: string; desc: string }[] = [
  { id: "formal",   label: "Formal",   desc: "Professional & polished" },
  { id: "casual",   label: "Casual",   desc: "Warm & conversational" },
  { id: "creative", label: "Creative", desc: "Bold & memorable" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoverLetter() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [tone, setTone] = useState<Tone>("formal");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ cover_letter: string; company: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Detail modals
  const [viewResume, setViewResume] = useState<Resume | null>(null);
  const [viewJob, setViewJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    Promise.all([getResumes(), getJobs()]).then(([r, j]) => {
      setResumes(r);
      setJobs(j);
    });
  }, [token]);

  const canGenerate = !!selectedResume && !!selectedJob && !loading;

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!canGenerate || !token) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await generateCoverLetter(
        { resume_id: selectedResume!.id, job_id: selectedJob!.id, tone },
        token
      );
      setResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleViewResume(id: number) {
    if (!token) return;
    try {
      const data = await getResume(id);
      setViewResume(data);
    } catch {}
  }

  async function handleViewJob(id: number) {
    if (!token) return;
    try {
      const data = await getJob(id);
      setViewJob(data);
    } catch {}
  }

  async function handleDeleteResume(id: number) {
    if (!token) return;
    try {
      await deleteResume(id, token);
      setResumes(prev => prev.filter(r => r.id !== id));
      if (selectedResume?.id === id) setSelectedResume(null);
    } catch {}
  }

  async function handleDeleteJob(id: number) {
    if (!token) return;
    try {
      await deleteJob(id, token);
      setJobs(prev => prev.filter(j => j.id !== id));
      if (selectedJob?.id === id) setSelectedJob(null);
    } catch {}
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.cover_letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${result.company}-${result.role}.txt`.toLowerCase().replace(/\s+/g, "-");
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "32px", maxWidth: "820px", margin:"0 auto",fontFamily: "'DM Sans', sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", margin: 0 }}>
          Cover Letter Generator
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
          AI-tailored cover letters matched to the job description.
        </p>
      </div>

      {/* Config card */}
      <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>

        {/* Tone selector */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "10px" }}>
            Tone
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            {TONES.map(t => (
              <button key={t.id} onClick={() => setTone(t.id)} style={{
                flex: 1, padding: "10px 14px", borderRadius: "8px",
                border: tone === t.id ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
                background: tone === t.id ? "#EFF6FF" : "#fff",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: tone === t.id ? "#1D4ED8" : "#374151" }}>
                  {t.label}
                </div>
                <div style={{ fontSize: "11.5px", color: tone === t.id ? "#2563EB" : "#9CA3AF", marginTop: "2px" }}>
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Resume + Job selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

          {/* Resume */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <IconDoc /> Resume
            </label>
            {resumes.length === 0 ? (
              <EmptySelect label="No resumes uploaded" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {resumes.map(r => (
                  <SelectCard
                    key={r.id}
                    label={r.filename}
                    sublabel={`${r.skills?.length ?? 0} skills`}
                    selected={selectedResume?.id === r.id}
                    onClick={() => setSelectedResume(prev => prev?.id === r.id ? null : r)}
                    onView={() => handleViewResume(r.id)}
                    onDelete={() => handleDeleteResume(r.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Job */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <IconBriefcase /> Job Description
            </label>
            {jobs.length === 0 ? (
              <EmptySelect label="No jobs added" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {jobs.map(j => (
                  <SelectCard
                    key={j.id}
                    label={j.role}
                    sublabel={j.company}
                    selected={selectedJob?.id === j.id}
                    onClick={() => setSelectedJob(prev => prev?.id === j.id ? null : j)}
                    onView={() => handleViewJob(j.id)}
                    onDelete={() => handleDeleteJob(j.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: "16px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: "13px", color: "#DC2626" }}>
            {error}
          </div>
        )}

        {/* Generate button */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "10px 20px", borderRadius: "8px", border: "none",
              background: canGenerate ? "#2563EB" : "#E5E7EB",
              color: canGenerate ? "#fff" : "#9CA3AF",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
              cursor: canGenerate ? "pointer" : "not-allowed", transition: "background 0.15s",
            }}
            onMouseOver={e => { if (canGenerate) (e.currentTarget as HTMLButtonElement).style.background = "#1D4ED8"; }}
            onMouseOut={e => { if (canGenerate) (e.currentTarget as HTMLButtonElement).style.background = "#2563EB"; }}
          >
            {loading ? <><Spinner /> Generating…</> : <><IconSparkle /> Generate Cover Letter</>}
          </button>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                {result.role} · {result.company}
              </div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", textTransform: "capitalize" }}>
                {tone} tone
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <ActionButton onClick={handleCopy} icon={<IconCopy />} label={copied ? "Copied!" : "Copy"} success={copied} />
              <ActionButton onClick={handleDownload} icon={<IconDownload />} label="Download .txt" />
              <ActionButton onClick={handleGenerate} icon={<IconRefresh />} label="Regenerate" />
            </div>
          </div>
          <textarea
            value={result.cover_letter}
            onChange={e => setResult({ ...result, cover_letter: e.target.value })}
            rows={20}
            style={{
              width: "100%", boxSizing: "border-box",
              fontFamily: "'DM Sans', sans-serif", fontSize: "13.5px",
              lineHeight: "1.75", color: "#374151",
              background: "#F8F9FA", border: "1.5px solid #E5E7EB",
              borderRadius: "8px", padding: "16px", resize: "vertical", outline: "none",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "#2563EB"}
            onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
          />
          <p style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "8px" }}>
            You can edit the letter directly above before copying or downloading.
          </p>
        </div>
      )}

      {/* Detail modals */}
      {viewResume && <ResumeDetailModal resume={viewResume} onClose={() => setViewResume(null)} />}
      {viewJob && <JobDetailModal job={viewJob} onClose={() => setViewJob(null)} />}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectCard({
  label, sublabel, selected, onClick, onView, onDelete,
}: {
  label: string;
  sublabel: string;
  selected: boolean;
  onClick: () => void;
  onView: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "10px 12px", borderRadius: "8px",
        border: selected ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
        background: selected ? "#EFF6FF" : "#fff",
        transition: "all 0.15s",
      }}
    >
      {/* Radio — selects the card */}
      <div
        onClick={onClick}
        style={{
          width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
          border: selected ? "5px solid #2563EB" : "1.5px solid #D1D5DB",
          cursor: "pointer", transition: "all 0.15s",
        }}
      />

      {/* Label — also selects */}
      <div onClick={onClick} style={{ flex: 1, overflow: "hidden", cursor: "pointer" }}>
        <div style={{
          fontSize: "12.5px", fontWeight: 500,
          color: selected ? "#1D4ED8" : "#374151",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {label}
        </div>
        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{sublabel}</div>
      </div>

      {/* View + Delete — visible on hover */}
      <div style={{ display: "flex", gap: "4px", opacity: hovered ? 1 : 0, transition: "opacity 0.15s", flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          style={{ background: "#F3F4F6", border: "none", borderRadius: "5px", padding: "4px 6px", cursor: "pointer", color: "#6B7280", display: "flex", alignItems: "center" }}
          title="View details"
        >
          <IconEye />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ background: "#FEF2F2", border: "none", borderRadius: "5px", padding: "4px 6px", cursor: "pointer", color: "#DC2626", display: "flex", alignItems: "center" }}
          title="Delete"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

function EmptySelect({ label }: { label: string }) {
  return (
    <div style={{
      padding: "14px", borderRadius: "8px", border: "1.5px dashed #E5E7EB",
      fontSize: "12.5px", color: "#9CA3AF", textAlign: "center",
    }}>
      {label}
    </div>
  );
}

function ActionButton({ onClick, icon, label, success }: {
  onClick: () => void; icon: React.ReactNode; label: string; success?: boolean;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "5px",
      padding: "7px 12px", borderRadius: "7px",
      border: success ? "1px solid #BBF7D0" : "1px solid #E5E7EB",
      background: success ? "#F0FDF4" : "#fff",
      color: success ? "#16A34A" : "#374151",
      fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", fontWeight: 500,
      cursor: "pointer", transition: "all 0.15s",
    }}>
      {icon}{label}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}