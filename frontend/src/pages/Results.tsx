import { useLocation, useNavigate } from "react-router-dom";
import { type TailorResult } from "../types";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result: TailorResult | undefined = location.state?.result;

  if (!result) {
    navigate("/dashboard");
    return null;
  }

  const score = result.match_score;

  // Score color thresholds
  const scoreColor =
    score >= 75 ? "#4ade80" : score >= 50 ? "#c9a84c" : "#f87171";
  const scoreLabel =
    score >= 75 ? "Strong Match" : score >= 50 ? "Moderate Match" : "Weak Match";

  // Arc path for score ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#e8e4dc] font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d0f14; }
        ::-webkit-scrollbar-thumb { background: #2a2d35; border-radius: 2px; }
        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c9a84c;
        }
        .card {
          background: #13151c;
          border: 1px solid #1e2028;
          border-radius: 4px;
        }
        .skill-tag {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          padding: 3px 10px;
          border-radius: 2px;
        }
        .skill-matched {
          background: #0f2a1a;
          color: #4ade80;
          border: 1px solid #166534;
        }
        .skill-missing {
          background: #2a0f0f;
          color: #f87171;
          border: 1px solid #7f1d1d;
        }
        .bullet-card {
          border-left: 2px solid #1e2028;
          transition: border-color 0.2s ease;
        }
        .bullet-card:hover {
          border-left-color: #c9a84c;
        }
        .ring-track {
          stroke: #1e2028;
          fill: none;
          stroke-width: 6;
        }
        .ring-fill {
          fill: none;
          stroke-width: 6;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
          transition: stroke-dashoffset 1s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .fade-up-1 { animation-delay: 0.05s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.15s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.25s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.35s; opacity: 0; }
      `}</style>

      {/* Nav */}
      <nav className="border-b border-[#1e2028] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border border-[#c9a84c] flex items-center justify-center">
            <div className="w-2 h-2 bg-[#c9a84c]" />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 600 }}>
            JobAssist
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-[#4a4d55] hover:text-[#e8e4dc] transition-colors"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
        >
          ← Back
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10 fade-up fade-up-1">
          <p className="section-label mb-3">Analysis Results</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 400, color: "#e8e4dc" }}>
            Here's how you stack up.
          </h1>
        </div>

        {/* Top row: score + summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 fade-up fade-up-2">
          {/* Score ring */}
          <div className="card px-6 py-8 flex flex-col items-center justify-center">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle className="ring-track" cx="65" cy="65" r={radius} />
              <circle
                className="ring-fill"
                cx="65"
                cy="65"
                r={radius}
                stroke={scoreColor}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="text-center -mt-2">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "2rem", fontWeight: 500, color: scoreColor, lineHeight: 1 }}>
                {score}
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#4a4d55", marginTop: "4px" }}>
                MATCH SCORE
              </p>
              <p className="text-xs mt-2" style={{ color: scoreColor }}>{scoreLabel}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="card px-6 py-6 md:col-span-2 flex flex-col justify-center">
            <p className="section-label mb-3">Summary</p>
            <p className="text-[#b8b4ac] text-sm leading-relaxed">{result.summary}</p>
          </div>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 fade-up fade-up-3">
          {/* Matched */}
          <div className="card px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Matched Skills</p>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#4ade80" }}>
                {result.matched_skills.length}
              </span>
            </div>
            {result.matched_skills.length === 0 ? (
              <p className="text-[#4a4d55] text-xs">No skills matched.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.map((s) => (
                  <span key={s} className="skill-tag skill-matched">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Missing */}
          <div className="card px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Missing Skills</p>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#f87171" }}>
                {result.missing_skills.length}
              </span>
            </div>
            {result.missing_skills.length === 0 ? (
              <p className="text-[#4a4d55] text-xs">No gaps found.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s) => (
                  <span key={s} className="skill-tag skill-missing">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Improved bullets */}
        <div className="fade-up fade-up-4">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Improved Bullet Points</p>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#4a4d55" }}>
              {result.improved_bullets.length} suggestions
            </span>
          </div>

          {result.improved_bullets.length === 0 ? (
            <div className="card px-6 py-8 text-center">
              <p className="text-[#4a4d55] text-sm">No bullet improvements suggested.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {result.improved_bullets.map((bullet, i) => (
                <div key={i} className="card px-6 py-5 bullet-card">
                  <div className="mb-3">
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#4a4d55", marginBottom: "6px" }}>
                      ORIGINAL
                    </p>
                    <p className="text-[#6a6d75] text-sm leading-relaxed line-through decoration-[#3a3d45]">
                      {bullet.original}
                    </p>
                  </div>
                  <div className="border-t border-[#1e2028] pt-3">
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.15em", color: "#c9a84c", marginBottom: "6px" }}>
                      IMPROVED
                    </p>
                    <p className="text-[#e8e4dc] text-sm leading-relaxed">
                      {bullet.improved}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Run again */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[#4a4d55] hover:text-[#c9a84c] transition-colors"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}
          >
            ← Analyze another combination
          </button>
        </div>
      </main>
    </div>
  );
}