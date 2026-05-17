import { type Job } from "../types";

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "#9CA3AF",
        marginBottom: 10,
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export function JobDetailModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: 560,
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
          maxHeight: "85vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 3 }}>
              {job.role}
            </p>
            <p style={{ fontSize: 12.5, color: "#6B7280" }}>
              {job.company} · {job.required_skills?.length ?? 0} required skills · {job.responsibilities?.length ?? 0} responsibilities
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
            <IconX />
          </button>
        </div>

        {/* Required Skills */}
        {job.required_skills?.length > 0 && (
          <Section title="Required Skills">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {job.required_skills.map((s: string) => (
                <span key={s} style={{
                  display: "inline-block", padding: "2px 8px",
                  background: "#F3F4F6", color: "#374151",
                  borderRadius: 4, fontSize: 11.5, fontWeight: 500,
                }}>
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <Section title="Responsibilities">
            <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {job.responsibilities.map((r: string, i: number) => (
                <li key={i} style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{r}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* Raw JD Preview */}
        <Section title="Raw Job Description">
          <div style={{
            background: "#F8F9FA",
            border: "1.5px solid #F1F2F4",
            borderRadius: 8,
            padding: "12px 14px",
            maxHeight: 200,
            overflowY: "auto",
          }}>
            <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {job.raw_text
                ? job.raw_text.slice(0, 1000) + (job.raw_text.length > 1000 ? "…" : "")
                : "No description available."}
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}