import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  listTrackedJobs,
  getTrackerStats,
  createTrackedJob,
  updateTrackedJob,
  deleteTrackedJob,
} from "../api/tracker";
import type { TrackedJob, TrackedJobCreate, TrackedJobUpdate, JobStatus, TrackerStats } from "../api/tracker";

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bg: string; border: string }> = {
  saved:     { label: "Saved",     color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB" },
  applied:   { label: "Applied",   color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  interview: { label: "Interview", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  offer:     { label: "Offer",     color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  rejected:  { label: "Rejected",  color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
};

const ALL_STATUSES: JobStatus[] = ["saved", "applied", "interview", "offer", "rejected"];

// ─── Icons ─────────────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconLocation = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: "spin 0.8s linear infinite" }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── Empty form ─────────────────────────────────────────────────────────────

const emptyForm = (): TrackedJobCreate => ({
  company: "", role: "", job_url: "", location: "", salary: "", notes: "", status: "saved",
});

// ─── Modal ──────────────────────────────────────────────────────────────────

function Modal({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "520px",
        padding: "28px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        fontFamily: "'DM Sans', sans-serif",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "2px" }}>
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Job Form ───────────────────────────────────────────────────────────────

function JobForm({
  initial, onSubmit, submitting, submitLabel,
}: {
  initial: TrackedJobCreate;
  onSubmit: (data: TrackedJobCreate) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<TrackedJobCreate>(initial);
  const set = (k: keyof TrackedJobCreate, v: string) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = {
    width: "100%", boxSizing: "border-box" as const,
    padding: "9px 12px", borderRadius: "8px",
    border: "1.5px solid #E5E7EB", fontSize: "13.5px",
    color: "#111827", fontFamily: "'DM Sans', sans-serif",
    outline: "none", background: "#fff",
  };
  const labelStyle = { fontSize: "12.5px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Company *</label>
          <input style={inputStyle} value={form.company} onChange={e => set("company", e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = "#2563EB"}
            onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
            placeholder="e.g. Google" />
        </div>
        <div>
          <label style={labelStyle}>Role *</label>
          <input style={inputStyle} value={form.role} onChange={e => set("role", e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = "#2563EB"}
            onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
            placeholder="e.g. Software Engineer" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {ALL_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            const active = form.status === s;
            return (
              <button key={s} onClick={() => set("status", s)} style={{
                padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
                border: active ? `1.5px solid ${cfg.border}` : "1.5px solid #E5E7EB",
                background: active ? cfg.bg : "#fff",
                color: active ? cfg.color : "#9CA3AF",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.12s",
              }}>
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={form.location ?? ""} onChange={e => set("location", e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = "#2563EB"}
            onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
            placeholder="e.g. Hyderabad" />
        </div>
        <div>
          <label style={labelStyle}>Salary</label>
          <input style={inputStyle} value={form.salary ?? ""} onChange={e => set("salary", e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = "#2563EB"}
            onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
            placeholder="e.g. 25-35 LPA" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Job URL</label>
        <input style={inputStyle} value={form.job_url ?? ""} onChange={e => set("job_url", e.target.value)}
          onFocus={e => e.currentTarget.style.borderColor = "#2563EB"}
          onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
          placeholder="https://..." />
      </div>

      <div>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={form.notes ?? ""} onChange={e => set("notes", e.target.value)}
          rows={3}
          onFocus={e => e.currentTarget.style.borderColor = "#2563EB"}
          onBlur={e => e.currentTarget.style.borderColor = "#E5E7EB"}
          placeholder="Referral, recruiter name, next steps…"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
        <button
          onClick={() => onSubmit(form)}
          disabled={!form.company || !form.role || submitting}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "10px 22px", borderRadius: "8px", border: "none",
            background: form.company && form.role ? "#2563EB" : "#E5E7EB",
            color: form.company && form.role ? "#fff" : "#9CA3AF",
            fontSize: "14px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            cursor: form.company && form.role ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? <><IconSpinner /> Saving…</> : submitLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Status Pill ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "4px",
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Job Card ───────────────────────────────────────────────────────────────

function JobCard({ job, onEdit, onDelete, onStatusChange }: {
  job: TrackedJob;
  onEdit: (job: TrackedJob) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: JobStatus) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowStatusMenu(false); }}
      style={{
        background: "#fff",
        border: "1.5px solid #E5E7EB",
        borderRadius: "10px",
        padding: "16px",
        position: "relative",
        transition: "box-shadow 0.15s",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.07)" : "none",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: "10px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {job.role}
          </div>
          <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "1px" }}>{job.company}</div>
        </div>

        {/* Action buttons — visible on hover */}
        <div style={{ display: "flex", gap: "4px", opacity: hovered ? 1 : 0, transition: "opacity 0.15s", flexShrink: 0 }}>
          <button onClick={() => onEdit(job)} style={{
            background: "#F3F4F6", border: "none", borderRadius: "6px",
            padding: "5px 7px", cursor: "pointer", color: "#6B7280",
            display: "flex", alignItems: "center",
          }}>
            <IconEdit />
          </button>
          <button onClick={() => onDelete(job.id)} style={{
            background: "#FEF2F2", border: "none", borderRadius: "6px",
            padding: "5px 7px", cursor: "pointer", color: "#DC2626",
            display: "flex", alignItems: "center",
          }}>
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
        {job.location && (
          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11.5px", color: "#9CA3AF" }}>
            <IconLocation /> {job.location}
          </span>
        )}
        {job.salary && (
          <span style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{job.salary}</span>
        )}
        {job.job_url && (
          <a href={job.job_url} target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11.5px", color: "#2563EB", textDecoration: "none" }}>
            <IconLink /> View JD
          </a>
        )}
      </div>

      {/* Notes */}
      {job.notes && (
        <p style={{ fontSize: "12px", color: "#6B7280", margin: "0 0 10px 0", lineHeight: 1.5 }}>
          {job.notes}
        </p>
      )}

      {/* Footer: status pill + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Clickable status pill → dropdown */}
        <div style={{ position: "relative" }}>
          <div onClick={() => setShowStatusMenu(v => !v)} style={{ cursor: "pointer" }}>
            <StatusPill status={job.status} />
          </div>
          {showStatusMenu && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 10,
              background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: "8px",
              padding: "4px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              display: "flex", flexDirection: "column", gap: "2px", minWidth: "120px",
            }}>
              {ALL_STATUSES.filter(s => s !== job.status).map(s => (
                <button key={s} onClick={() => { onStatusChange(job.id, s); setShowStatusMenu(false); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "6px 10px", borderRadius: "6px", textAlign: "left",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px",
                    color: STATUS_CONFIG[s].color,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = STATUS_CONFIG[s].bg}
                  onMouseOut={e => e.currentTarget.style.background = "none"}
                >
                  → {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span style={{ fontSize: "11px", color: "#D1D5DB" }}>
          {new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Tracker() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [stats, setStats] = useState<TrackerStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<JobStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editJob, setEditJob] = useState<TrackedJob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    loadData();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    const [j, s] = await Promise.all([listTrackedJobs(token), getTrackerStats(token)]);
    setJobs(j);
    setStats(s);
    setLoading(false);
  }

  async function handleCreate(data: TrackedJobCreate) {
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await createTrackedJob(data, token);
      setJobs(prev => [created, ...prev]);
      setStats(prev => prev ? { ...prev, total: prev.total + 1, [data.status ?? "saved"]: (prev[data.status as keyof TrackerStats] as number) + 1 } : prev);
      setShowAdd(false);
    } catch {
      setError("Failed to create. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(data: TrackedJobCreate) {
    if (!token || !editJob) return;
    setSubmitting(true);
    setError("");
    try {
      const updated = await updateTrackedJob(editJob.id, data as TrackedJobUpdate, token);
      setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
      setEditJob(null);
      // refresh stats since status may have changed
      getTrackerStats(token).then(setStats);
    } catch {
      setError("Failed to update. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteTrackedJob(id, token);
    setJobs(prev => prev.filter(j => j.id !== id));
    getTrackerStats(token).then(setStats);
  }

  async function handleStatusChange(id: number, status: JobStatus) {
    if (!token) return;
    const updated = await updateTrackedJob(id, { status }, token);
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
    getTrackerStats(token).then(setStats);
  }

  const filtered = activeFilter === "all" ? jobs : jobs.filter(j => j.status === activeFilter);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin :"0 auto" ,fontFamily: "'DM Sans', sans-serif" }}>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", margin: 0 }}>Job Tracker</h1>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
            Track every application from saved to offer.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", borderRadius: "8px", border: "none",
            background: "#2563EB", color: "#fff",
            fontSize: "14px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
          onMouseOver={e => e.currentTarget.style.background = "#1D4ED8"}
          onMouseOut={e => e.currentTarget.style.background = "#2563EB"}
        >
          <IconPlus /> Add Job
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "24px",
        }}>
          {ALL_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = stats[s];
            const active = activeFilter === s;
            return (
              <button
                key={s}
                onClick={() => setActiveFilter(prev => prev === s ? "all" : s)}
                style={{
                  padding: "12px 10px", borderRadius: "10px", textAlign: "center",
                  border: active ? `1.5px solid ${cfg.border}` : "1.5px solid #E5E7EB",
                  background: active ? cfg.bg : "#fff",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: 700, color: active ? cfg.color : "#111827" }}>
                  {count}
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 500, color: active ? cfg.color : "#9CA3AF", marginTop: "2px" }}>
                  {cfg.label}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter indicator */}
      {activeFilter !== "all" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>
            Showing <strong style={{ color: STATUS_CONFIG[activeFilter].color }}>{STATUS_CONFIG[activeFilter].label}</strong> jobs
          </span>
          <button onClick={() => setActiveFilter("all")} style={{
            fontSize: "11.5px", color: "#9CA3AF", background: "none", border: "none",
            cursor: "pointer", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif",
          }}>
            Clear filter
          </button>
        </div>
      )}

      {/* Job grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", color: "#9CA3AF" }}>
          <IconSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          border: "1.5px dashed #E5E7EB", borderRadius: "12px",
          color: "#9CA3AF", fontSize: "14px",
        }}>
          {activeFilter === "all"
            ? <>No jobs tracked yet. <button onClick={() => setShowAdd(true)} style={{ color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>Add your first one →</button></>
            : `No ${STATUS_CONFIG[activeFilter].label.toLowerCase()} jobs.`}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={setEditJob}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add Job" onClose={() => { setShowAdd(false); setError(""); }}>
          {error && (
            <div style={{ marginBottom: "14px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: "13px", color: "#DC2626" }}>
              {error}
            </div>
          )}
          <JobForm initial={emptyForm()} onSubmit={handleCreate} submitting={submitting} submitLabel="Add Job" />
        </Modal>
      )}

      {/* Edit modal */}
      {editJob && (
        <Modal title="Edit Job" onClose={() => { setEditJob(null); setError(""); }}>
          {error && (
            <div style={{ marginBottom: "14px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: "13px", color: "#DC2626" }}>
              {error}
            </div>
          )}
          <JobForm
            initial={{
              company: editJob.company, role: editJob.role,
              job_url: editJob.job_url ?? "", location: editJob.location ?? "",
              salary: editJob.salary ?? "", notes: editJob.notes ?? "",
              status: editJob.status,
            }}
            onSubmit={handleUpdate}
            submitting={submitting}
            submitLabel="Save Changes"
          />
        </Modal>
      )}
    </div>
  );
}