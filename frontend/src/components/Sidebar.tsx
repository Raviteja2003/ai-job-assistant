import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    path: "/results",
    label: "Results",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 13L6 9L9 12L13 7L16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: "/cover-letter",
    label: "Cover Letter",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 6l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
  path: "/interview-prep",
  label: "Interview Prep",
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
},
  {
    path: "/tracker",
    label: "Job Tracker",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 5h12M3 9h8M3 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M13 13l.8.8 1.7-1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
  path: "/email-generator",
  label: "Email Generator",
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 7l10 7 10-7"/>
    </svg>
  ),
},
{
  path: "/analytics",
  label: "Analytics",
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
},
{
  path: '/mock-interview',
  label: 'Mock Interview',
  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
},
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .sidebar-wrap {
          width: 260px;
          min-height: 100vh;
          background: #fff;
          border-right: 1px solid #F1F2F4;
          display: flex;
          flex-direction: column;
          padding: 20px 12px;
          flex-shrink: 0;
          font-family: 'DM Sans', sans-serif;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 8px;
          margin-bottom: 24px;
        }
        .logo-mark {
          width: 30px;
          height: 30px;
          background: #2563EB;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          letter-spacing: -0.01em;
        }
        .nav-section-label {
          font-size: 11px;
          font-weight: 500;
          color: #9CA3AF;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0 10px;
          margin-bottom: 4px;
          margin-top: 8px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
          margin-bottom: 2px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
        }
        .nav-item:hover { background: #F8F9FA; }
        .nav-item.active {
          background: #EFF6FF;
        }
        .nav-item .nav-label {
          font-size: 13.5px;
          font-weight: 500;
          color: #6B7280;
        }
        .nav-item.active .nav-label { color: #2563EB; }
        .nav-item .nav-icon { color: #9CA3AF; display: flex; align-items: center; flex-shrink: 0; }
        .nav-item.active .nav-icon { color: #2563EB; }
        .nav-item .nav-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 500;
          color: #9CA3AF;
          background: #F3F4F6;
          padding: 1px 7px;
          border-radius: 10px;
        }
        .sidebar-bottom {
          margin-top: auto;
          border-top: 1px solid #F1F2F4;
          padding-top: 12px;
        }
        .user-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .user-row:hover { background: #F8F9FA; }
        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #EFF6FF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #2563EB;
          flex-shrink: 0;
        }
        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 5px;
          transition: color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .logout-btn:hover { color: #EF4444; background: #FEF2F2; }
      `}</style>

      <aside className="sidebar-wrap">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2.5 13L8 3.5L13.5 13H2.5Z" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>
          <span className="logo-text">AI Job Assistant</span>
        </div>

        {/* Nav */}
        <p className="nav-section-label">Menu</p>
        <nav style={{ display: "flex", flexDirection: "column" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="sidebar-bottom">
          <div className="user-row" style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div className="user-avatar">{initials}</div>
              <span className="user-name">{user?.name ?? "User"}</span>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Sign out"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}   