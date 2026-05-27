import { useState, useEffect } from "react";
import { getTrackerStats } from "../api/tracker";
import { getTimeline, type TimelineEntry } from "../api/tracker";
import type { TrackerStats } from "../types";

// ─── Design tokens ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  saved: "#6B7280",
  applied: "#2563EB",
  interview: "#D97706",
  offer: "#16A34A",
  rejected: "#DC2626",
};

const STATUS_BG: Record<string, string> = {
  saved: "#F3F4F6",
  applied: "#EFF6FF",
  interview: "#FFFBEB",
  offer: "#F0FDF4",
  rejected: "#FEF2F2",
};

const STAT_CARDS = [
  { key: "total", label: "Total Applications", icon: "📋" },
  { key: "applied", label: "Applied", icon: "📤" },
  { key: "interview", label: "Interviews", icon: "🎙️" },
  { key: "offer", label: "Offers", icon: "🎉" },
  { key: "rejected", label: "Rejected", icon: "❌" },
  { key: "saved", label: "Saved", icon: "🔖" },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  colorKey,
}: {
  icon: string;
  label: string;
  value: number;
  colorKey?: string;
}) {
  const color = colorKey ? STATUS_COLORS[colorKey] : "#2563EB";
  const bg = colorKey ? STATUS_BG[colorKey] : "#EFF6FF";
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #E5E7EB",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 600, color, margin: 0 }}>
          {value}
        </p>
        <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{label}</p>
      </div>
    </div>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = 180;
  const barW = 48;
  const gap = 24;
  const paddingX = 20;
  const totalW = data.length * (barW + gap) - gap + paddingX * 2;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalW} ${chartH + 40}`}
      style={{ overflow: "visible" }}
    >
      {/* Gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
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
              fontSize="10"
              fill="#9CA3AF"
              fontFamily="'DM Sans', sans-serif"
            >
              {Math.round(maxVal * ratio)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
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
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="6"
              ry="6"
              fill={d.color}
              opacity={isHov ? 1 : 0.85}
              style={{ transition: "opacity 0.15s, y 0.3s, height 0.3s" }}
            />
            {/* Value label on hover */}
            {isHov && d.value > 0 && (
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill={d.color}
                fontFamily="'DM Sans', sans-serif"
              >
                {d.value}
              </text>
            )}
            {/* X label */}
            <text
              x={x + barW / 2}
              y={chartH + 28}
              textAnchor="middle"
              fontSize="11"
              fill={isHov ? d.color : "#6B7280"}
              fontFamily="'DM Sans', sans-serif"
              style={{ transition: "fill 0.15s" }}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 80,
    cy = 80,
    r = 60,
    inner = 36;
  let angle = -90;

  const slices = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const sweep = pct * 360;
    const start = angle;
    angle += sweep;
    return { ...d, pct, start, sweep };
  });

  const polarToCart = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (
    startDeg: number,
    sweepDeg: number,
    outerR: number,
    innerR: number,
  ) => {
    if (sweepDeg >= 360) sweepDeg = 359.99;
    const s = polarToCart(cx, cy, outerR, startDeg);
    const e = polarToCart(cx, cy, outerR, startDeg + sweepDeg);
    const si = polarToCart(cx, cy, innerR, startDeg + sweepDeg);
    const ei = polarToCart(cx, cy, innerR, startDeg);
    const large = sweepDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${outerR} ${outerR} 0 ${large} 1 ${e.x} ${e.y}
            L ${si.x} ${si.y} A ${innerR} ${innerR} 0 ${large} 0 ${ei.x} ${ei.y} Z`;
  };

  if (total === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <p style={{ fontSize: 13, color: "#9CA3AF" }}>No data yet.</p>
      </div>
    );
  }

  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        style={{ flexShrink: 0 }}
      >
        {slices.map((s, i) => (
          <path
            key={i}
            d={describeArc(
              s.start,
              s.sweep,
              r + (hovered === i ? 6 : 0),
              inner,
            )}
            fill={s.color}
            opacity={hovered === null || hovered === i ? 1 : 0.5}
            style={{ transition: "opacity 0.15s, d 0.2s", cursor: "default" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {/* Center label */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill={hov ? hov.color : "#111827"}
          fontFamily="'DM Sans', sans-serif"
        >
          {hov ? hov.value : total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="10"
          fill="#9CA3AF"
          fontFamily="'DM Sans', sans-serif"
        >
          {hov ? hov.label : "total"}
        </text>
      </svg>

      {/* Legend */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}
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
              cursor: "default",
              opacity: hovered === null || hovered === i ? 1 : 0.4,
              transition: "opacity 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: "#374151" }}>{s.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
                {s.value}
              </span>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                {total > 0 ? `${Math.round((s.value / total) * 100)}%` : "0%"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data }: { data: TimelineEntry[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <p style={{ fontSize: 13, color: "#9CA3AF" }}>
          No activity in the last 30 days.
        </p>
      </div>
    );
  }

  const keys: { key: keyof TimelineEntry; color: string; label: string }[] = [
    { key: "applied", color: STATUS_COLORS.applied, label: "Applied" },
    { key: "interview", color: STATUS_COLORS.interview, label: "Interview" },
    { key: "offer", color: STATUS_COLORS.offer, label: "Offer" },
    { key: "rejected", color: STATUS_COLORS.rejected, label: "Rejected" },
  ];

  const allVals = data.flatMap((d) => keys.map((k) => d[k.key] as number));
  const maxVal = Math.max(...allVals, 1);
  const W = 480,
    H = 160,
    padL = 28,
    padR = 12,
    padT = 12,
    padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xPos = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * plotW;
  const yPos = (v: number) => padT + plotH - (v / maxVal) * plotH;

  const buildPath = (key: keyof TimelineEntry) =>
    data
      .map(
        (d, i) => `${i === 0 ? "M" : "L"} ${xPos(i)} ${yPos(d[key] as number)}`,
      )
      .join(" ");

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  // Show every Nth label to avoid crowding
  const labelEvery = Math.ceil(data.length / 5);

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: "visible" }}
      >
        {/* Gridlines */}
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

        {/* Y axis labels */}
        {[0, 0.5, 1].map((r) => (
          <text
            key={r}
            x={padL - 4}
            y={padT + plotH * (1 - r) + 4}
            textAnchor="end"
            fontSize="9"
            fill="#9CA3AF"
            fontFamily="'DM Sans', sans-serif"
          >
            {Math.round(maxVal * r)}
          </text>
        ))}

        {/* Lines */}
        {keys.map((k) => (
          <path
            key={k.key}
            d={buildPath(k.key)}
            fill="none"
            stroke={k.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Hover overlay + dots */}
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
                    key={k.key}
                    cx={xPos(i)}
                    cy={yPos(d[k.key] as number)}
                    r="4"
                    fill={k.color}
                  />
                ))}
                {/* Tooltip box */}
                <foreignObject
                  x={Math.min(xPos(i) + 8, W - 110)}
                  y={padT}
                  width="100"
                  height="90"
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 6,
                      padding: "6px 8px",
                      fontSize: 11,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: 3,
                      }}
                    >
                      {formatDate(d.date)}
                    </p>
                    {keys.map((k) => (
                      <p
                        key={k.key}
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

        {/* X axis labels */}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text
              key={i}
              x={xPos(i)}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="#9CA3AF"
              fontFamily="'DM Sans', sans-serif"
            >
              {formatDate(d.date)}
            </text>
          ) : null,
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
        {keys.map((k) => (
          <div
            key={k.key}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 20,
                height: 2,
                background: k.color,
                borderRadius: 1,
              }}
            />
            <span
              style={{
                fontSize: 11,
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [stats, setStats] = useState<TrackerStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsData, timelineData] = await Promise.all([
          getTrackerStats(),
          getTimeline(),
        ]);
        setStats(statsData);
        setTimeline(timelineData.entries);
      } catch {
        setError("Failed to load analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const funnelData = stats
    ? [
        { label: "Saved", value: stats.saved, color: STATUS_COLORS.saved },
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
        { label: "Offer", value: stats.offer, color: STATUS_COLORS.offer },
        {
          label: "Rejected",
          value: stats.rejected,
          color: STATUS_COLORS.rejected,
        },
      ]
    : [];

  const pieData = stats
    ? [
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
        { label: "Offer", value: stats.offer, color: STATUS_COLORS.offer },
        {
          label: "Rejected",
          value: stats.rejected,
          color: STATUS_COLORS.rejected,
        },
      ].filter((d) => d.value > 0)
    : [];

  const responseRate = stats?.applied
    ? Math.round(((stats.interview + stats.offer) / stats.applied) * 100)
    : 0;

  const offerRate = stats?.applied
    ? Math.round((stats.offer / stats.applied) * 100)
    : 0;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            border: "2px solid #E5E7EB",
            borderTopColor: "#2563EB",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px 36px" }}>
        <div
          style={{
            background: "#FEF2F2",
            border: "1.5px solid #FECACA",
            borderRadius: 8,
            padding: "14px 16px",
            fontSize: 14,
            color: "#DC2626",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "32px 36px",
        maxWidth: 960,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#2563EB",
            marginBottom: 5,
          }}
        >
          Overview
        </p>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#111827",
            letterSpacing: "-0.02em",
            marginBottom: 5,
          }}
        >
          Analytics Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          A birds-eye view of your job search progress.
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={stats?.[card.key as keyof TrackerStats] ?? 0}
            colorKey={card.key === "total" ? undefined : card.key}
          />
        ))}
      </div>

      {/* Rate cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: "#EFF6FF",
            border: "1.5px solid #BFDBFE",
            borderRadius: 12,
            padding: "18px 22px",
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
                color: "#1D4ED8",
                marginBottom: 3,
              }}
            >
              Response Rate
            </p>
            <p style={{ fontSize: 11, color: "#6B7280" }}>
              Interviews + Offers ÷ Applied
            </p>
          </div>
          <p style={{ fontSize: 32, fontWeight: 700, color: "#2563EB" }}>
            {responseRate}%
          </p>
        </div>
        <div
          style={{
            background: "#F0FDF4",
            border: "1.5px solid #BBF7D0",
            borderRadius: 12,
            padding: "18px 22px",
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
                color: "#16A34A",
                marginBottom: 3,
              }}
            >
              Offer Rate
            </p>
            <p style={{ fontSize: 11, color: "#6B7280" }}>Offers ÷ Applied</p>
          </div>
          <p style={{ fontSize: 32, fontWeight: 700, color: "#16A34A" }}>
            {offerRate}%
          </p>
        </div>
      </div>

      {/* Funnel bar chart */}
      <div
        style={{
          background: "#fff",
          border: "1.5px solid #E5E7EB",
          borderRadius: 12,
          padding: "22px 24px",
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#111827",
            marginBottom: 4,
          }}
        >
          Application Funnel
        </p>
        <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 20 }}>
          Volume at each stage of your job search pipeline
        </p>
        {funnelData.every((d) => d.value === 0) ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
              No application data yet. Start tracking jobs to see your funnel.
            </p>
          </div>
        ) : (
          <BarChart data={funnelData} />
        )}
      </div>

      {/* Timeline + Donut */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #E5E7EB",
            borderRadius: 12,
            padding: "22px 24px",
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 4,
            }}
          >
            Activity Timeline
          </p>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>
            Applications and outcomes over the last 30 days
          </p>
          <LineChart data={timeline} />
        </div>

        <div
          style={{
            background: "#fff",
            border: "1.5px solid #E5E7EB",
            borderRadius: 12,
            padding: "22px 24px",
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 4,
            }}
          >
            Status Breakdown
          </p>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>
            Distribution of active applications
          </p>
          <DonutChart data={pieData} />
        </div>
      </div>

      {/* Empty state */}
      {stats?.total === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            background: "#F8F9FA",
            borderRadius: 12,
            border: "1.5px solid #E5E7EB",
          }}
        >
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 6,
            }}
          >
            No data yet
          </p>
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            Add jobs to your tracker to start seeing analytics here.
          </p>
        </div>
      )}
    </div>
  );
}
