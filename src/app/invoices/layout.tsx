"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import "../dashboard/dashboard.css";
import "./invoices.css";

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Public payment page should NOT show the dashboard sidebar
  const isPublicPayPage = pathname.includes('/pay/');
  
  if (isPublicPayPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="main-area">
        <Topbar />
        {children}
      </main>
    </div>
  );
}
