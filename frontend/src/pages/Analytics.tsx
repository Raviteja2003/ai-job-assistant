import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell,
} from "recharts";
import { getTrackerStats } from "../api/tracker";
import { getTimeline, type TimelineEntry } from "../api/tracker";
import type { TrackerStats } from "../types";

// ─── Design tokens ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  saved:     "#6B7280",
  applied:   "#2563EB",
  interview: "#D97706",
  offer:     "#16A34A",
  rejected:  "#DC2626",
};

const STATUS_BG: Record<string, string> = {
  saved:     "#F3F4F6",
  applied:   "#EFF6FF",
  interview: "#FFFBEB",
  offer:     "#F0FDF4",
  rejected:  "#FEF2F2",
};

const STAT_CARDS = [
  { key: "total",     label: "Total Applications", icon: "📋" },
  { key: "applied",   label: "Applied",             icon: "📤" },
  { key: "interview", label: "Interviews",           icon: "🎙️" },
  { key: "offer",     label: "Offers",               icon: "🎉" },
  { key: "rejected",  label: "Rejected",             icon: "❌" },
  { key: "saved",     label: "Saved",                icon: "🔖" },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #E5E7EB",
      borderRadius: 8, padding: "10px 14px", fontSize: 12,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <p style={{ fontWeight: 600, color: "#111827", marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, colorKey }: {
  icon: string;
  label: string;
  value: number;
  colorKey?: string;
}) {
  const color = colorKey ? STATUS_COLORS[colorKey] : "#2563EB";
  const bg    = colorKey ? STATUS_BG[colorKey]    : "#EFF6FF";
  return (
    <div style={{
      background: "#fff", border: "1.5px solid #E5E7EB",
      borderRadius: 12, padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: bg, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 600, color, margin: 0 }}>{value}</p>
        <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [stats, setStats]       = useState<TrackerStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

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

  // Funnel data for bar chart
  const funnelData = stats
    ? [
        { name: "Saved",     value: stats.saved,     fill: STATUS_COLORS.saved },
        { name: "Applied",   value: stats.applied,   fill: STATUS_COLORS.applied },
        { name: "Interview", value: stats.interview, fill: STATUS_COLORS.interview },
        { name: "Offer",     value: stats.offer,     fill: STATUS_COLORS.offer },
        { name: "Rejected",  value: stats.rejected,  fill: STATUS_COLORS.rejected },
      ]
    : [];

  // Pie chart data — exclude total and saved
  const pieData = stats
    ? [
        { name: "Applied",   value: stats.applied,   color: STATUS_COLORS.applied },
        { name: "Interview", value: stats.interview, color: STATUS_COLORS.interview },
        { name: "Offer",     value: stats.offer,     color: STATUS_COLORS.offer },
        { name: "Rejected",  value: stats.rejected,  color: STATUS_COLORS.rejected },
      ].filter((d) => d.value > 0)
    : [];

  // Response rate — offers / applied * 100
  const responseRate = stats?.applied
    ? Math.round(((stats.interview + stats.offer) / stats.applied) * 100)
    : 0;

  // Offer rate
  const offerRate = stats?.applied
    ? Math.round((stats.offer / stats.applied) * 100)
    : 0;

  // Format timeline date labels to "Jan 15"
  const formattedTimeline = timeline.map((e) => ({
    ...e,
    date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 18, height: 18,
          border: "2px solid #E5E7EB", borderTopColor: "#2563EB",
          borderRadius: "50%", animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px 36px" }}>
        <div style={{
          background: "#FEF2F2", border: "1.5px solid #FECACA",
          borderRadius: 8, padding: "14px 16px", fontSize: 14, color: "#DC2626",
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 36px", maxWidth: 960, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563EB", marginBottom: 5 }}>
          Overview
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "#111827", letterSpacing: "-0.02em", marginBottom: 5 }}>
          Analytics Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          A birds-eye view of your job search progress.
        </p>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
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

      {/* ── Rate cards ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
        <div style={{
          background: "#EFF6FF", border: "1.5px solid #BFDBFE",
          borderRadius: 12, padding: "18px 22px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1D4ED8", marginBottom: 3 }}>Response Rate</p>
            <p style={{ fontSize: 11, color: "#6B7280" }}>Interviews + Offers ÷ Applied</p>
          </div>
          <p style={{ fontSize: 32, fontWeight: 700, color: "#2563EB" }}>{responseRate}%</p>
        </div>
        <div style={{
          background: "#F0FDF4", border: "1.5px solid #BBF7D0",
          borderRadius: 12, padding: "18px 22px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#16A34A", marginBottom: 3 }}>Offer Rate</p>
            <p style={{ fontSize: 11, color: "#6B7280" }}>Offers ÷ Applied</p>
          </div>
          <p style={{ fontSize: 32, fontWeight: 700, color: "#16A34A" }}>{offerRate}%</p>
        </div>
      </div>

      {/* ── Application funnel bar chart ─────────────────────────────────── */}
      <div style={{
        background: "#fff", border: "1.5px solid #E5E7EB",
        borderRadius: 12, padding: "22px 24px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
          Application Funnel
        </p>
        <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 20 }}>
          Volume at each stage of your job search pipeline
        </p>
        {funnelData.every((d) => d.value === 0) ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>No application data yet. Start tracking jobs to see your funnel.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} barSize={40}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "'DM Sans', sans-serif" }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F9FAFB" }} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Timeline line chart + Pie chart ─────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginBottom: 24 }}>

        {/* Timeline */}
        <div style={{
          background: "#fff", border: "1.5px solid #E5E7EB",
          borderRadius: 12, padding: "22px 24px",
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
            Activity Timeline
          </p>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 20 }}>
            Applications and outcomes over the last 30 days
          </p>
          {formattedTimeline.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>No activity in the last 30 days.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={formattedTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'DM Sans', sans-serif" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }} />
                <Line type="monotone" dataKey="applied"   name="Applied"   stroke={STATUS_COLORS.applied}   strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="interview" name="Interview" stroke={STATUS_COLORS.interview} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="offer"     name="Offer"     stroke={STATUS_COLORS.offer}     strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="rejected"  name="Rejected"  stroke={STATUS_COLORS.rejected}  strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div style={{
          background: "#fff", border: "1.5px solid #E5E7EB",
          borderRadius: 12, padding: "22px 24px",
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
            Status Breakdown
          </p>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 20 }}>
            Distribution of active applications
          </p>
          {pieData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>No data to display yet.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData} dataKey="value"
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {pieData.map((entry) => (
                  <div key={entry.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: entry.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#374151" }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Empty state — no tracker data at all ────────────────────────── */}
      {stats?.total === 0 && (
        <div style={{
          textAlign: "center", padding: "40px 0",
          background: "#F8F9FA", borderRadius: 12,
          border: "1.5px solid #E5E7EB",
        }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 6 }}>No data yet</p>
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            Add jobs to your tracker to start seeing analytics here.
          </p>
        </div>
      )}
    </div>
  );
}