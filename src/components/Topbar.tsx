"use client";

import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const isInvoice = pathname.includes('/invoices');
  const isPreview = pathname.includes('/preview');

  return (
    <header className="topbar">
      <div className="search-container">
        {isInvoice ? (
          <div className="breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Invoices</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="current" style={{ color: '#0f172a', fontWeight: 600 }}>{isPreview ? 'INV-2023-089' : 'New'}</span>
          </div>
        ) : (
          <>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" className="search-input" placeholder="Search..." />
          </>
        )}
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
  );
}
