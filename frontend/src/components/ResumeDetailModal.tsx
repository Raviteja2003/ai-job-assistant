import { type Resume } from "../types";

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

export function ResumeDetailModal({
  resume,
  onClose,
}: {
  resume: Resume;
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
          maxWidth: 580,
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
              {resume.filename}
            </p>
            <p style={{ fontSize: 12.5, color: "#9CA3AF" }}>
              {resume.skills?.length ?? 0} skills · {resume.experience?.length ?? 0} roles · {resume.projects?.length ?? 0} projects
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
            <IconX />
          </button>
        </div>

        {/* Skills */}
        {resume.skills?.length > 0 && (
          <Section title="Skills">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {resume.skills.map((s: string) => (
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

        {/* Experience */}
        {resume.experience?.length > 0 && (
          <Section title="Experience">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {resume.experience.map((exp: any, i: number) => (
                <div key={i} style={{ borderLeft: "2px solid #E5E7EB", paddingLeft: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 4 }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>
                        {exp.title ?? exp.role ?? "Role"}
                      </p>
                      <p style={{ fontSize: 12.5, color: "#6B7280" }}>
                        {exp.company ?? exp.organization ?? ""}
                      </p>
                    </div>
                    {(exp.duration ?? exp.dates ?? exp.period) && (
                      <span style={{ fontSize: 11.5, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: 4 }}>
                        {exp.duration ?? exp.dates ?? exp.period}
                      </span>
                    )}
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.6 }}>
                      {exp.description}
                    </p>
                  )}
                  {exp.bullets?.length > 0 && (
                    <ul style={{ marginTop: 6, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                      {exp.bullets.map((b: string, bi: number) => (
                        <li key={bi} style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.6 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {resume.projects?.length > 0 && (
          <Section title="Projects">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {resume.projects.map((proj: any, i: number) => (
                <div key={i} style={{ borderLeft: "2px solid #E5E7EB", paddingLeft: 12 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>
                    {proj.name ?? proj.title ?? `Project ${i + 1}`}
                  </p>
                  {proj.tech?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                      {proj.tech.map((t: string) => (
                        <span key={t} style={{
                          display: "inline-block", padding: "2px 8px",
                          background: "#F3F4F6", color: "#374151",
                          borderRadius: 4, fontSize: 11.5, fontWeight: 500,
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.description && (
                    <p style={{ fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.6 }}>
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets?.length > 0 && (
                    <ul style={{ marginTop: 6, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                      {proj.bullets.map((b: string, bi: number) => (
                        <li key={bi} style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.6 }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}