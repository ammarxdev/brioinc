"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import "./dashboard.css";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  return (
    <ProtectedRoute requireVerified={true}>
      <div className="dashboard-wrapper">
        {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-brand" style={{textDecoration: 'none', color: 'inherit'}}>
            <div className="brand-logo-box">B</div>
            <div className="brand-text">
              <span className="brand-title">Brioinc</span>
              <span className="brand-subtitle">Enterprise Security</span>
            </div>
          </Link>
          
          <button className="btn-new-transfer" onClick={() => setIsTransferModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Transfer
          </button>
        </div>

        <nav className="nav-links">
          <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
          <Link href="/dashboard/transactions" className={`nav-item ${pathname === '/dashboard/transactions' ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
            Payments
          </Link>
          <Link href="/invoices" className={`nav-item ${pathname.startsWith('/invoices') ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Invoices
          </Link>


          {user?.role === "admin" && (
            <Link href="/admin" className={`nav-item ${pathname.startsWith('/admin') ? 'active' : ''}`} style={{ color: '#0ea5e9' }}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">

          <button 
            onClick={async () => {
              const { supabase } = await import("@/lib/supabase/client");
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="footer-link" 
            style={{ 
              background: "none", 
              border: "none", 
              color: "#ef4444", 
              width: "100%", 
              textAlign: "left", 
              padding: "0.5rem 0", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem",
              fontSize: "0.85rem",
              fontFamily: "inherit"
            }}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="main-area">
        {/* Top Navbar */}
        <header className="topbar">
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" className="search-input" placeholder="Search..." />
          </div>

          <div className="topbar-actions">
            <div className="icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div className="notification-dot"></div>
            </div>
            <div className="icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <div className="profile-avatar"></div>
          </div>
        </header>

        {children}
      </main>

      {/* Transfer Modal Overlay */}
      {isTransferModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTransferModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>New Transfer</h2>
              <button onClick={() => setIsTransferModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Recipient Account / IBAN</label>
                <input type="text" placeholder="e.g. PK00BRIN000123456789" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Amount (USD)</label>
                <input type="number" placeholder="0.00" style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
              </div>
              <button 
                onClick={() => {
                  alert("Transfer feature is currently in development.");
                  setIsTransferModalOpen(false);
                }}
                style={{ width: '100%', backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Initiate Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          width: 100%;
          max-width: 400px;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
      `}</style>
    </div>
    </ProtectedRoute>
  );
}
