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
import type {
  TrackedJob,
  TrackedJobCreate,
  TrackedJobUpdate,
  JobStatus,
  TrackerStats,
} from "../api/tracker";
import { getTimeline, type TimelineEntry } from "../api/tracker";

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  saved: { label: "Saved", color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB" },
  applied: {
    label: "Applied",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  interview: {
    label: "Interview",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  offer: { label: "Offer", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  rejected: {
    label: "Rejected",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
};

const ALL_STATUSES: JobStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

// ─── Icons ─────────────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconLink = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconLocation = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconClose = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconSpinner = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animation: "spin 0.8s linear infinite" }}
  >
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── Empty form ─────────────────────────────────────────────────────────────

const emptyForm = (): TrackedJobCreate => ({
  company: "",
  role: "",
  job_url: "",
  location: "",
  salary: "",
  notes: "",
  status: "saved",
});

// ─── Modal ──────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "520px",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          fontFamily: "'DM Sans', sans-serif",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9CA3AF",
              padding: "2px",
            }}
          >
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  saved: "#6B7280",
  applied: "#2563EB",
  interview: "#D97706",
  offer: "#16A34A",
  rejected: "#DC2626",
};

function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = 140,
    barW = 40,
    gap = 20,
    paddingX = 20;
  const totalW = data.length * (barW + gap) - gap + paddingX * 2;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalW} ${chartH + 40}`}
      style={{ overflow: "visible" }}
    >
      {[0, 0.5, 1].map((ratio) => {
        const y = 8 + chartH * (1 - ratio);
        return (
          <g key={ratio}>
            <line
              x1={paddingX}
              y1={y}
              x2={totalW - paddingX}
              y2={y}
              stroke="#F3F4F6"
              strokeWidth="1"
            />
            <text
              x={paddingX - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="9"
              fill="#9CA3AF"
              fontFamily="'DM Sans', sans-serif"
            >
              {Math.round(maxVal * ratio)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = Math.max((d.value / maxVal) * chartH, d.value > 0 ? 4 : 0);
        const x = paddingX + i * (barW + gap);
        const y = 8 + chartH - barH;
        const isHov = hovered === i;
        return (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "default" }}
          >
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="5"
              fill={d.color}
              opacity={isHov ? 1 : 0.82}
              style={{ transition: "opacity 0.15s" }}
            />
            {isHov && d.value > 0 && (
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={d.color}
                fontFamily="'DM Sans', sans-serif"
              >
                {d.value}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={chartH + 28}
              textAnchor="middle"
              fontSize="10"
              fill={isHov ? d.color : "#6B7280"}
              fontFamily="'DM Sans', sans-serif"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 70,
    cy = 70,
    r = 52,
    inner = 30;
  let angle = -90;

  const slices = data.map((d) => {
    const sweep = total > 0 ? (d.value / total) * 360 : 0;
    const start = angle;
    angle += sweep;
    return { ...d, start, sweep };
  });

  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arc = (
    start: number,
    sweep: number,
    outerR: number,
    innerR: number,
  ) => {
    if (sweep >= 360) sweep = 359.99;
    const s = polar(cx, cy, outerR, start);
    const e = polar(cx, cy, outerR, start + sweep);
    const si = polar(cx, cy, innerR, start + sweep);
    const ei = polar(cx, cy, innerR, start);
    const large = sweep > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${outerR} ${outerR} 0 ${large} 1 ${e.x} ${e.y} L ${si.x} ${si.y} A ${innerR} ${innerR} 0 ${large} 0 ${ei.x} ${ei.y} Z`;
  };

  if (total === 0)
    return (
      <p style={{ fontSize: 12, color: "#9CA3AF", padding: "16px 0" }}>
        No data yet.
      </p>
    );
  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        style={{ flexShrink: 0 }}
      >
        {slices.map((s, i) => (
          <path
            key={i}
            d={arc(s.start, s.sweep, r + (hovered === i ? 5 : 0), inner)}
            fill={s.color}
            opacity={hovered === null || hovered === i ? 1 : 0.45}
            style={{ transition: "opacity 0.15s", cursor: "default" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill={hov ? hov.color : "#111827"}
          fontFamily="'DM Sans', sans-serif"
        >
          {hov ? hov.value : total}
        </text>
        <text
          x={cx}
          y={cy + 11}
          textAnchor="middle"
          fontSize="9"
          fill="#9CA3AF"
          fontFamily="'DM Sans', sans-serif"
        >
          {hov ? hov.label : "total"}
        </text>
      </svg>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}
      >
        {slices.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: hovered === null || hovered === i ? 1 : 0.35,
              transition: "opacity 0.15s",
              cursor: "default",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  background: s.color,
                }}
              />
              <span style={{ fontSize: 11, color: "#374151" }}>{s.label}</span>
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#111827" }}>
                {s.value}
              </span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                {total > 0 ? `${Math.round((s.value / total) * 100)}%` : "0%"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }: { data: TimelineEntry[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0)
    return (
      <p style={{ fontSize: 12, color: "#9CA3AF", padding: "16px 0" }}>
        No activity in the last 30 days.
      </p>
    );

  const keys: { key: keyof TimelineEntry; color: string; label: string }[] = [
    { key: "applied", color: STATUS_COLORS.applied, label: "Applied" },
    { key: "interview", color: STATUS_COLORS.interview, label: "Interview" },
    { key: "offer", color: STATUS_COLORS.offer, label: "Offer" },
    { key: "rejected", color: STATUS_COLORS.rejected, label: "Rejected" },
  ];

  const allVals = data.flatMap((d) => keys.map((k) => d[k.key] as number));
  const maxVal = Math.max(...allVals, 1);
  const W = 460,
    H = 130,
    padL = 24,
    padR = 10,
    padT = 10,
    padB = 24;
  const plotW = W - padL - padR,
    plotH = H - padT - padB;
  const xPos = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * plotW;
  const yPos = (v: number) => padT + plotH - (v / maxVal) * plotH;
  const buildPath = (key: keyof TimelineEntry) =>
    data
      .map(
        (d, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(d[key] as number)}`,
      )
      .join(" ");
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const labelEvery = Math.ceil(data.length / 5);

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: "visible" }}
      >
        {[0, 0.5, 1].map((r) => (
          <line
            key={r}
            x1={padL}
            y1={padT + plotH * (1 - r)}
            x2={W - padR}
            y2={padT + plotH * (1 - r)}
            stroke="#F3F4F6"
            strokeWidth="1"
          />
        ))}
        {keys.map((k) => (
          <path
            key={String(k.key)}
            d={buildPath(k.key)}
            fill="none"
            stroke={k.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {data.map((d, i) => (
          <g
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <rect
              x={xPos(i) - 10}
              y={padT}
              width={20}
              height={plotH}
              fill="transparent"
              style={{ cursor: "default" }}
            />
            {hovered === i && (
              <>
                <line
                  x1={xPos(i)}
                  y1={padT}
                  x2={xPos(i)}
                  y2={padT + plotH}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
                {keys.map((k) => (
                  <circle
                    key={String(k.key)}
                    cx={xPos(i)}
                    cy={yPos(d[k.key] as number)}
                    r="3.5"
                    fill={k.color}
                  />
                ))}
                <foreignObject
                  x={Math.min(xPos(i) + 8, W - 100)}
                  y={padT}
                  width="95"
                  height="85"
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 6,
                      padding: "5px 8px",
                      fontSize: 10,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: 2,
                      }}
                    >
                      {fmt(d.date)}
                    </p>
                    {keys.map((k) => (
                      <p
                        key={String(k.key)}
                        style={{ color: k.color, margin: "1px 0" }}
                      >
                        {k.label}: <strong>{d[k.key] as number}</strong>
                      </p>
                    ))}
                  </div>
                </foreignObject>
              </>
            )}
          </g>
        ))}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text
              key={i}
              x={xPos(i)}
              y={H - 4}
              textAnchor="middle"
              fontSize="8"
              fill="#9CA3AF"
              fontFamily="'DM Sans', sans-serif"
            >
              {fmt(d.date)}
            </text>
          ) : null,
        )}
      </svg>
      <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
        {keys.map((k) => (
          <div
            key={String(k.key)}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 16,
                height: 2,
                background: k.color,
                borderRadius: 1,
              }}
            />
            <span
              style={{
                fontSize: 10,
                color: "#6B7280",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {k.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Job Form ───────────────────────────────────────────────────────────────

function JobForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial: TrackedJobCreate;
  onSubmit: (data: TrackedJobCreate) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<TrackedJobCreate>(initial);
  const set = (k: keyof TrackedJobCreate, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1.5px solid #E5E7EB",
    fontSize: "13.5px",
    color: "#111827",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: "#fff",
  };
  const labelStyle = {
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#374151",
    display: "block",
    marginBottom: "5px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        <div>
          <label style={labelStyle}>Company *</label>
          <input
            style={inputStyle}
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            placeholder="e.g. Google"
          />
        </div>
        <div>
          <label style={labelStyle}>Role *</label>
          <input
            style={inputStyle}
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            placeholder="e.g. Software Engineer"
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Status</label>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const active = form.status === s;
            return (
              <button
                key={s}
                onClick={() => set("status", s)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  border: active
                    ? `1.5px solid ${cfg.border}`
                    : "1.5px solid #E5E7EB",
                  background: active ? cfg.bg : "#fff",
                  color: active ? cfg.color : "#9CA3AF",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.12s",
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        <div>
          <label style={labelStyle}>Location</label>
          <input
            style={inputStyle}
            value={form.location ?? ""}
            onChange={(e) => set("location", e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            placeholder="e.g. Hyderabad"
          />
        </div>
        <div>
          <label style={labelStyle}>Salary</label>
          <input
            style={inputStyle}
            value={form.salary ?? ""}
            onChange={(e) => set("salary", e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            placeholder="e.g. 25-35 LPA"
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Job URL</label>
        <input
          style={inputStyle}
          value={form.job_url ?? ""}
          onChange={(e) => set("job_url", e.target.value)}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          placeholder="https://..."
        />
      </div>

      <div>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          placeholder="Referral, recruiter name, next steps…"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "4px",
        }}
      >
        <button
          onClick={() => onSubmit(form)}
          disabled={!form.company || !form.role || submitting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "10px 22px",
            borderRadius: "8px",
            border: "none",
            background: form.company && form.role ? "#2563EB" : "#E5E7EB",
            color: form.company && form.role ? "#fff" : "#9CA3AF",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: form.company && form.role ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <>
              <IconSpinner /> Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Status Pill ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: "4px",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Job Card ───────────────────────────────────────────────────────────────

function JobCard({
  job,
  onEdit,
  onDelete,
  onStatusChange,
}: {
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
      onMouseLeave={() => {
        setHovered(false);
        setShowStatusMenu(false);
      }}
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "6px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, marginRight: "10px" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#111827",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {job.role}
          </div>
          <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "1px" }}>
            {job.company}
          </div>
        </div>

        {/* Action buttons — visible on hover */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => onEdit(job)}
            style={{
              background: "#F3F4F6",
              border: "none",
              borderRadius: "6px",
              padding: "5px 7px",
              cursor: "pointer",
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconEdit />
          </button>
          <button
            onClick={() => onDelete(job.id)}
            style={{
              background: "#FEF2F2",
              border: "none",
              borderRadius: "6px",
              padding: "5px 7px",
              cursor: "pointer",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        {job.location && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "11.5px",
              color: "#9CA3AF",
            }}
          >
            <IconLocation /> {job.location}
          </span>
        )}
        {job.salary && (
          <span style={{ fontSize: "11.5px", color: "#9CA3AF" }}>
            {job.salary}
          </span>
        )}
        {job.job_url && (
          <a
            href={job.job_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "11.5px",
              color: "#2563EB",
              textDecoration: "none",
            }}
          >
            <IconLink /> View JD
          </a>
        )}
      </div>

      {/* Notes */}
      {job.notes && (
        <p
          style={{
            fontSize: "12px",
            color: "#6B7280",
            margin: "0 0 10px 0",
            lineHeight: 1.5,
          }}
        >
          {job.notes}
        </p>
      )}

      {/* Footer: status pill + date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Clickable status pill → dropdown */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowStatusMenu((v) => !v)}
            style={{ cursor: "pointer" }}
          >
            <StatusPill status={job.status} />
          </div>
          {showStatusMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                zIndex: 10,
                background: "#fff",
                border: "1.5px solid #E5E7EB",
                borderRadius: "8px",
                padding: "4px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minWidth: "120px",
              }}
            >
              {ALL_STATUSES.filter((s) => s !== job.status).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(job.id, s);
                    setShowStatusMenu(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    textAlign: "left",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12.5px",
                    color: STATUS_CONFIG[s].color,
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = STATUS_CONFIG[s].bg)
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  → {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span style={{ fontSize: "11px", color: "#D1D5DB" }}>
          {new Date(job.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
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

  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editJob, setEditJob] = useState<TrackedJob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadData();
  }, [token]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    const [j, s, t] = await Promise.all([
      listTrackedJobs(token),
      getTrackerStats(token),
      getTimeline(),
    ]);
    setJobs(j);
    setStats(s);
    setTimeline(t.entries);
    setLoading(false);
  }

  async function handleCreate(data: TrackedJobCreate) {
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await createTrackedJob(data, token);
      setJobs((prev) => [created, ...prev]);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              total: prev.total + 1,
              [data.status ?? "saved"]:
                (prev[data.status as keyof TrackerStats] as number) + 1,
            }
          : prev,
      );
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
      const updated = await updateTrackedJob(
        editJob.id,
        data as TrackedJobUpdate,
        token,
      );
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
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
    setJobs((prev) => prev.filter((j) => j.id !== id));
    getTrackerStats(token).then(setStats);
  }

  async function handleStatusChange(id: number, status: JobStatus) {
    if (!token) return;
    const updated = await updateTrackedJob(id, { status }, token);
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    getTrackerStats(token).then(setStats);
  }

  const filtered =
    activeFilter === "all"
      ? jobs
      : jobs.filter((j) => j.status === activeFilter);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#111827",
              margin: 0,
            }}
          >
            Job Tracker
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
            Track every application from saved to offer.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 18px",
            borderRadius: "8px",
            border: "none",
            background: "#2563EB",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1D4ED8")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#2563EB")}
        >
          <IconPlus /> Add Job
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const count = stats[s];
            const active = activeFilter === s;
            return (
              <button
                key={s}
                onClick={() =>
                  setActiveFilter((prev) => (prev === s ? "all" : s))
                }
                style={{
                  padding: "12px 10px",
                  borderRadius: "10px",
                  textAlign: "center",
                  border: active
                    ? `1.5px solid ${cfg.border}`
                    : "1.5px solid #E5E7EB",
                  background: active ? cfg.bg : "#fff",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: active ? cfg.color : "#111827",
                  }}
                >
                  {count}
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 500,
                    color: active ? cfg.color : "#9CA3AF",
                    marginTop: "2px",
                  }}
                >
                  {cfg.label}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter indicator */}
      {activeFilter !== "all" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6B7280" }}>
            Showing{" "}
            <strong style={{ color: STATUS_CONFIG[activeFilter].color }}>
              {STATUS_CONFIG[activeFilter].label}
            </strong>{" "}
            jobs
          </span>
          <button
            onClick={() => setActiveFilter("all")}
            style={{
              fontSize: "11.5px",
              color: "#9CA3AF",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Job grid */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px",
            color: "#9CA3AF",
          }}
        >
          <IconSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1.5px dashed #E5E7EB",
            borderRadius: "12px",
            color: "#9CA3AF",
            fontSize: "14px",
          }}
        >
          {activeFilter === "all" ? (
            <>
              No jobs tracked yet.{" "}
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  color: "#2563EB",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Add your first one →
              </button>
            </>
          ) : (
            `No ${STATUS_CONFIG[activeFilter].label.toLowerCase()} jobs.`
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "12px",
          }}
        >
          {filtered.map((job) => (
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

      {/* ── Analytics ── */}
      {stats && (
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          
          {/* Rate cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {[
              {
                label: "Response Rate",
                sub: "Interviews + Offers ÷ Applied",
                value: stats.applied
                  ? Math.round(
                      ((stats.interview + stats.offer) / stats.applied) * 100,
                    )
                  : 0,
                color: "#2563EB",
                bg: "#EFF6FF",
                border: "#BFDBFE",
              },
              {
                label: "Offer Rate",
                sub: "Offers ÷ Applied",
                value: stats.applied
                  ? Math.round((stats.offer / stats.applied) * 100)
                  : 0,
                color: "#16A34A",
                bg: "#F0FDF4",
                border: "#BBF7D0",
              },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: card.bg,
                  border: `1.5px solid ${card.border}`,
                  borderRadius: "10px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: card.color,
                      margin: "0 0 2px 0",
                    }}
                  >
                    {card.label}
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
                    {card.sub}
                  </p>
                </div>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: card.color,
                    margin: 0,
                  }}
                >
                  {card.value}%
                </p>
              </div>
            ))}
          </div>

          {/* Bar + Donut */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1.5px solid #E5E7EB",
                borderRadius: "10px",
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#111827",
                  margin: "0 0 2px 0",
                }}
              >
                Application Funnel
              </p>
              <p
                style={{ fontSize: 11, color: "#6B7280", margin: "0 0 14px 0" }}
              >
                Volume at each stage
              </p>
              <BarChart
                data={[
                  {
                    label: "Saved",
                    value: stats.saved,
                    color: STATUS_COLORS.saved,
                  },
                  {
                    label: "Applied",
                    value: stats.applied,
                    color: STATUS_COLORS.applied,
                  },
                  {
                    label: "Interview",
                    value: stats.interview,
                    color: STATUS_COLORS.interview,
                  },
                  {
                    label: "Offer",
                    value: stats.offer,
                    color: STATUS_COLORS.offer,
                  },
                  {
                    label: "Rejected",
                    value: stats.rejected,
                    color: STATUS_COLORS.rejected,
                  },
                ]}
              />
            </div>

            <div
              style={{
                background: "#fff",
                border: "1.5px solid #E5E7EB",
                borderRadius: "10px",
                padding: "16px 18px",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#111827",
                  margin: "0 0 2px 0",
                }}
              >
                Status Breakdown
              </p>
              <p
                style={{ fontSize: 11, color: "#6B7280", margin: "0 0 14px 0" }}
              >
                Distribution of applications
              </p>
              <DonutChart
                data={[
                  {
                    label: "Applied",
                    value: stats.applied,
                    color: STATUS_COLORS.applied,
                  },
                  {
                    label: "Interview",
                    value: stats.interview,
                    color: STATUS_COLORS.interview,
                  },
                  {
                    label: "Offer",
                    value: stats.offer,
                    color: STATUS_COLORS.offer,
                  },
                  {
                    label: "Rejected",
                    value: stats.rejected,
                    color: STATUS_COLORS.rejected,
                  },
                ].filter((d) => d.value > 0)}
              />
            </div>
          </div>

          {/* Line chart */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #E5E7EB",
              borderRadius: "10px",
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                margin: "0 0 2px 0",
              }}
            >
              Activity Timeline
            </p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 14px 0" }}>
              Applications and outcomes over the last 30 days
            </p>
            <LineChart data={timeline} />
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <Modal
          title="Add Job"
          onClose={() => {
            setShowAdd(false);
            setError("");
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 14px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#DC2626",
              }}
            >
              {error}
            </div>
          )}
          <JobForm
            initial={emptyForm()}
            onSubmit={handleCreate}
            submitting={submitting}
            submitLabel="Add Job"
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editJob && (
        <Modal
          title="Edit Job"
          onClose={() => {
            setEditJob(null);
            setError("");
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 14px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#DC2626",
              }}
            >
              {error}
            </div>
          )}
          <JobForm
            initial={{
              company: editJob.company,
              role: editJob.role,
              job_url: editJob.job_url ?? "",
              location: editJob.location ?? "",
              salary: editJob.salary ?? "",
              notes: editJob.notes ?? "",
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
