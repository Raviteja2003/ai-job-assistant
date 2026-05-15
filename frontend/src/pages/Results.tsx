import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type TailorResult } from "../types";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M2 10V2.5A.5.5 0 012.5 2H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const CheckSmallIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7L5.5 10L11.5 4" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Copy button with feedback ─────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 10px",
        background: copied ? "#F0FDF4" : "#F3F4F6",
        border: `1px solid ${copied ? "#BBF7D0" : "#E5E7EB"}`,
        borderRadius: 6,
        fontSize: 12, fontWeight: 500,
        color: copied ? "#16A34A" : "#6B7280",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      {copied ? <CheckSmallIcon /> : <CopyIcon />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? "#16A34A" : score >= 50 ? "#D97706" : "#DC2626";
  const bg    = score >= 75 ? "#F0FDF4"  : score >= 50 ? "#FFFBEB"  : "#FEF2F2";
  const label = score >= 75 ? "Strong Match" : score >= 50 ? "Moderate Match" : "Weak Match";

  return (
    <div style={{
      background: bg,
      border: `1.5px solid ${color}22`,
      borderRadius: 16,
      padding: "28px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 4,
    }}>
      <svg width="136" height="136" viewBox="0 0 136 136" style={{ overflow: "visible" }}>
        {/* Track */}
        <circle cx="68" cy="68" r={radius} fill="none" stroke={`${color}22`} strokeWidth="8" />
        {/* Fill */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 68 68)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        {/* Score text */}
        <text x="68" y="62" textAnchor="middle" fontSize="28" fontWeight="700" fill={color} fontFamily="'DM Sans', sans-serif">{score}</text>
        <text x="68" y="80" textAnchor="middle" fontSize="11" fill={color} fontFamily="'DM Sans', sans-serif" opacity="0.7">/ 100</text>
      </svg>
      <p style={{ fontSize: 13, fontWeight: 600, color, marginTop: 4 }}>{label}</p>
      <p style={{ fontSize: 11, color: "#9CA3AF" }}>Match Score</p>
    </div>
  );
}

// ─── Main Results ──────────────────────────────────────────────────────────────
export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Fix: read state once on mount, don't navigate inline during render
  const [result, setResult] = useState<TailorResult | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = location.state?.result as TailorResult | undefined;
    if (!state) {
      navigate("/dashboard", { replace: true });
    } else {
      setResult(state);
      setReady(true);
    }
  }, []);

  if (!ready || !result) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F9FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 20, height: 20, border: "2px solid #E5E7EB", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const score = result.match_score;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-1 { animation: fadeUp 0.35s ease 0.05s both; }
        .fade-2 { animation: fadeUp 0.35s ease 0.15s both; }
        .fade-3 { animation: fadeUp 0.35s ease 0.25s both; }
        .fade-4 { animation: fadeUp 0.35s ease 0.35s both; }
        .white-card {
          background: #fff;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
        }
        .skill-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .chip-green { background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }
        .chip-red   { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
        .bullet-card {
          background: #fff;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px 20px;
          border-left: 4px solid #E5E7EB;
          transition: border-left-color 0.2s;
        }
        .bullet-card:hover { border-left-color: #2563EB; }
        .nav-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          font-size: 13px; font-weight: 500;
          color: #6B7280; font-family: 'DM Sans', sans-serif;
          padding: 6px 10px; border-radius: 6px;
          transition: background 0.15s, color 0.15s;
        }
        .nav-btn:hover { background: #F3F4F6; color: #111827; }
        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9CA3AF;
          margin-bottom: 12px;
        }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #E5E7EB",
        padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "#2563EB", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 13L8 3.5L13.5 13H2.5Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: "#111827" }}>JobAssist</span>
        </div>
        <button className="nav-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeftIcon /> Back to Dashboard
        </button>
      </nav>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Page header ── */}
        <div className="fade-1" style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2563EB", marginBottom: 6 }}>
            Analysis Results
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 600, color: "#111827" }}>
            Here's how you stack up.
          </h1>
        </div>

        {/* ── Score + Summary ── */}
        <div className="fade-2" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, marginBottom: 20 }}>
          <ScoreRing score={score} />

          <div className="white-card" style={{ padding: "24px 24px" }}>
            <p className="section-label">AI Summary</p>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{result.summary}</p>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="fade-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Matched */}
          <div className="white-card" style={{ padding: "20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p className="section-label" style={{ margin: 0 }}>✅ Matched Skills</p>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", background: "#F0FDF4", padding: "2px 8px", borderRadius: 20 }}>
                {result.matched_skills.length}
              </span>
            </div>
            {result.matched_skills.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>No skills matched.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.matched_skills.map(s => (
                  <span key={s} className="skill-chip chip-green">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Missing */}
          <div className="white-card" style={{ padding: "20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p className="section-label" style={{ margin: 0 }}>❌ Missing Skills</p>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", background: "#FEF2F2", padding: "2px 8px", borderRadius: 20 }}>
                {result.missing_skills.length}
              </span>
            </div>
            {result.missing_skills.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>No gaps found — great match!</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.missing_skills.map(s => (
                  <span key={s} className="skill-chip chip-red">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Improved Bullets ── */}
        <div className="fade-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <p className="section-label" style={{ margin: 0 }}>Improved Bullet Points</p>
            </div>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              {result.improved_bullets.length} suggestion{result.improved_bullets.length !== 1 ? "s" : ""}
            </span>
          </div>

          {result.improved_bullets.length === 0 ? (
            <div className="white-card" style={{ padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>No bullet improvements suggested.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {result.improved_bullets.map((bullet, i) => (
                <div key={i} className="bullet-card">
                  {/* Original */}
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                      Original
                    </p>
                    <p style={{ fontSize: 13, color: "#9CA3AF", lineHeight: 1.6, textDecoration: "line-through", textDecorationColor: "#D1D5DB" }}>
                      {bullet.original}
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: "#F3F4F6", marginBottom: 14 }} />

                  {/* Improved */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                        Improved
                      </p>
                      <p style={{ fontSize: 13, color: "#111827", lineHeight: 1.7, fontWeight: 500 }}>
                        {bullet.improved}
                      </p>
                    </div>
                    <CopyButton text={bullet.improved} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 28px",
              background: "#fff", border: "1.5px solid #E5E7EB",
              borderRadius: 10, fontSize: 14, fontWeight: 500,
              color: "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#2563EB";
              (e.currentTarget as HTMLButtonElement).style.color = "#2563EB";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
              (e.currentTarget as HTMLButtonElement).style.color = "#374151";
            }}
          >
            <ArrowLeftIcon /> Analyze another combination
          </button>
        </div>
      </main>
    </div>
  );
}