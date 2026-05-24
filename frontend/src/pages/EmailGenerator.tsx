import { useState, useEffect } from "react";
import { generateEmail } from "../api/emailGenerator";
import type { EmailType, EmailTone, EmailGenerateResponse } from "../api/emailGenerator";
import { getResumes } from "../api/resume";
import { getJobs } from "../api/job";
import type { Resume, Job } from "../types";
import { ResumeDetailModal } from "../components/ResumeDetailModal";
import { JobDetailModal } from "../components/JobDetailModal";

// ─── Config ──────────────────────────────────────────────────────────────────
const EMAIL_TYPES: { id: EmailType; label: string; description: string; icon: string }[] = [
  {
    id: "follow-up",
    label: "Follow-Up",
    description: "Check in after submitting your application",
    icon: "📬",
  },
  {
    id: "thank-you",
    label: "Thank-You",
    description: "Express gratitude after an interview",
    icon: "🤝",
  },
  {
    id: "withdrawal",
    label: "Withdrawal",
    description: "Professionally withdraw your application",
    icon: "↩️",
  },
];

const TONES: { id: EmailTone; label: string; description: string }[] = [
  { id: "formal",       label: "Formal",       description: "Professional and structured" },
  { id: "casual",       label: "Casual",        description: "Friendly but still professional" },
  { id: "enthusiastic", label: "Enthusiastic",  description: "Energetic and excited" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function EmailGenerator() {
  const [resumes, setResumes]                   = useState<Resume[]>([]);
  const [jobs, setJobs]                         = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId]       = useState<number | null>(null);
  const [emailType, setEmailType]               = useState<EmailType>("follow-up");
  const [tone, setTone]                         = useState<EmailTone>("formal");
  const [interviewerName, setInterviewerName]   = useState("");
  const [daysSinceApplied, setDaysSinceApplied] = useState("");
  const [result, setResult]                     = useState<EmailGenerateResponse | null>(null);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");
  const [viewResume, setViewResume]             = useState<Resume | null>(null);
  const [viewJob, setViewJob]                   = useState<Job | null>(null);
  const [copied, setCopied]                     = useState(false);

  useEffect(() => {
    getResumes().then(setResumes).catch(() => {});
    getJobs().then(setJobs).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!selectedResumeId || !selectedJobId) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await generateEmail({
        resume_id: selectedResumeId,
        job_id: selectedJobId,
        email_type: emailType,
        tone,
        interviewer_name: interviewerName.trim() || undefined,
        days_since_applied: daysSinceApplied ? parseInt(daysSinceApplied) : undefined,
      });
      setResult(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const content = `Subject: ${result.subject}\n\n${result.body}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.email_type}-email-${result.company.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    setResult(null);
    handleGenerate();
  };

  const canGenerate = selectedResumeId && selectedJobId && !loading;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 900, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563EB", marginBottom: 5 }}>
          AI-Powered
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "#111827", letterSpacing: "-0.02em", marginBottom: 5 }}>
          Email Generator
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Generate professional job application emails tailored to your resume and the role.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr" : "380px 1fr", gap: 24 }}>

        {/* ── Left: Config panel (hidden after result on small screens) ── */}
        {!result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Email type */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                Email Type
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EMAIL_TYPES.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setEmailType(type.id)}
                    style={{
                      border: emailType === type.id ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      padding: "12px 14px",
                      cursor: "pointer",
                      background: emailType === type.id ? "#EFF6FF" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{type.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: emailType === type.id ? "#1D4ED8" : "#111827", marginBottom: 1 }}>
                        {type.label}
                      </p>
                      <p style={{ fontSize: 12, color: "#6B7280" }}>{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                Tone
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    title={t.description}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: tone === t.id ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
                      background: tone === t.id ? "#EFF6FF" : "#fff",
                      color: tone === t.id ? "#1D4ED8" : "#374151",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional context fields */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                Optional Details
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>
                    Interviewer Name <span style={{ color: "#9CA3AF" }}>(for Thank-You emails)</span>
                  </label>
                  <input
                    type="text"
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="e.g. Sarah Johnson"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#111827",
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>
                    Days Since Applied <span style={{ color: "#9CA3AF" }}>(for Follow-Up emails)</span>
                  </label>
                  <input
                    type="number"
                    value={daysSinceApplied}
                    onChange={(e) => setDaysSinceApplied(e.target.value)}
                    placeholder="e.g. 7"
                    min={1}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#111827",
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Right: Resume + Job selectors ── */}
        {!result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Resume selector */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                Select Resume
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {resumes.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResumeId(selectedResumeId === r.id ? null : r.id)}
                    style={{
                      border: selectedResumeId === r.id ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: selectedResumeId === r.id ? "#EFF6FF" : "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{r.filename}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewResume(r); }}
                      style={{ fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      View
                    </button>
                  </div>
                ))}
                {resumes.length === 0 && (
                  <p style={{ fontSize: 13, color: "#9CA3AF" }}>No resumes uploaded yet.</p>
                )}
              </div>
            </div>

            {/* Job selector */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                Select Job Description
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => setSelectedJobId(selectedJobId === j.id ? null : j.id)}
                    style={{
                      border: selectedJobId === j.id ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      background: selectedJobId === j.id ? "#EFF6FF" : "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{j.role}</span>
                      <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 6 }}>@ {j.company}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewJob(j); }}
                      style={{ fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      View
                    </button>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <p style={{ fontSize: 13, color: "#9CA3AF" }}>No job descriptions added yet.</p>
                )}
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
                padding: "11px 24px",
                fontSize: 14,
                fontWeight: 500,
                cursor: canGenerate ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
                marginTop: 4,
              }}
            >
              {loading ? "Generating email..." : "Generate Email"}
            </button>

            {error && (
              <div style={{
                background: "#FEF2F2", border: "1.5px solid #FECACA",
                borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#DC2626",
              }}>
                {error}
              </div>
            )}

          </div>
        )}

        {/* ── Result panel ── */}
        {result && (
          <div>
            {/* Result header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4,
                    background: "#EFF6FF", color: "#1D4ED8", textTransform: "capitalize",
                  }}>
                    {result.email_type}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4,
                    background: "#F3F4F6", color: "#374151", textTransform: "capitalize",
                  }}>
                    {result.tone}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "#6B7280" }}>
                  {result.role} at {result.company}
                </p>
              </div>
              <button
                onClick={() => setResult(null)}
                style={{
                  fontSize: 13, color: "#6B7280", background: "none",
                  border: "1.5px solid #E5E7EB", borderRadius: 7,
                  padding: "6px 14px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ← Back
              </button>
            </div>

            {/* Subject line */}
            <div style={{
              background: "#F8F9FA", border: "1.5px solid #E5E7EB",
              borderRadius: 8, padding: "10px 16px", marginBottom: 12,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Subject
              </span>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#111827", marginTop: 3 }}>
                {result.subject}
              </p>
            </div>

            {/* Body textarea */}
            <textarea
              value={result.body}
              onChange={(e) => setResult({ ...result, body: e.target.value })}
              style={{
                width: "100%",
                minHeight: 320,
                padding: "16px",
                border: "1.5px solid #E5E7EB",
                borderRadius: 10,
                fontSize: 13.5,
                color: "#374151",
                lineHeight: 1.75,
                resize: "vertical",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button
                onClick={handleCopy}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px",
                  background: copied ? "#F0FDF4" : "#F3F4F6",
                  border: `1.5px solid ${copied ? "#BBF7D0" : "#E5E7EB"}`,
                  borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: copied ? "#16A34A" : "#374151",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px",
                  background: "#fff", border: "1.5px solid #E5E7EB",
                  borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: "#374151", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Download .txt
              </button>
              <button
                onClick={handleRegenerate}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px",
                  background: "#fff", border: "1.5px solid #E5E7EB",
                  borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: "#374151", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewResume && <ResumeDetailModal resume={viewResume} onClose={() => setViewResume(null)} />}
      {viewJob && <JobDetailModal job={viewJob} onClose={() => setViewJob(null)} />}
    </div>
  );
}