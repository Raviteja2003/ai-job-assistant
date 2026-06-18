import { useState } from "react";
import Sidebar from "./Sidebar";

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .app-hamburger { display: flex !important; }
          .app-overlay { display: block !important; }
          .app-main-topbar { display: flex !important; }
        }
      `}</style>

      {/* Mobile overlay backdrop */}
      <div
        className="app-overlay"
        onClick={() => setSidebarOpen(false)}
        style={{
          display: "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 40,
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 0.2s",
        }}
      />

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#F8F9FA",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Mobile top bar */}
          <div
            className="app-main-topbar"
            style={{
              display: "none",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: "#fff",
              borderBottom: "1px solid #F1F2F4",
              position: "sticky",
              top: 0,
              zIndex: 30,
            }}
          >
            <button
              className="app-hamburger"
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#374151",
                padding: 0,
              }}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Logo in topbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, background: "#2563EB", borderRadius: 7,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <rect x="7" y="6" width="14" height="18" rx="2" fill="white" fillOpacity="0.18"/>
                  <line x1="9.5" y1="13" x2="18.5" y2="13" stroke="white" strokeOpacity="0.7" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="9.5" y1="17" x2="17.5" y2="17" stroke="white" strokeOpacity="0.7" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="9.5" y1="21" x2="18.5" y2="21" stroke="white" strokeOpacity="0.7" strokeWidth="1.8" strokeLinecap="round"/>
                  <g transform="translate(22,10)">
                    <path d="M0,-5 C0.7,-1.5 1.5,0 5,0 C1.5,0.7 0.7,1.5 0,5 C-0.7,1.5 -1.5,0.7 -5,0 C-1.5,-0.7 -0.7,-1.5 0,-5 Z" fill="white"/>
                    <circle cx="0" cy="0" r="1.2" fill="#2563EB"/>
                  </g>
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
                AI Job Assistant
              </span>
            </div>
          </div>

          <main style={{ flex: 1, overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}