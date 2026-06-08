import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { listResumeVersions, deleteResumeVersion } from "../api/resume_version";
import type { ResumeVersionOut } from "../api/resume_version";
import { exportResumeVersionPdf } from "../api/pdfExport";
const SCORE_COLOR = (score: number) => {
  if (score >= 75)
    return { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" };
  if (score >= 50)
    return { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  return { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
};

export default function ResumeVersions() {
  const { token } = useAuthStore();
  const [versions, setVersions] = useState<ResumeVersionOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ResumeVersionOut | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    listResumeVersions(token!).then((data) => {
      setVersions(data);
      setLoading(false);
    });
  }, [token]);

  const handleExport = async (version: ResumeVersionOut) => {
    setExporting(true);
    try {
      await exportResumeVersionPdf(version.id, version.version_name, token!);
    } catch {
      // optionally show error
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    await deleteResumeVersion(id, token!);
    setVersions((prev) => prev.filter((v) => v.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeletingId(null);
  };

  return (
    <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}
        >
          Resume Versions
        </h1>
        <p style={{ color: "#6B7280", fontSize: 14, marginTop: 6 }}>
          Saved tailored resume versions from your job applications.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading versions...</p>
      ) : versions.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E5E7EB",
            borderRadius: 12,
            padding: 48,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>
            No saved versions yet.
          </p>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>
            Tailor your resume on the Dashboard, then click "Save Version" on
            the Results page.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {versions.map((v) => {
            const sc = SCORE_COLOR(v.match_score);
            return (
              <div
                key={v.id}
                onClick={() => setSelected(v)}
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 12,
                  padding: 20,
                  cursor: "pointer",
                  position: "relative",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "#2563EB")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "#E5E7EB")
                }
              >
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(v.id, e)}
                  disabled={deletingId === v.id}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9CA3AF",
                    fontSize: 16,
                    opacity: 0,
                    transition: "opacity 0.15s",
                    padding: 4,
                  }}
                  className="delete-btn"
                >
                  ✕
                </button>

                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    margin: "0 0 6px 0",
                    paddingRight: 20,
                  }}
                >
                  {v.version_name}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    margin: "0 0 12px 0",
                  }}
                >
                  {new Date(v.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {/* Match Score */}
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: sc.bg,
                    color: sc.color,
                    border: `1px solid ${sc.border}`,
                    marginBottom: 10,
                  }}
                >
                  {v.match_score}% Match
                </span>

                {/* Missing skills preview */}
                {v.missing_skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {v.missing_skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        style={{
                          background: "#F3F4F6",
                          color: "#374151",
                          borderRadius: 4,
                          fontSize: 11,
                          padding: "2px 7px",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {v.missing_skills.length > 3 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#9CA3AF",
                          padding: "2px 4px",
                        }}
                      >
                        +{v.missing_skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              width: "100%",
              maxWidth: 680,
              height: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E5E7EB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {selected.version_name}
                </h2>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  Saved{" "}
                  {new Date(selected.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => handleExport(selected)}
                  disabled={exporting}
                  style={{
                    padding: "7px 16px",
                    background: exporting ? "#93C5FD" : "#2563EB",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: exporting ? "not-allowed" : "pointer",
                  }}
                >
                  {exporting ? "Exporting..." : "⬇ Download PDF"}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 20,
                    color: "#9CA3AF",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Match Score */}
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Match Score
                </p>
                {(() => {
                  const sc = SCORE_COLOR(selected.match_score);
                  return (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 14px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                      }}
                    >
                      {selected.match_score}%
                    </span>
                  );
                })()}
              </div>

              {/* Missing Skills */}
              {selected.missing_skills.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Missing Skills
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selected.missing_skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          background: "#FEF2F2",
                          color: "#DC2626",
                          border: "1px solid #FECACA",
                          borderRadius: 4,
                          fontSize: 12,
                          padding: "3px 9px",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improved Bullets */}
              {selected.improved_bullets.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: 12,
                    }}
                  >
                    Improved Bullets
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {selected.improved_bullets.map((bullet, i) => (
                      <div
                        key={i}
                        style={{
                          border: "1.5px solid #E5E7EB",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            background: "#F9FAFB",
                            padding: "10px 14px",
                            borderBottom: "1px solid #E5E7EB",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#9CA3AF",
                              margin: "0 0 4px 0",
                            }}
                          >
                            ORIGINAL
                          </p>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#6B7280",
                              margin: 0,
                              lineHeight: 1.5,
                            }}
                          >
                            {bullet.original}
                          </p>
                        </div>
                        <div
                          style={{
                            padding: "10px 14px",
                            background: "#FFFFFF",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#16A34A",
                              margin: "0 0 4px 0",
                            }}
                          >
                            IMPROVED
                          </p>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#111827",
                              margin: 0,
                              lineHeight: 1.5,
                            }}
                          >
                            {bullet.improved}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hover CSS for delete button */}
      <style>{`
        div:hover > .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
