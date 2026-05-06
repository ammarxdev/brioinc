"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo-group">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="logo-text">Brioinc</span>
          </div>
          <p className="brand-desc">The global institutional bridge for Fiat-to-Binance conversions.</p>
        </div>

        <div className="footer-links-grid">
          <div className="links-column">
            <h4>PLATFORM</h4>
            <Link href="/signup">Start Conversion</Link>
            <Link href="/login">Dashboard</Link>
            <Link href="/about">How it Works</Link>
          </div>
          <div className="links-column">
            <h4>LEGAL</h4>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refunds">Refund Policy</Link>
          </div>
          <div className="links-column">
            <h4>SUPPORT</h4>
            <Link href="mailto:support@brioinc.net">Email Support</Link>
            <Link href="/about">FAQ</Link>
            <Link href="/terms">Help Center</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Brioinc. All rights reserved. Partner of Binance.</p>
      </div>

      <style jsx>{`
        .footer-container {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(20px);
          padding: 80px 80px 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
          z-index: 10;
        }
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 4rem;
          margin-bottom: 60px;
        }
        .footer-brand { max-width: 300px; }
        .logo-group { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
        .logo-icon { width: 24px; height: 24px; }
        .logo-text { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; }
        .brand-desc { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }

        .footer-links-grid {
          display: flex;
          gap: 6rem;
        }
        .links-column h4 { font-size: 0.75rem; font-weight: 700; color: #ffffff; letter-spacing: 0.1em; margin-bottom: 1.5rem; }
        .links-column { display: flex; flex-direction: column; gap: 1rem; }
        .links-column a { color: #94a3b8; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .links-column a:hover { color: #ffffff; }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: #64748b;
          font-size: 0.85rem;
          text-align: center;
        }

        @media (max-width: 1200px) {
          .footer-container { padding: 70px 60px 40px; }
          .footer-content { gap: 3rem; }
          .footer-links-grid { gap: 4rem; }
        }
        @media (max-width: 1024px) {
          .footer-container { padding: 60px 40px 40px; }
          .footer-content { gap: 2.5rem; }
          .footer-links-grid { gap: 3rem; }
          .footer-brand { max-width: 280px; }
        }
        @media (max-width: 768px) {
          .footer-container { padding: 50px 24px 30px; }
          .footer-content { flex-direction: column; gap: 2.5rem; }
          .footer-links-grid { 
            flex-wrap: wrap; 
            gap: 2.5rem; 
            justify-content: space-between;
          }
          .links-column { flex: 1; min-width: 140px; }
          .footer-brand { max-width: 100%; text-align: center; }
          .logo-group { justify-content: center; }
          .brand-desc { text-align: center; max-width: 400px; margin: 0 auto; }
        }
        @media (max-width: 480px) {
          .footer-container { padding: 40px 20px 25px; }
          .footer-content { gap: 2rem; }
          .footer-links-grid { 
            gap: 2rem; 
            flex-direction: column;
          }
          .links-column { 
            flex: none; 
            min-width: auto; 
            text-align: center;
          }
          .links-column h4 { 
            font-size: 0.7rem; 
            margin-bottom: 1rem; 
          }
          .links-column a { 
            font-size: 0.85rem; 
          }
          .footer-bottom { 
            padding-top: 30px; 
            font-size: 0.8rem; 
          }
          .brand-desc { 
            font-size: 0.9rem; 
            max-width: 300px; 
          }
        }
      `}</style>
    </footer>
  );
}
