import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type TailorResult } from "../types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 10px",background:copied?"#F0FDF4":"#F3F4F6",border:`1px solid ${copied?"#BBF7D0":"#E5E7EB"}`,borderRadius:6,fontSize:12,fontWeight:500,color:copied?"#16A34A":"#6B7280",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0 }}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 9V2.5A.5.5 0 012.5 2H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 50, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#16A34A" : score >= 50 ? "#D97706" : "#DC2626";
  const bg    = score >= 75 ? "#F0FDF4"  : score >= 50 ? "#FFFBEB"  : "#FEF2F2";
  const label = score >= 75 ? "Strong match" : score >= 50 ? "Moderate match" : "Weak match";
  return (
    <div style={{ background:bg, border:`1.5px solid ${color}20`, borderRadius:12, padding:"24px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke={`${color}25`} strokeWidth="8"/>
        <circle cx="62" cy="62" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 62 62)" style={{transition:"stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)"}}/>
        <text x="62" y="57" textAnchor="middle" fontSize="26" fontWeight="600" fill={color} fontFamily="'DM Sans',sans-serif">{score}</text>
        <text x="62" y="73" textAnchor="middle" fontSize="11" fill={color} fontFamily="'DM Sans',sans-serif" opacity="0.65">/ 100</text>
      </svg>
      <p style={{ fontSize:13, fontWeight:600, color }}>{label}</p>
      <p style={{ fontSize:11.5, color:"#9CA3AF" }}>Match score</p>
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<TailorResult | undefined>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = location.state?.result as TailorResult | undefined;
    if (!s) { navigate("/dashboard", { replace: true }); return; }
    setResult(s); setReady(true);
  }, []);

  if (!ready || !result) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:18, height:18, border:"2px solid #E5E7EB", borderTopColor:"#2563EB", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding:"32px 36px", maxWidth:860, fontFamily:"'DM Sans',sans-serif" }}>
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

      {/* Page header */}
      <div className="f1" style={{ marginBottom:24 }}>
        <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#2563EB", marginBottom:5 }}>Analysis results</p>
        <h1 style={{ fontSize:24, fontWeight:600, color:"#111827", letterSpacing:"-0.02em" }}>Here's how you stack up</h1>
        <p style={{ fontSize:14, color:"#6B7280", marginTop:5 }}>AI-powered match between your resume and the job description.</p>
      </div>

      {/* Score + Summary */}
      <div className="f2" style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:18, marginBottom:18 }}>
        <ScoreRing score={result.match_score}/>
        <div className="wcard" style={{ padding:"20px 22px" }}>
          <p className="sec-label">AI summary</p>
          <p style={{ fontSize:13.5, color:"#374151", lineHeight:1.75 }}>{result.summary}</p>
        </div>
      </div>

      {/* Skills */}
      <div className="f3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <div className="wcard" style={{ padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <p className="sec-label" style={{ margin:0 }}>Matched skills</p>
            <span style={{ fontSize:12, fontWeight:600, color:"#16A34A", background:"#F0FDF4", padding:"2px 8px", borderRadius:20 }}>{result.matched_skills.length}</span>
          </div>
          {result.matched_skills.length === 0
            ? <p style={{ fontSize:13, color:"#9CA3AF" }}>No skills matched.</p>
            : <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{result.matched_skills.map(s=><span key={s} className="chip chip-g">{s}</span>)}</div>}
        </div>
        <div className="wcard" style={{ padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <p className="sec-label" style={{ margin:0 }}>Missing skills</p>
            <span style={{ fontSize:12, fontWeight:600, color:"#DC2626", background:"#FEF2F2", padding:"2px 8px", borderRadius:20 }}>{result.missing_skills.length}</span>
          </div>
          {result.missing_skills.length === 0
            ? <p style={{ fontSize:13, color:"#9CA3AF" }}>No gaps — great match!</p>
            : <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{result.missing_skills.map(s=><span key={s} className="chip chip-r">{s}</span>)}</div>}
        </div>
      </div>

      {/* Improved bullets */}
      <div className="f4">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <p className="sec-label" style={{ margin:0 }}>Improved bullet points</p>
          <span style={{ fontSize:12, color:"#9CA3AF" }}>{result.improved_bullets.length} suggestion{result.improved_bullets.length!==1?"s":""}</span>
        </div>
        {result.improved_bullets.length === 0
          ? <div className="wcard" style={{ padding:"28px 20px", textAlign:"center" }}><p style={{ fontSize:13.5, color:"#9CA3AF" }}>No bullet improvements suggested.</p></div>
          : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {result.improved_bullets.map((b,i)=>(
                <div key={i} className="bullet-card">
                  <div style={{ marginBottom:12 }}>
                    <p style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>Original</p>
                    <p style={{ fontSize:13.5, color:"#9CA3AF", lineHeight:1.65, textDecoration:"line-through", textDecorationColor:"#D1D5DB" }}>{b.original}</p>
                  </div>
                  <div style={{ height:1, background:"#F3F4F6", marginBottom:12 }}/>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:11, fontWeight:600, color:"#2563EB", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:5 }}>Improved</p>
                      <p style={{ fontSize:13.5, color:"#111827", lineHeight:1.65, fontWeight:500 }}>{b.improved}</p>
                    </div>
                    <CopyButton text={b.improved}/>
                  </div>
                </div>
              ))}
            </div>}
      </div>

      {/* CTA */}
      <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
        <button
          onClick={()=>navigate("/dashboard")}
          style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 24px",background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:9,fontSize:13.5,fontWeight:500,color:"#374151",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="#2563EB";(e.currentTarget as HTMLElement).style.color="#2563EB";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="#E5E7EB";(e.currentTarget as HTMLElement).style.color="#374151";}}
        >
          ← Analyze another combination
        </button>
      </div>
    </div>
  );
}