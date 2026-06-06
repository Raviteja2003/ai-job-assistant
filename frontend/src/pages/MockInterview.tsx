import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  startSession,
  respondToQuestion,
  listSessions,
  deleteSession,
  getSession,
  type StartResponse,
  type RespondResponse,
  type FinalReport,
  type SessionSummary,
  type SessionOut,
} from "../api/mockInterview";
import { getResumes } from "../api/resume";
import { getJobs } from "../api/job";

// ─── Types ───────────────────────────────────────────────────────────────────

type Stage = "setup" | "interview" | "complete";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
  feedback?: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
  turn?: number;
}

// ─── Score color helper ───────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 8) return "#16A34A";
  if (score >= 5) return "#D97706";
  return "#DC2626";
}

function scoreBg(score: number): string {
  if (score >= 8) return "#F0FDF4";
  if (score >= 5) return "#FFFBEB";
  return "#FEF2F2";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i < current ? 28 : 8,
            height: 8,
            borderRadius: 4,
            background:
              i < current ? "#2563EB" : i === current ? "#93C5FD" : "#E5E7EB",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

function FeedbackCard({
  feedback,
}: {
  feedback: NonNullable<ChatMessage["feedback"]>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        marginTop: 8,
        border: `1px solid ${scoreBg(feedback.score) === "#F0FDF4" ? "#BBF7D0" : feedback.score >= 5 ? "#FDE68A" : "#FECACA"}`,
        borderRadius: 10,
        overflow: "hidden",
        fontSize: 13,
      }}
    >
      {/* Score bar */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: scoreBg(feedback.score),
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: scoreColor(feedback.score),
            }}
          >
            {feedback.score}/10
          </span>
          <span style={{ color: "#6B7280" }}>{feedback.feedback}</span>
        </div>
        <span style={{ color: "#9CA3AF", fontSize: 11 }}>
          {open ? "▲ less" : "▼ details"}
        </span>
      </div>

      {open && (
        <div
          style={{
            padding: "12px 14px",
            background: "#fff",
            display: "flex",
            gap: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                color: "#16A34A",
                marginBottom: 6,
                fontSize: 12,
              }}
            >
              ✓ Strengths
            </div>
            {feedback.strengths.map((s, i) => (
              <div
                key={i}
                style={{
                  color: "#374151",
                  marginBottom: 4,
                  paddingLeft: 10,
                  borderLeft: "2px solid #BBF7D0",
                }}
              >
                {s}
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                color: "#D97706",
                marginBottom: 6,
                fontSize: 12,
              }}
            >
              ↑ Improvements
            </div>
            {feedback.improvements.map((s, i) => (
              <div
                key={i}
                style={{
                  color: "#374151",
                  marginBottom: 4,
                  paddingLeft: 10,
                  borderLeft: "2px solid #FDE68A",
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionDetailModal({
  session,
  onClose,
}: {
  session: SessionOut;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 680,
          height: "85vh", // ← change maxHeight to height (gives it a definite size)
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Modal header — fixed, never scrolls */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #F1F2F4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0, // ← prevents header from shrinking
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
              Session #{session.id} — Transcript
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
              {session.total_questions} questions ·{" "}
              {new Date(session.created_at).toLocaleDateString()}
              {" · "}
              <span
                style={{
                  color: session.status === "completed" ? "#16A34A" : "#2563EB",
                  fontWeight: 600,
                }}
              >
                {session.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              cursor: "pointer",
              fontSize: 16,
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable messages body */}
        <div
          style={{
            flex: 1, // ← fills remaining height
            minHeight: 0, // ← critical: lets flex child shrink below content size
            overflowY: "auto", // ← scroll lives here
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {session.messages.map((msg, i) => (
            <div
              key={i}
              style={{
                background: "#F8F9FA",
                borderRadius: 12,
                border: "1px solid #F1F2F4",
              }}
            >
              {/* Question */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #F1F2F4",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#2563EB",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  Q{msg.turn}
                </div>
                <div
                  style={{ fontSize: 14, color: "#111827", lineHeight: 1.6 }}
                >
                  {msg.question}
                </div>
              </div>

              {/* Answer */}
              {msg.user_answer !== null && msg.user_answer !== undefined ? (
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: msg.ai_feedback
                      ? "1px solid #F1F2F4"
                      : "none",
                    background: "#EFF6FF",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#1D4ED8",
                      letterSpacing: "0.08em",
                      marginBottom: 6,
                    }}
                  >
                    YOUR ANSWER
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#1D4ED8", lineHeight: 1.6 }}
                  >
                    {msg.user_answer}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "10px 16px", background: "#FFFBEB" }}>
                  <span style={{ fontSize: 12, color: "#D97706" }}>
                    ⏸ Not answered (session was active)
                  </span>
                </div>
              )}

              {/* AI Feedback */}
              {msg.ai_feedback !== null &&
                msg.ai_feedback !== undefined &&
                msg.score !== null && (
                  <div style={{ padding: "12px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#6B7280",
                          letterSpacing: "0.08em",
                        }}
                      >
                        AI FEEDBACK
                      </div>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: scoreBg(msg.score),
                          color: scoreColor(msg.score),
                        }}
                      >
                        {msg.score}/10
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        lineHeight: 1.6,
                      }}
                    >
                      {msg.ai_feedback}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinalReportView({
  report,
  totalQuestions,
}: {
  report: FinalReport;
  totalQuestions: number;
}) {
  const pct = Math.round((report.overall_score / 10) * 100);
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #E5E7EB",
        borderRadius: 14,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
          padding: "24px 28px",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            opacity: 0.7,
            marginBottom: 6,
          }}
        >
          INTERVIEW COMPLETE — FINAL REPORT
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>
              {report.overall_score.toFixed(1)}
              <span style={{ fontSize: 16, opacity: 0.7 }}>/10</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
              Overall Score across {totalQuestions} questions
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              borderRadius: 30,
              padding: "8px 20px",
              fontWeight: 700,
              fontSize: 15,
              color:
                report.recommendation === "Strong Hire"
                  ? "#86EFAC"
                  : report.recommendation === "Hire"
                    ? "#BAE6FD"
                    : "#FCA5A5",
            }}
          >
            {report.recommendation}
          </div>
        </div>

        {/* Score bar */}
        <div
          style={{
            marginTop: 16,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 4,
            height: 6,
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              borderRadius: 4,
              background: "#fff",
              transition: "width 1s ease",
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 28px", display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              color: "#16A34A",
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            ✓ Key Strengths
          </div>
          {report.strengths.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 8,
                padding: "8px 12px",
                background: "#F0FDF4",
                borderRadius: 8,
              }}
            >
              <span style={{ color: "#16A34A", marginTop: 1 }}>●</span>
              <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
                {s}
              </span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 700,
              color: "#D97706",
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            ↑ Areas to Improve
          </div>
          {report.improvements.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 8,
                padding: "8px 12px",
                background: "#FFFBEB",
                borderRadius: 8,
              }}
            >
              <span style={{ color: "#D97706", marginTop: 1 }}>●</span>
              <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MockInterview() {
  const navigate = useNavigate();

  // Setup state
  const [resumes, setResumes] = useState<{ id: number; filename: string }[]>(
    [],
  );
  const [jobs, setJobs] = useState<
    { id: number; company: string; role: string }[]
  >([]);
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [setupLoading, setSetupLoading] = useState(false);
  const [viewingSession, setViewingSession] = useState<SessionOut | null>(null);
  const [resuming, setResuming] = useState(false);
  // Interview state
  const [stage, setStage] = useState<Stage>("setup");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [maxTurns, setMaxTurns] = useState(5);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);

  // Past sessions
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [showSessions, setShowSessions] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getResumes(), getJobs(), listSessions()]).then(([r, j, s]) => {
      setResumes(r);
      setJobs(j);
      setSessions(s);

      // Auto-resume active session if one exists
      const activeSession = s.find(
        (sess: SessionSummary) => sess.status === "active",
      );
      if (activeSession) {
        setResuming(true);
        getSession(activeSession.id).then((full) => {
          // Find the last answered turn to figure out current turn
          const answered = full.messages.filter((m) => m.user_answer !== null);
          const pending = full.messages.find((m) => m.user_answer === null);

          // Reconstruct chat messages from saved transcript
          const restored: ChatMessage[] = [];
          full.messages.forEach((m) => {
            const answer = m.user_answer;
            // AI question bubble
            restored.push({ role: "ai", text: m.question, turn: m.turn });
            // User answer bubble
            if (answer) {
              restored.push({ role: "user", text: m.user_answer });
              // Feedback bubble (ai_feedback stored as plain string, reconstruct minimal feedback)
              if (m.ai_feedback && m.score !== null) {
                restored.push({
                  role: "ai",
                  text: "",
                  feedback: {
                    score: m.score,
                    feedback: m.ai_feedback,
                    strengths: [],
                    improvements: [],
                  },
                  turn: m.turn,
                });
              }
            }
          });

          setMessages(restored);
          setSessionId(full.id);
          setMaxTurns(full.total_questions);
          setCurrentTurn(pending ? pending.turn : answered.length + 1);
          setStage("interview");
          setResuming(false);
        });
      }
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, submitting]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleStart() {
    if (!selectedResume || !selectedJob) return;
    setSetupLoading(true);
    try {
      const res: StartResponse = await startSession({
        resume_id: selectedResume,
        job_id: selectedJob,
        total_questions: totalQuestions,
      });
      setSessionId(res.session_id);
      setMaxTurns(res.total_questions);
      setCurrentTurn(1);
      setMessages([{ role: "ai", text: res.question, turn: 1 }]);
      setStage("interview");
      listSessions().then(setSessions);
    } catch {
      alert("Failed to start session. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  }

  async function handleRespond() {
    if (!answer.trim() || !sessionId || submitting) return;
    const userAnswer = answer.trim();
    setAnswer("");
    setSubmitting(true);

    setMessages((prev) => [...prev, { role: "user", text: userAnswer }]);

    try {
      const res: RespondResponse = await respondToQuestion(
        sessionId,
        userAnswer,
      );

      const feedbackMsg: ChatMessage = {
        role: "ai",
        text: "",
        feedback: res.feedback,
        turn: res.turn,
      };

      if (res.is_complete) {
        setMessages((prev) => [...prev, feedbackMsg]);
        setFinalReport(res.final_report);
        setStage("complete");
        listSessions().then(setSessions);
      } else {
        const nextMsg: ChatMessage = {
          role: "ai",
          text: res.question!,
          turn: res.turn + 1,
        };
        setMessages((prev) => [...prev, feedbackMsg, nextMsg]);
        setCurrentTurn(res.turn + 1);
      }
    } catch (e: unknown) {
      const errorResponse = e as {
        response?: { data?: { detail?: string } };
      };
      const msg =
        errorResponse.response?.data?.detail ||
        "Failed to submit answer. Please retry.";
      setMessages((prev) => [...prev, { role: "ai", text: `⚠️ ${msg}` }]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSession(id: number) {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function handleReset() {
    setStage("setup");
    setSessionId(null);
    setMessages([]);
    setAnswer("");
    setFinalReport(null);
    setCurrentTurn(0);
    setSelectedResume(null);
    setSelectedJob(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        padding: "28px 32px",
        maxWidth: 860,
        margin: "0 auto",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              AI Mock Interview
            </h1>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
              Practice with an AI interviewer tailored to your resume and job
              description
            </p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={() => setShowSessions((s) => !s)}
              style={{
                fontSize: 13,
                color: "#2563EB",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 8,
                padding: "7px 14px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {showSessions ? "Hide" : "Past Sessions"} ({sessions.length})
            </button>
          )}
        </div>
      </div>

      {/* Past sessions panel */}
      {showSessions && (
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #E5E7EB",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 12,
            }}
          >
            Past Sessions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#F8F9FA",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        s.status === "completed" ? "#F0FDF4" : "#EFF6FF",
                      color: s.status === "completed" ? "#16A34A" : "#2563EB",
                      border: `1px solid ${s.status === "completed" ? "#BBF7D0" : "#BFDBFE"}`,
                    }}
                  >
                    {s.status}
                  </span>
                  <span style={{ color: "#374151" }}>
                    {s.total_questions} questions
                  </span>
                  <span style={{ color: "#9CA3AF" }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {/* VIEW button — fetches full transcript */}
                  <button
                    onClick={async () => {
                      const full = await getSession(s.id);
                      setViewingSession(full);
                    }}
                    style={{
                      fontSize: 12,
                      color: "#2563EB",
                      background: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      borderRadius: 6,
                      cursor: "pointer",
                      padding: "3px 10px",
                      fontWeight: 500,
                    }}
                  >
                    View
                  </button>
                  {/* DELETE button */}
                  <button
                    onClick={() => handleDeleteSession(s.id)}
                    style={{
                      fontSize: 12,
                      color: "#DC2626",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px 8px",
                      opacity: 0.6,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "0.6")
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SETUP STAGE ───────────────────────────────────────────────────── */}
      {stage === "setup" && (
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #E5E7EB",
            borderRadius: 14,
            padding: "28px 32px",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 20,
            }}
          >
            Configure your interview
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 20,
            }}
          >
            {/* Resume picker */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                SELECT RESUME
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {resumes.length === 0 ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#9CA3AF",
                      padding: "12px",
                      background: "#F9FAFB",
                      borderRadius: 8,
                      textAlign: "center",
                    }}
                  >
                    No resumes uploaded yet
                  </div>
                ) : (
                  resumes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedResume(r.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        border: `1.5px solid ${selectedResume === r.id ? "#2563EB" : "#E5E7EB"}`,
                        background:
                          selectedResume === r.id ? "#EFF6FF" : "#F9FAFB",
                        color: selectedResume === r.id ? "#1D4ED8" : "#374151",
                        fontWeight: selectedResume === r.id ? 600 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      📄 {r.filename}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Job picker */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                SELECT JOB DESCRIPTION
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {jobs.length === 0 ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#9CA3AF",
                      padding: "12px",
                      background: "#F9FAFB",
                      borderRadius: 8,
                      textAlign: "center",
                    }}
                  >
                    No job descriptions added yet
                  </div>
                ) : (
                  jobs.map((j) => (
                    <div
                      key={j.id}
                      onClick={() => setSelectedJob(j.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        border: `1.5px solid ${selectedJob === j.id ? "#2563EB" : "#E5E7EB"}`,
                        background:
                          selectedJob === j.id ? "#EFF6FF" : "#F9FAFB",
                        color: selectedJob === j.id ? "#1D4ED8" : "#374151",
                        fontWeight: selectedJob === j.id ? 600 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      💼 {j.company} — {j.role}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Question count */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 10,
              }}
            >
              NUMBER OF QUESTIONS
            </label>

            <input
              type="number"
              min="1"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              placeholder="Enter number of questions"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #E5E7EB",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!selectedResume || !selectedJob || setupLoading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 10,
              background:
                !selectedResume || !selectedJob ? "#E5E7EB" : "#2563EB",
              color: !selectedResume || !selectedJob ? "#9CA3AF" : "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor:
                !selectedResume || !selectedJob ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {setupLoading
              ? "Generating first question…"
              : "▶  Start Mock Interview"}
          </button>
        </div>
      )}

      {/* ── INTERVIEW STAGE ───────────────────────────────────────────────── */}
      {(stage === "interview" || stage === "complete") && (
        <div>
          {/* Progress header */}
          {stage === "interview" && (
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: "12px 20px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ProgressDots current={currentTurn - 1} total={maxTurns} />
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
                Question {currentTurn} of {maxTurns}
              </span>
            </div>
          )}

          {/* Chat window */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #E5E7EB",
              borderRadius: 14,
              padding: "20px",
              minHeight: 400,
              maxHeight: 560,
              overflowY: "auto",
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === "ai" && msg.text && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      AI
                    </div>
                    <div style={{ flex: 1 }}>
                      {msg.turn && (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#9CA3AF",
                            marginBottom: 4,
                            letterSpacing: "0.05em",
                          }}
                        >
                          QUESTION {msg.turn}
                        </div>
                      )}
                      <div
                        style={{
                          background: "#F8F9FA",
                          border: "1px solid #F1F2F4",
                          borderRadius: "0 10px 10px 10px",
                          padding: "12px 16px",
                          fontSize: 14,
                          color: "#111827",
                          lineHeight: 1.6,
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )}

                {msg.role === "ai" && !msg.text && msg.feedback && (
                  <div style={{ paddingLeft: 42 }}>
                    <FeedbackCard feedback={msg.feedback} />
                  </div>
                )}

                {msg.role === "user" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      flexDirection: "row-reverse",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        color: "#6B7280",
                        fontWeight: 700,
                      }}
                    >
                      You
                    </div>
                    <div
                      style={{
                        background: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        borderRadius: "10px 0 10px 10px",
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "#1D4ED8",
                        lineHeight: 1.6,
                        maxWidth: "75%",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {submitting && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  paddingLeft: 42,
                }}
              >
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#93C5FD",
                        animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Evaluating your answer…
                </span>
              </div>
            )}

            {finalReport && stage === "complete" && (
              <FinalReportView report={finalReport} totalQuestions={maxTurns} />
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          {stage === "interview" && (
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #E5E7EB",
                borderRadius: 14,
                padding: "16px",
              }}
            >
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                    handleRespond();
                }}
                placeholder="Type your answer here… (Ctrl+Enter to submit)"
                disabled={submitting}
                rows={4}
                style={{
                  width: "100%",
                  resize: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  color: "#111827",
                  lineHeight: 1.6,
                  fontFamily: "'DM Sans', sans-serif",
                  background: "transparent",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {answer.length} chars
                </span>
                <button
                  onClick={handleRespond}
                  disabled={!answer.trim() || submitting}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    background:
                      !answer.trim() || submitting ? "#E5E7EB" : "#2563EB",
                    color: !answer.trim() || submitting ? "#9CA3AF" : "#fff",
                    border: "none",
                    cursor:
                      !answer.trim() || submitting ? "not-allowed" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  Submit Answer →
                </button>
              </div>
            </div>
          )}

          {/* Complete actions */}
          {stage === "complete" && (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  background: "#2563EB",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ＋ Start New Interview
              </button>
              <button
                onClick={() => navigate("/analytics")}
                style={{
                  padding: "12px 20px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#fff",
                  color: "#374151",
                  border: "1.5px solid #E5E7EB",
                  cursor: "pointer",
                }}
              >
                View Analytics
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Resuming indicator */}
      {resuming && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: "#2563EB" }}>
            Resuming your session…
          </div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>
            Loading previous questions and answers
          </div>
        </div>
      )}

      {/* Session detail modal */}
      {viewingSession && (
        <SessionDetailModal
          session={viewingSession}
          onClose={() => setViewingSession(null)}
        />
      )}
    </div>
  );
}
