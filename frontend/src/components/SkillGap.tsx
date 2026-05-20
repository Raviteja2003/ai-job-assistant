const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  low:    { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
};

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  beginner:     { bg: "#F0FDF4", text: "#16A34A" },
  intermediate: { bg: "#FFFBEB", text: "#D97706" },
  advanced:     { bg: "#FEF2F2", text: "#DC2626" },
};

const TYPE_ICONS: Record<string, string> = {
  "course":       "🎓",
  "documentation":"📄",
  "project idea": "🛠️",
  "book":         "📚",
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
      <div style={{
        textAlign: "center", padding: "48px 0",
        background: "#F0FDF4", borderRadius: 10,
        border: "1.5px solid #BBF7D0",
      }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#16A34A", marginBottom: 4 }}>
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
        <p style={{ fontSize: 14, color: "#6B7280" }}>Loading learning resources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: "#FEF2F2", border: "1.5px solid #FECACA",
        borderRadius: 8, padding: "14px 16px", fontSize: 14, color: "#DC2626",
      }}>
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      {/* Learning path */}
      {data.learning_path.length > 0 && (
        <div style={{
          background: "#EFF6FF", border: "1.5px solid #BFDBFE",
          borderRadius: 10, padding: "16px 20px", marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1D4ED8", marginBottom: 10 }}>
            Recommended Learning Path
          </p>
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {data.learning_path.map((step, i) => (
              <li key={i} style={{
                fontSize: 13, color: "#1E40AF",
                marginBottom: 6, lineHeight: 1.5,
              }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Skill items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.items.map((item, i) => (
          <div key={i} style={{
            border: "1.5px solid #E5E7EB",
            borderRadius: 10, background: "#fff", overflow: "hidden",
          }}>
            {/* Skill header */}
            <div style={{
              padding: "14px 16px",
              borderBottom: "1px solid #F1F2F4",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                  {item.skill}
                </span>
                <p style={{ fontSize: 12, color: "#6B7280", margin: "3px 0 0" }}>
                  {item.context}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4,
                background: PRIORITY_COLORS[item.priority]?.bg,
                color: PRIORITY_COLORS[item.priority]?.text,
                border: `1px solid ${PRIORITY_COLORS[item.priority]?.border}`,
                textTransform: "capitalize",
                whiteSpace: "nowrap",
              }}>
                {item.priority} priority
              </span>
            </div>

            {/* Resources */}
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {item.resources.map((res, j) => (
                <div key={j} style={{
                  background: "#F8F9FA", borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 14 }}>{TYPE_ICONS[res.type] || "🔗"}</span>
                      
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 13, fontWeight: 500, color: "#2563EB",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        {res.title}
                      </a>
                    </div>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 2px" }}>
                      {res.why}
                    </p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                      ⏱ {res.duration}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <span style={{
                      fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4,
                      background: LEVEL_COLORS[res.level]?.bg,
                      color: LEVEL_COLORS[res.level]?.text,
                      textTransform: "capitalize", whiteSpace: "nowrap",
                    }}>
                      {res.level}
                    </span>
                    <span style={{
                      fontSize: 10, padding: "2px 7px", borderRadius: 4,
                      background: "#F3F4F6", color: "#374151",
                      textTransform: "capitalize", whiteSpace: "nowrap",
                    }}>
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