"use client";

import "./invoices.css";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Basic breadcrumb logic
  const isPreview = pathname.includes('/preview');
  
  return (
    <div className="invoice-layout">
      <aside className="invoice-sidebar">
        <div className="invoice-brand">
          <div className="brand-icon-dark-square">B</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Brioinc Corp</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Institutional Account</div>
          </div>
        </div>

        <nav className="invoice-nav">
          <Link href="/dashboard" className="invoice-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>
          <a href="#" className="invoice-nav-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Payments
          </a>
          <a href="/invoices" className="invoice-nav-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Invoices
          </a>

        </nav>


      </aside>

      <main className="invoice-main">
        <header className="invoice-topbar">
          <div className="breadcrumbs">
            <span>Invoices</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="current">{isPreview ? 'INV-2023-089' : 'New'}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div style={{ width: 32, height: 32, backgroundColor: '#0f172a', borderRadius: '50%' }}></div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
