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
          top: 30px;
          right: 40px;
          z-index: 10000;
        }
        .navbar-pill {
          background: #ffffff;
          padding: 6px 6px 6px 32px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 3rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4) !important;
          transition: all 0.4s ease;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }
        .navbar-pill a {
          text-decoration: none !important;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px;
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
        }
        .hamburger.active span:first-child { transform: translateY(5px) rotate(45deg); }
        .hamburger.active span:last-child { transform: translateY(-5px) rotate(-45deg); }

        @media (max-width: 1200px) {
          .navbar-container { right: 30px; top: 25px; }
          .navbar-pill { gap: 2rem; padding-left: 24px; }
        }
        @media (max-width: 1024px) {
          .navbar-container { right: 20px; top: 20px; }
          .navbar-pill { gap: 1.5rem; padding-left: 20px; }
        }
        @media (max-width: 768px) {
          .navbar-container { left: 16px; right: 16px; top: 16px; }
          .navbar-pill { 
            width: 100%; 
            justify-content: space-between; 
            padding: 8px 8px 8px 16px; 
            border-radius: 24px;
            min-height: 48px;
          }
          .nav-links { display: none; }
          .navbar-pill.expanded { 
            border-radius: 20px; 
            flex-direction: column; 
            align-items: flex-start; 
            padding: 24px 20px;
            min-height: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
          }
          .navbar-pill.expanded .nav-links { 
            display: flex; 
            flex-direction: column; 
            gap: 1.5rem; 
            width: 100%; 
            margin-bottom: 1.5rem; 
          }
          .navbar-pill.expanded .work-with-btn { 
            width: 100% !important; 
            justify-content: space-between !important; 
            padding: 12px 20px;
          }
          .mobile-toggle { display: block; }
          .navbar-pill.expanded .mobile-toggle { position: absolute; top: 16px; right: 16px; }
          .navbar-pill a { font-size: 0.8rem; }
        }
        @media (max-width: 480px) {
          .navbar-container { left: 12px; right: 12px; top: 12px; }
          .navbar-pill { padding: 6px 6px 6px 12px; min-height: 44px; }
          .navbar-pill.expanded { padding: 20px 16px; border-radius: 16px; }
          .navbar-pill.expanded .nav-links { gap: 1.2rem; margin-bottom: 1.2rem; }
          .navbar-pill.expanded .work-with-btn { padding: 10px 16px; }
          .navbar-pill.expanded .mobile-toggle { top: 12px; right: 12px; }
        }
      `}</style>
    </nav>
  );
}
