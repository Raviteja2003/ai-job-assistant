import { type ReactNode } from "react";
import Sidebar from "./Sidebar";

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#F8F9FA",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}