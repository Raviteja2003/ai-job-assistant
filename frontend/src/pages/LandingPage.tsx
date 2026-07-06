import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Mail,
  HelpCircle,
  Mic,
  KanbanSquare,
  DollarSign,
  TrendingUp,
  Send,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/**
 * Landing page for AI Job Assistant.
 *
 * Design tokens (matches the app's own dashboard palette):
 *   --bg           #f4f5f8   page background
 *   --card         #ffffff   card surfaces
 *   --ink          #14161c   primary text
 *   --ink-soft     #6b7280   secondary text
 *   --ink-faint    #9aa0ab   tertiary text
 *   --border       #e6e8ec   hairline borders
 *   --accent       #375dfb   primary blue
 *   --accent-dark  #2947d1   hover / pressed blue
 *   --accent-tint  #eaefff   pale blue backgrounds
 *   --success      #16a34a   offer / positive state
 *   --success-tint #e8f7ee
 *
 * Drop this in as a route (e.g. `/` or `/welcome`) in your existing
 * React + Vite + Tailwind app. Requires `lucide-react`
 * (already used elsewhere in your projects) — `npm i lucide-react`.
 */

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: <FileText size={19} />,
    title: "Resume tailoring",
    description:
      "Get a match score against any job description, see exactly which skills you're missing, and receive rewritten bullet points that close the gap.",
  },
  {
    icon: <Mail size={19} />,
    title: "Cover letters",
    description:
      "Generate a cover letter tuned to the role in Formal, Casual, or Creative tone — grounded in your actual experience, not filler.",
  },
  {
    icon: <HelpCircle size={19} />,
    title: "Interview prep",
    description:
      "Ten questions built from your resume and the job posting, sorted by category and difficulty, each with a sample answer to study.",
  },
  {
    icon: <Mic size={19} />,
    title: "Mock interview",
    description:
      "Practice in a live chat interview scored answer by answer, then get a hiring report with strengths, gaps, and a final recommendation.",
  },
  {
    icon: <KanbanSquare size={19} />,
    title: "Application tracker",
    description:
      "Move every role through Saved → Applied → Interview → Offer, with notes, salary, and links kept next to each card.",
  },
  {
    icon: <DollarSign size={19} />,
    title: "Salary insights",
    description:
      "See an AI-estimated market range by role, location, and experience — in your local currency, with negotiation tips included.",
  },
  {
    icon: <TrendingUp size={19} />,
    title: "Skill gap analyzer",
    description:
      "For every missing skill, get a priority rating and a learning resource, arranged into one recommended path forward.",
  },
  {
    icon: <Send size={19} />,
    title: "Email generator",
    description:
      "Draft follow-up, thank-you, and withdrawal emails that read like you wrote them, tuned to your resume and the role.",
  },
  {
    icon: <BarChart3 size={19} />,
    title: "Analytics dashboard",
    description:
      "Watch your funnel, activity timeline, and response and offer rates so you know where the pipeline actually breaks down.",
  },
];

const STEPS = [
  {
    index: "01",
    title: "Upload your resume",
    description:
      "PDF or DOCX. Skills, experience, projects, and education get parsed out automatically.",
  },
  {
    index: "02",
    title: "Paste the job",
    description:
      "Drop in any job description and the required skills and responsibilities get extracted in seconds.",
  },
  {
    index: "03",
    title: "Analyze the match",
    description:
      "Get your score, missing skills, and rewritten bullets — then export a tailored resume as PDF.",
  },
  {
    index: "04",
    title: "Prep and track",
    description:
      "Practice the interview, send the follow-up, and move the card to Offer when it's time.",
  },
];

const STATS = [
  { num: "12", label: "AI-powered tools in one dashboard" },
  { num: "53+", label: "skills parsed per resume" },
  { num: "4", label: "pipeline stages tracked automatically" },
  { num: "3", label: "tones for every cover letter & email" },
];

const STACK = [
  "React + TypeScript",
  "FastAPI",
  "PostgreSQL",
  "Gemini 2.5 Flash",
  "WeasyPrint",
  "Docker Compose",
];

const STAGES = [
  { label: "Saved", count: 6, active: false },
  { label: "Applied", count: 9, active: false },
  { label: "Interview", count: 3, active: true },
  { label: "Offer", count: 1, active: false },
];

const MAX_STAGE_COUNT = 9;
const MATCH_PCT = 87;
const RING_CIRCUMFERENCE = 163.28; // 2 * PI * r(26)

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function PrimaryButton({
  children,
  className = "",
  to = "/",
}: {
  children: React.ReactNode;
  className?: string;
  to?: string;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-[11px] bg-[#375dfb] px-5 py-[11px] text-sm font-semibold text-white shadow-[0_8px_18px_-8px_rgba(55,93,251,0.65)] transition-all hover:-translate-y-px hover:bg-[#2947d1] ${className}`}
    >
      {children}
    </Link>
  );
}

function GhostButton({
  children,
  to = "/",
  className = "",
}: {
  children: React.ReactNode;
  to?: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-[11px] border border-[#e6e8ec] px-5 py-[11px] text-sm font-semibold text-[#14161c] transition-colors hover:border-[#c7cbd4] hover:bg-white ${className}`}
    >
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Signature panel — animated pipeline + match score, mirrors the real dashboard
// ---------------------------------------------------------------------------

function SignaturePanel() {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [played, setPlayed] = useState(false);
  const [stageCounts, setStageCounts] = useState<number[]>(STAGES.map(() => 0));
  const [matchPct, setMatchPct] = useState(0);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setPlayed(true);
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!played) return;

    // Animate stage counters
    const timers = STAGES.map((stage, i) => {
      const step = Math.max(1, Math.round(stage.count / 24));
      let current = 0;
      return window.setInterval(() => {
        current += step;
        if (current >= stage.count) {
          current = stage.count;
          window.clearInterval(timers[i]);
        }
        setStageCounts((prev) => {
          const next = [...prev];
          next[i] = current;
          return next;
        });
      }, 28);
    });

    // Animate match percentage
    let pct = 0;
    const pctTimer = window.setInterval(() => {
      pct += 3;
      if (pct >= MATCH_PCT) {
        pct = MATCH_PCT;
        window.clearInterval(pctTimer);
      }
      setMatchPct(pct);
    }, 30);

    return () => {
      timers.forEach((t) => window.clearInterval(t));
      window.clearInterval(pctTimer);
    };
  }, [played]);

  const ringOffset =
    RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * matchPct) / 100;

  return (
    <div
      ref={panelRef}
      className="rounded-[20px] border border-[#e6e8ec] bg-white p-[22px] pb-6 shadow-[0_1px_2px_rgba(20,22,28,0.04),0_12px_28px_-12px_rgba(20,22,28,0.10)]"
    >
      <div className="mb-[18px] flex items-center justify-between">
        <span className="font-mono text-[13px] font-semibold tracking-wide text-[#6b7280]">
          tracker.pipeline
        </span>
        <span className="rounded-full bg-[#e8f7ee] px-[9px] py-1 text-[11px] font-semibold text-[#16a34a]">
          Live
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {STAGES.map((stage, i) => (
          <div
            key={stage.label}
            className={`relative overflow-hidden rounded-[9px] border p-3 ${
              stage.active
                ? "border-[#375dfb] bg-[#eaefff]"
                : "border-[#e6e8ec] bg-[#fbfbfc]"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#9aa0ab]">
              {stage.label}
            </div>
            <div
              className={`mt-1 font-[Space_Grotesk,sans-serif] text-[22px] font-bold ${
                stage.active ? "text-[#2947d1]" : "text-[#14161c]"
              }`}
            >
              {stageCounts[i]}
            </div>
            <div
              className="absolute bottom-0 left-0 h-[3px] bg-[#375dfb] transition-[width] duration-[1100ms]"
              style={{
                width: played
                  ? `${Math.min(100, (stage.count / MAX_STAGE_COUNT) * 100)}%`
                  : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 rounded-[14px] border border-[#e6e8ec] bg-[#fbfbfc] p-4">
        <div className="relative h-16 w-16 flex-none">
          <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#e6e8ec"
              strokeWidth={6}
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#375dfb"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={played ? ringOffset : RING_CIRCUMFERENCE}
              className="transition-[stroke-dashoffset] duration-[1400ms] ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-[Space_Grotesk,sans-serif] text-sm font-bold">
            {matchPct}%
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-[#14161c]">
            Cloud Solutions Architect · Amazon
          </div>
          <div className="mt-0.5 text-xs text-[#9aa0ab]">
            Match score against your resume
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-[#eef0f3] px-2.5 py-1 text-[11px] font-semibold text-[#6b7280]">
              AWS services
            </span>
            <span className="rounded-full bg-[#eef0f3] px-2.5 py-1 text-[11px] font-semibold text-[#6b7280]">
              infrastructure design
            </span>
            <span className="rounded-full bg-[#fef3e2] px-2.5 py-1 text-[11px] font-semibold text-[#b45309]">
              DevOps practices — missing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f8] font-sans text-[#14161c] antialiased">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#e6e8ec] bg-[#f4f5f8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2.5 text-base font-bold">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#375dfb] to-[#2947d1] shadow-[0_4px_10px_-3px_rgba(55,93,251,0.55)]">
              <CheckCircle2 size={16} className="text-white" strokeWidth={2.6} />
            </span>
            AI Job Assistant
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[#6b7280] hover:text-[#14161c]">
              Features
            </a>
            <a href="#how" className="text-sm font-medium text-[#6b7280] hover:text-[#14161c]">
              How it works
            </a>
            <a href="#stack" className="text-sm font-medium text-[#6b7280] hover:text-[#14161c]">
              Stack
            </a>
          </div>
          <div className="flex items-center gap-3.5">
            <GhostButton to="/login" className="px-3.5 py-2 text-[13px]">
              Sign in
            </GhostButton>
            <PrimaryButton to="/register" className="px-3.5 py-2 text-[13px]">
              Get started
            </PrimaryButton>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="pt-[76px]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-8 md:grid-cols-2">
          <div>
            <span className="mb-[22px] inline-flex items-center gap-2 rounded-full bg-[#eaefff] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#375dfb]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#375dfb]" />
              Resume tailoring, on autopilot
            </span>
            <h1 className="font-[Space_Grotesk,sans-serif] text-[34px] font-bold leading-[1.06] tracking-tight sm:text-[44px] lg:text-[54px]">
              Turn one resume into <span className="text-[#375dfb]">every</span> application you send.
            </h1>
            <p className="mt-[22px] max-w-[480px] text-[17px] leading-relaxed text-[#6b7280]">
              Upload once. For every role you find, get a match score, the exact
              skills you're missing, rewritten bullet points, a tailored cover
              letter, and interview questions pulled from your own experience.
            </p>
            <div className="mt-8 mb-9 flex flex-wrap items-center gap-3.5">
              <div className="flex items-center gap-2 text-[13px] text-[#9aa0ab]">
                <ShieldCheck size={14} className="text-[#9aa0ab]" />
                Your resume stays yours — parsed into your own dashboard, never shared.
              </div>
            </div>
          </div>

          <SignaturePanel />
        </div>

        {/* STATS STRIP */}
        <div className="mt-[52px] border-y border-[#e6e8ec] py-7">
          <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-6 px-8">
            {STATS.map((s) => (
              <div key={s.label} className="min-w-[130px] flex-1">
                <div className="font-[Space_Grotesk,sans-serif] text-[26px] font-bold">
                  {s.num}
                </div>
                <div className="mt-1 text-[12.5px] text-[#6b7280]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section id="features" className="py-[88px]">
        <div className="mx-auto max-w-[1180px] px-8">
          <div className="mb-[52px] max-w-[560px]">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[#375dfb]">
              What's inside
            </span>
            <h2 className="font-[Space_Grotesk,sans-serif] text-[26px] font-bold leading-tight sm:text-[36px]">
              Everything between "found the posting" and "got the offer."
            </h2>
            <p className="mt-3.5 text-[15.5px] leading-relaxed text-[#6b7280]">
              Nine tools that share one resume and one job description, so
              nothing you tailor for one step gets lost by the next.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-[14px] border border-[#e6e8ec] bg-white p-6 transition-all hover:-translate-y-[3px] hover:border-[#d8dce4] hover:shadow-[0_1px_2px_rgba(20,22,28,0.04),0_12px_28px_-12px_rgba(20,22,28,0.10)]"
              >
                <div className="mb-4 flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eaefff] text-[#2947d1]">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-[#6b7280]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="pb-[88px]">
        <div className="mx-auto max-w-[1180px] px-8">
          <div className="mb-[52px] max-w-[560px]">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[#375dfb]">
              The flow
            </span>
            <h2 className="font-[Space_Grotesk,sans-serif] text-[26px] font-bold leading-tight sm:text-[36px]">
              Four steps, same resume the whole way through.
            </h2>
            <p className="mt-3.5 text-[15.5px] leading-relaxed text-[#6b7280]">
              No re-typing your experience for every tool — everything
              downstream reads from what you uploaded first.
            </p>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-[20px] border border-[#e6e8ec] bg-white sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.index}
                className={`relative border-[#e6e8ec] p-6 ${
                  i !== STEPS.length - 1 ? "sm:border-r" : ""
                } ${i < 2 ? "border-b sm:border-b-0" : ""}`}
              >
                <span className="font-mono text-xs font-semibold text-[#375dfb]">
                  {step.index}
                </span>
                <h3 className="mt-3 mb-2 text-[15px] font-semibold">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#6b7280]">
                  {step.description}
                </p>
                {i !== STEPS.length - 1 && (
                  <span className="absolute right-[-11px] top-1/2 hidden h-[22px] w-[22px] -translate-y-1/2 items-center justify-center rounded-full border border-[#e6e8ec] bg-[#f4f5f8] sm:flex">
                    <ArrowRight size={11} className="text-[#9aa0ab]" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack" className="py-[52px] text-center">
        <div className="mx-auto max-w-[1180px] px-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-[#9aa0ab]">
            Built on
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            {STACK.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#e6e8ec] bg-white px-3.5 py-2 font-mono text-[12.5px] text-[#6b7280]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}