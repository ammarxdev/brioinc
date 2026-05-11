"use client";

import "./dashboard.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireVerified={true}>
      <div className="dashboard-wrapper">
        <Sidebar />
        <main className="main-area">
          <Topbar />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
