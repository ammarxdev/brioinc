"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    setError("");
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to continue");
      }

      if (data.exists) {
        router.push(`/login?email=${encodeURIComponent(normalized)}&reason=exists`);
      } else {
        router.push(`/signup?email=${encodeURIComponent(normalized)}`);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Financial Background Image Layer */}
      <div className="bg-container">
        <Image 
          src="/finance-bg.png" 
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

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem", width: "min(520px, 100%)" }}>
            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.24)", color: "#f87171", padding: "0.85rem 1rem", borderRadius: "14px", fontSize: "0.85rem", width: "100%" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", width: "100%", justifyContent: "flex-end" }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.35)",
                  color: "white",
                  outline: "none",
                  fontSize: "0.95rem",
                }}
                disabled={loading}
              />

              <button
                onClick={handleContinue}
                className="discover-btn"
                style={{ border: "none", cursor: "pointer" }}
                disabled={loading}
              >
                {loading ? "Checking..." : "Continue"}
                <span className="btn-icon-circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </button>
            </div>

            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.75)" }}>
              Already have an account? <Link href="/login" style={{ color: "white", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          width: 100vw;
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
          justify-content: flex-start;
          padding: 140px 80px 0;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 5;
          min-height: 100vh;
        }
        .hero-content h1 {
          font-size: clamp(2.5rem, 8vw, 8rem);
          line-height: 0.95;
          font-weight: 700;
          letter-spacing: -0.05em;
          margin-bottom: 2rem;
          overflow-wrap: anywhere;
        }
        .bottom-bar {
          margin-top: auto;
          padding: 0 0 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
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

        @media (max-width: 1200px) {
          .landing-container { width: 100vw !important; }
          .hero-main { padding: 130px 60px 0 !important; max-width: 1200px !important; }
          .hero-content h1 { font-size: clamp(2.5rem, 6vw, 6rem) !important; }
        }
        @media (max-width: 1024px) {
          .landing-container { width: 100vw !important; }
          .hero-main { padding: 120px 40px 0 !important; }
          .bottom-bar { padding-bottom: 40px !important; }
          .hero-content h1 { font-size: clamp(2.5rem, 5vw, 5rem) !important; }
        }
        @media (max-width: 768px) {
          .landing-container { width: 100vw !important; }
          .hero-main { 
            padding: 110px 20px 80px !important; 
            justify-content: flex-start !important; 
            min-height: 100vh !important;
          }
          .hero-content h1 { 
            font-size: clamp(1.8rem, 9vw, 3.2rem) !important; 
            line-height: 1.05 !important;
            margin-top: 0 !important;
            margin-bottom: 2rem !important;
            max-width: 100% !important;
          }
          .bottom-bar { 
            position: relative !important; 
            bottom: 0 !important; 
            left: 0 !important; 
            right: 0 !important; 
            flex-direction: column !important; 
            align-items: flex-start !important; 
            gap: 2.5rem !important; 
            margin-top: 4rem !important;
            padding: 0 20px !important;
          }
          .subtext p { 
            font-size: 0.95rem !important; 
            line-height: 1.6 !important;
            max-width: 100% !important;
            margin-bottom: 0.8rem !important;
          }
          .subtext p br { display: none !important; }
          .company-name-bottom { 
            font-size: 1.2rem !important; 
            margin-top: 1.5rem !important;
          }
          .logo-container { 
            top: 20px !important; 
            left: 20px !important; 
          }
          .logo-text { 
            font-size: 1.3rem !important; 
          }
          .logo-icon { 
            width: 28px !important; 
            height: 28px !important; 
          }
          .discover-btn {
            font-size: 0.7rem !important;
            padding: 10px 10px 10px 20px !important;
            min-width: auto !important;
            align-self: flex-start !important;
          }
          .btn-icon-circle { 
            width: 36px !important; 
            height: 36px !important; 
          }
          .btn-icon-circle svg { 
            width: 16px !important; 
            height: 16px !important; 
          }
        }
        @media (max-width: 480px) {
          .landing-container { width: 100vw !important; }
          .hero-main {
            padding: 100px 16px 60px !important;
          }
          .hero-content h1 {
            font-size: clamp(1.6rem, 11vw, 2.6rem) !important;
            line-height: 1.1 !important;
            margin-top: 0 !important;
            margin-bottom: 1.5rem !important;
          }
          .bottom-bar {
            margin-top: 3rem !important;
            gap: 2rem !important;
          }
          .subtext p {
            font-size: 0.9rem !important;
            line-height: 1.5 !important;
            margin-bottom: 0.6rem !important;
          }
          .company-name-bottom {
            font-size: 1.1rem !important;
            margin-top: 1.2rem !important;
          }
          .logo-container {
            top: 16px !important;
            left: 16px !important;
          }
          .logo-text {
            font-size: 1.2rem !important;
          }
          .logo-icon {
            width: 24px !important;
            height: 24px !important;
          }
          .discover-btn {
            font-size: 0.65rem !important;
            padding: 8px 8px 8px 16px !important;
            min-width: auto !important;
          }
          .btn-icon-circle {
            width: 32px !important;
            height: 32px !important;
          }
          .btn-icon-circle svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
