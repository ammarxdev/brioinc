"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar-container">
      <div className={`navbar-pill ${isOpen ? 'expanded' : ''}`}>
        <div className="nav-links">
          <Link href="/" className={pathname === "/" ? "active" : ""} style={{ color: '#000000', fontWeight: 700 }}>
            Home
          </Link>
          <Link href="/about" className={pathname === "/about" ? "active" : ""} style={{ color: '#000000', fontWeight: 700 }}>
            About
          </Link>
          <Link href="/terms" className={pathname === "/terms" ? "active" : ""} style={{ color: '#000000', fontWeight: 700 }}>
            Terms & Conditions
          </Link>
        </div>

        {/* User requested BLACK TEXT on WHITE background, No Border, 11px padding */}
        <Link href="/signup" className="work-with-btn" style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          textDecoration: 'none',
          border: 'none',
          display: 'flex',
          padding: '11px 24px',
          alignItems: 'center',
          borderRadius: '100px',
          gap: '0.75rem',
          fontWeight: 700
        }}>
          <span>Sign Up</span>
          <span className="arrow-box" style={{
            backgroundColor: '#f1f5f9',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </span>
        </Link>

        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          <div className={`hamburger ${isOpen ? 'active' : ''}`}>
            <span style={{ backgroundColor: '#000000' }}></span>
            <span style={{ backgroundColor: '#000000' }}></span>
          </div>
        </button>
      </div>

      <style jsx>{`
        .navbar-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          transition: all 0.3s ease;
        }
        .navbar-pill {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          padding: 6px 6px 6px 24px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: fit-content;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }
        .navbar-pill a {
          text-decoration: none !important;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }
        .navbar-pill a:hover {
          opacity: 0.6;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px 16px;
        }
        .hamburger {
          width: 20px;
          height: 12px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .hamburger span {
          display: block;
          width: 100%;
          height: 2px;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .hamburger.active span:first-child { transform: translateY(5px) rotate(45deg); }
        .hamburger.active span:last-child { transform: translateY(-5px) rotate(-45deg); }

        @media (max-width: 1024px) {
          .navbar-pill { gap: 1.25rem; padding-left: 20px; }
        }

        @media (max-width: 868px) {
          .navbar-container { right: 16px; top: 16px; left: auto; }
          .nav-links { display: none; }
          .mobile-toggle { display: block; }
          .navbar-pill { padding: 4px; gap: 0; border-radius: 50px; }
          .navbar-pill .work-with-btn { display: none; }
          
          .navbar-pill.expanded {
            border-radius: 24px;
            flex-direction: column;
            padding: 24px;
            width: 280px;
            align-items: flex-start;
          }
          .navbar-pill.expanded .nav-links {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            width: 100%;
            margin-bottom: 1.5rem;
          }
          .navbar-pill.expanded .work-with-btn {
            display: flex;
            width: 100% !important;
            justify-content: space-between;
          }
          .navbar-pill.expanded .mobile-toggle {
            position: absolute;
            top: 14px;
            right: 8px;
          }
        }

        @media (max-width: 480px) {
          .navbar-container { top: 12px; right: 12px; }
          .navbar-pill.expanded { width: calc(100vw - 24px); }
        }
      `}</style>
    </nav>
  );
}
