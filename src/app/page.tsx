"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Financial Background Image Layer */}
      <div className="bg-container">
        <Image 
          src="/finance_crypto_bg_1777990108170.png" 
          alt="Financial Connectivity Background" 
          fill 
          style={{ objectFit: 'cover', transform: 'scale(1.1)' }} 
          priority
        />
        <div className="bg-overlay"></div>
      </div>

      <Navbar />

      <div className="logo-container">
        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="logo-text">Brioinc</span>
      </div>

      <main className="hero-main">
        <div className="hero-content">
          <h1>Global Fiat to Binance.<br />Instant & Secure.</h1>
        </div>

        <div className="bottom-bar">
          <div className="subtext">
            <p>The ultimate bridge for your capital. Deposit global fiat currencies <br />and watch them arrive in your Binance wallet with institutional speed.</p>
            <p className="company-name-bottom">Brioinc x Binance</p>
          </div>

          <Link href="/signup" className="discover-btn">
            START YOUR CONVERSION
            <span className="btn-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          width: 100%;
          position: relative;
          color: white;
          background: #000;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }
        .bg-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -2;
        }
        .bg-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: 
            linear-gradient(to bottom, #000 0%, transparent 15%, transparent 85%, #000 100%),
            linear-gradient(to right, #000 0%, transparent 15%, transparent 85%, #000 100%),
            radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 70%, #000 100%);
          box-shadow: inset 0 0 150px 50px #000;
          z-index: 1;
        }
        .logo-container {
          position: absolute;
          top: 40px; left: 40px;
          display: flex; align-items: center; gap: 12px;
          z-index: 10;
        }
        .logo-icon { width: 32px; height: 32px; }
        .logo-text { font-size: 1.75rem; font-weight: 600; letter-spacing: -0.04em; }

        .hero-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 80px;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 5;
        }
        .hero-content h1 {
          font-size: clamp(2.5rem, 8vw, 8rem);
          line-height: 0.95;
          font-weight: 700;
          letter-spacing: -0.05em;
          margin-bottom: 2rem;
        }
        .bottom-bar {
          position: absolute;
          bottom: 60px; left: 80px; right: 80px;
          display: flex; justify-content: space-between; align-items: flex-end;
        }
        .subtext p { font-size: 1.1rem; line-height: 1.4; opacity: 0.8; margin-bottom: 0.5rem; max-width: 500px; }
        .company-name-bottom { font-weight: 800; font-size: 1.4rem !important; opacity: 1 !important; margin-top: 1.5rem; }

        .discover-btn {
          background: #000;
          color: #fff !important;
          padding: 10px 10px 10px 28px;
          border-radius: 100px;
          text-decoration: none !important;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex; align-items: center; gap: 1.5rem;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .discover-btn:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.4); }
        .btn-icon-circle { background: #4d5d4d; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .btn-icon-circle svg { width: 18px; height: 18px; }

        @media (max-width: 1024px) {
          .hero-main { padding: 0 40px; }
          .bottom-bar { left: 40px; right: 40px; bottom: 40px; }
        }
        @media (max-width: 768px) {
          .hero-main { padding: 100px 24px 60px; justify-content: flex-start; }
          .hero-content h1 { font-size: 3.2rem; margin-top: 40px; }
          .bottom-bar { position: relative; bottom: 0; left: 0; right: 0; flex-direction: column; align-items: flex-start; gap: 2.5rem; margin-top: 4rem; }
          .subtext p { font-size: 1rem; }
          .logo-container { top: 24px; left: 24px; }
          .logo-text { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}
