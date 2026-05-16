import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const NAV_ITEMS = [
  {
    label: "Workspace",
    items: [
      { icon: "ti-layout-dashboard", label: "Dashboard",   path: "/dashboard" },
      { icon: "ti-chart-bar",        label: "Results",     path: "/results-history" },
      { icon: "ti-file-text",        label: "Cover Letter",path: "/cover-letter" },
      { icon: "ti-checklist",        label: "Job Tracker", path: "/job-tracker", soon: true },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: "ti-settings", label: "Settings", path: "/settings", soon: true },
    ],
  },
];

export default function AppShell({ children, title, subtitle, action }: AppShellProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location  = useLocation();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 10px;
          border-radius: 7px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s;
          user-select: none;
        }
        .nav-item:hover { background: #F3F4F6; }
        .nav-item.active { background: #EFF6FF; }
        .nav-item .nav-label { font-size: 13px; color: #6B7280; }
        .nav-item.active .nav-label { color: #2563EB; font-weight: 500; }
        .nav-item i { font-size: 15px; color: #9CA3AF; }
        .nav-item.active i { color: #2563EB; }

        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          color: #9CA3AF;
          transition: color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .logout-btn:hover { color: #EF4444; background: #FEF2F2; }

        .section-group-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #9CA3AF;
          padding: 8px 10px 3px;
        }

        .soon-badge {
          margin-left: auto;
          font-size: 10px;
          background: #F3F4F6;
          color: #9CA3AF;
          padding: 1px 6px;
          border-radius: 10px;
          font-weight: 500;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 2px; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        background: "#fff",
        borderRight: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30,
              background: "#2563EB",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <i className="ti ti-briefcase" style={{ fontSize: 15, color: "#fff" }} aria-hidden="true" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#111827", fontFamily: "'Playfair Display', serif" }}>
              JobAssist
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((group) => (
            <div key={group.label}>
              <p className="section-group-label">{group.label}</p>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <div
                    key={item.path}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => !item.soon && navigate(item.path)}
                    style={{ opacity: item.soon ? 0.6 : 1 }}
                  >
                    <i className={`ti ${item.icon}`} aria-hidden="true" />
                    <span className="nav-label">{item.label}</span>
                    {item.soon && <span className="soon-badge">Soon</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{
          padding: "10px 12px",
          borderTop: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: "50%",
            background: "#EFF6FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, color: "#2563EB",
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign out">
            <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top bar */}
        <header style={{
          height: 52,
          background: "#fff",
          borderBottom: "1px solid #E5E7EB",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky", top: 0, zIndex: 30,
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{title}</p>
            {subtitle && <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px 28px 60px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}