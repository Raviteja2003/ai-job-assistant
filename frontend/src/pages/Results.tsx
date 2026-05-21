import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type TailorResult } from "../types";
import { getSkillGapResources, type SkillGapResponse, type SkillGapItem } from "../api/skillGap";

// ─────────────────────────────────────────────────────────────────────────────
// CopyButton
// ─────────────────────────────────────────────────────────────────────────────
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
          <path d="M2 6.5l3 3 6-6" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2 9V2.5A.5.5 0 012.5 2H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ScoreRing
// ─────────────────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 50, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#16A34A" : score >= 50 ? "#D97706" : "#DC2626";
  const bg = score >= 75 ? "#F0FDF4" : score >= 50 ? "#FFFBEB" : "#FEF2F2";
  const label = score >= 75 ? "Strong match" : score >= 50 ? "Moderate match" : "Weak match";
  return (
    <div style={{
      background: bg,
      border: `1.5px solid ${color}20`,
      borderRadius: 12,
      padding: "24px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
    }}>
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke={`${color}25`} strokeWidth="8" />
        <circle
          cx="62" cy="62" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 62 62)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text x="62" y="57" textAnchor="middle" fontSize="26" fontWeight="600" fill={color} fontFamily="'DM Sans',sans-serif">{score}</text>
        <text x="62" y="73" textAnchor="middle" fontSize="11" fill={color} fontFamily="'DM Sans',sans-serif" opacity="0.65">/ 100</text>
      </svg>
      <p style={{ fontSize: 13, fontWeight: 600, color }}>{label}</p>
      <p style={{ fontSize: 11.5, color: "#9CA3AF" }}>Match score</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillGapTab
// ─────────────────────────────────────────────────────────────────────────────
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
  "course":         "🎓",
  "documentation":  "📄",
  "project idea":   "🛠️",
  "book":           "📚",
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
        <div style={{
          width: 18, height: 18,
          border: "2px solid #E5E7EB", borderTopColor: "#2563EB",
          borderRadius: "50%", animation: "spin 0.7s linear infinite",
          margin: "0 auto 12px",
        }} />
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
              <li key={i} style={{ fontSize: 13, color: "#1E40AF", marginBottom: 6, lineHeight: 1.5 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Skill items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.items.map((item: SkillGapItem, i: number) => (
          <div key={i} style={{
            border: "1.5px solid #E5E7EB",
            borderRadius: 10, background: "#fff", overflow: "hidden",
          }}>
            {/* Skill header */}
            <div style={{
              padding: "14px 16px",
              borderBottom: "1px solid #F1F2F4",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
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
                textTransform: "capitalize", whiteSpace: "nowrap", marginLeft: 12,
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
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 14 }}>{TYPE_ICONS[res.type] || "🔗"}</span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 13, fontWeight: 500, color: "#2563EB", textDecoration: "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        {res.title}
                      </a>
                    </div>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 2px" }}>{res.why}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>⏱ {res.duration}</p>
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

// ─────────────────────────────────────────────────────────────────────────────
// Results page
// ─────────────────────────────────────────────────────────────────────────────
export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<TailorResult | undefined>();
  const [ready, setReady] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"analysis" | "skill-gap">("analysis");
  const [skillGapData, setSkillGapData] = useState<SkillGapResponse | null>(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [skillGapError, setSkillGapError] = useState("");

  const handleLoadSkillGap = async () => {
    if (skillGapData) return;                        // already loaded
    if (!result?.missing_skills?.length) return;     // nothing to analyze
    setSkillGapLoading(true);
    setSkillGapError("");
    try {
      const jobId = location.state?.job_id || 0;
      const data = await getSkillGapResources(
        result.missing_skills,
        location.state?.role || "Software Engineer",
        jobId,
      );
      setSkillGapData(data);
    } catch {
      setSkillGapError("Failed to load skill gap resources. Please try again.");
    } finally {
      setSkillGapLoading(false);
    }
  };

  useEffect(() => {
    const s = location.state?.result as TailorResult | undefined;
    if (!s) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setResult(s);
    setReady(true);
  }, []);

  if (!ready || !result) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 18, height: 18,
          border: "2px solid #E5E7EB", borderTopColor: "#2563EB",
          borderRadius: "50%", animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 860, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .f1{animation:fadeUp 0.3s ease 0.05s both;}
        .f2{animation:fadeUp 0.3s ease 0.12s both;}
        .f3{animation:fadeUp 0.3s ease 0.2s both;}
        .f4{animation:fadeUp 0.3s ease 0.28s both;}
        .wcard{background:#fff;border:1.5px solid #E5E7EB;border-radius:12px;}
        .chip{display:inline-flex;align-items:center;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;}
        .chip-g{background:#F0FDF4;color:#16A34A;border:1px solid #BBF7D0;}
        .chip-r{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;}
        .bullet-card{background:#fff;border:1.5px solid #E5E7EB;border-radius:12px;padding:18px 20px;border-left:4px solid #E5E7EB;transition:border-left-color 0.2s;}
        .bullet-card:hover{border-left-color:#2563EB;}
        .sec-label{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;margin-bottom:12px;}
      `}</style>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="f1" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563EB", marginBottom: 5 }}>
          Analysis results
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "#111827", letterSpacing: "-0.02em" }}>
          Here's how you stack up
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 5 }}>
          AI-powered match between your resume and the job description.
        </p>
      </div>

      {/* ── Score + Summary — always visible regardless of tab ──────────── */}
      <div className="f2" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 18, marginBottom: 28 }}>
        <ScoreRing score={result.match_score} />
        <div className="wcard" style={{ padding: "20px 22px" }}>
          <p className="sec-label">AI summary</p>
          <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.75 }}>{result.summary}</p>
        </div>
      </div>

      {/* ── Tab bar — sits between summary and tab content ──────────────── */}
      <div style={{ display: "flex", borderBottom: "1.5px solid #E5E7EB", marginBottom: 28 }}>
        {[
          { id: "analysis", label: "Analysis" },
          {
            id: "skill-gap",
            label: `Skill Gap${result.missing_skills?.length ? ` (${result.missing_skills.length})` : ""}`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as "analysis" | "skill-gap");
              if (tab.id === "skill-gap") handleLoadSkillGap();
            }}
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #2563EB" : "2px solid transparent",
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

      {/* ── Analysis tab content ─────────────────────────────────────────── */}
      {activeTab === "analysis" && (
        <div>
          {/* Skills row */}
          <div className="f3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <div className="wcard" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p className="sec-label" style={{ margin: 0 }}>Matched skills</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#16A34A", background: "#F0FDF4", padding: "2px 8px", borderRadius: 20 }}>
                  {result.matched_skills.length}
                </span>
              </div>
              {result.matched_skills.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>No skills matched.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.matched_skills.map((s) => (
                    <span key={s} className="chip chip-g">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="wcard" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p className="sec-label" style={{ margin: 0 }}>Missing skills</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#DC2626", background: "#FEF2F2", padding: "2px 8px", borderRadius: 20 }}>
                  {result.missing_skills.length}
                </span>
              </div>
              {result.missing_skills.length === 0 ? (
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>No gaps — great match!</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {result.missing_skills.map((s) => (
                    <span key={s} className="chip chip-r">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Improved bullets */}
          <div className="f4">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p className="sec-label" style={{ margin: 0 }}>Improved bullet points</p>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                {result.improved_bullets.length} suggestion{result.improved_bullets.length !== 1 ? "s" : ""}
              </span>
            </div>
            {result.improved_bullets.length === 0 ? (
              <div className="wcard" style={{ padding: "28px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 13.5, color: "#9CA3AF" }}>No bullet improvements suggested.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.improved_bullets.map((b, i) => (
                  <div key={i} className="bullet-card">
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>
                        Original
                      </p>
                      <p style={{ fontSize: 13.5, color: "#9CA3AF", lineHeight: 1.65, textDecoration: "line-through", textDecorationColor: "#D1D5DB" }}>
                        {b.original}
                      </p>
                    </div>
                    <div style={{ height: 1, background: "#F3F4F6", marginBottom: 12 }} />
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>
                          Improved
                        </p>
                        <p style={{ fontSize: 13.5, color: "#111827", lineHeight: 1.65, fontWeight: 500 }}>
                          {b.improved}
                        </p>
                      </div>
                      <CopyButton text={b.improved} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Skill Gap tab content ────────────────────────────────────────── */}
      {activeTab === "skill-gap" && (
        <SkillGapTab
          data={skillGapData}
          loading={skillGapLoading}
          error={skillGapError}
          missingSkills={result.missing_skills || []}
        />
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 24px", background: "#fff",
            border: "1.5px solid #E5E7EB", borderRadius: 9,
            fontSize: 13.5, fontWeight: 500, color: "#374151",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#2563EB";
            (e.currentTarget as HTMLElement).style.color = "#2563EB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB";
            (e.currentTarget as HTMLElement).style.color = "#374151";
          }}
        >
          ← Analyze another combination
        </button>
      </div>
    </div>
  );
}