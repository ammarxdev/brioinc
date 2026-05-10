"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery&next=${encodeURIComponent("/reset-password")}`,
      });

      if (error) throw error;
      setMessage("Check your email for the password reset link.");
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="bg-container">
        <Image src="/finance-bg.png" alt="BG" fill style={{ objectFit: 'cover', transform: 'scale(1.05)' }} priority />
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

      <main className="form-page-main">
        <div className="login-glass-card">
          <h1>Reset password</h1>
          <p className="subtitle">Enter your email and we'll send you a link to reset your password.</p>

          {error && <div className="error-alert">{error}</div>}
          {message && <div className="success-alert">{message}</div>}

          <form onSubmit={handleReset} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="bottom-link">
              Remember your password? <Link href="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .landing-container { min-height: 100vh; width: 100%; position: relative; color: white; background: #000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .bg-container { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -2; }
        .bg-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 50%, #000 70%); box-shadow: inset 0 0 150px 50px #000; z-index: 1; }
        .logo-container { position: absolute; top: 40px; left: 40px; display: flex; align-items: center; gap: 12px; z-index: 10; }
        .logo-text { font-size: 1.75rem; font-weight: 600; letter-spacing: -0.04em; }
        .logo-icon { width: 32px; height: 32px; }

        .form-page-main { padding: 140px 20px 80px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .login-glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 3.5rem; border-radius: 2.5rem; width: 100%; max-width: 480px; box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5); }
        h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.04em; }
        .subtitle { color: #94a3b8; margin-bottom: 2.5rem; }
        
        .error-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.9rem; }
        .success-alert { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.9rem; }

        .form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
        label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        input { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 1.25rem; border-radius: 1.25rem; color: white; font-size: 1rem; width: 100%; }
        input:focus { outline: none; border-color: white; background: rgba(255, 255, 255, 0.1); }

        .submit-btn { background: white; color: black; border: none; border-radius: 100px; padding: 1.25rem; width: 100%; font-weight: 800; cursor: pointer; font-size: 1rem; margin-top: 1.5rem; transition: all 0.3s; }
        .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(255,255,255,0.2); }

        .bottom-link { text-align: center; margin-top: 2.5rem; color: #94a3b8; font-size: 0.9rem; }
        .bottom-link a { color: white; font-weight: 700; text-decoration: none; }

        @media (max-width: 768px) {
          .login-glass-card { padding: 2.5rem 2rem; border-radius: 2rem; }
          .logo-container { top: 20px; left: 20px; }
          h1 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
