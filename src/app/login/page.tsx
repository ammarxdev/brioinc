"use client";

import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function SearchParamsHandler({ email, setEmail, setInfo }: { email: string; setEmail: (v: string) => void; setInfo: (v: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    const reason = searchParams.get("reason");
    if (fromQuery && !email) setEmail(fromQuery);
    if (reason === "exists") {
      setInfo("Account already exists. Please sign in.");
    }
  }, [searchParams, email, setEmail, setInfo]);

  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();

  const handleSendOTP = async () => {
    setSendingOTP(true);
    setError("");
    setInfo("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("Email is required.");

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setOtpSent(true);
      setInfo(`Check ${normalizedEmail} for a 6-digit login code.`);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: otpCode,
        type: 'magiclink'
      });

      if (error) throw error;
      if (!data?.session) throw new Error("Sign-in failed. Please try again.");


      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <Suspense fallback={null}>
        <SearchParamsHandler email={email} setEmail={setEmail} setInfo={setInfo} />
      </Suspense>
      <div className="bg-container">
        <Image src="/bio-bg.png" alt="BG" fill style={{ objectFit: 'cover', transform: 'scale(1.05)' }} priority />
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
          <h1>Welcome back</h1>
          <p className="subtitle">Log in to manage your institutional capital.</p>

          {error && <div className="error-alert">{error}</div>}
          {info && <div className="success-alert">{info}</div>}

          {otpSent ? (
            <form onSubmit={handleVerifyOTP} className="login-form">
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem', fontWeight: 800 }}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading || otpCode.length !== 6}>
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <p className="bottom-link">
                <button type="button" onClick={() => setOtpSent(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}>
                  Change email address
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={sendingOTP || !email}
              >
                {sendingOTP ? "Sending Code..." : "Send Verification Code"}
              </button>

              <p className="bottom-link">
                New to Brioinc? <Link href="/signup">Create account</Link>
              </p>
            </form>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .landing-container { min-height: 100vh; width: 100%; position: relative; color: white; background: #000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .bg-container { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -2; }
        .bg-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 50%, #000 70%); box-shadow: inset 0 0 150px 50px #000; z-index: 1; }
        .logo-container { position: absolute; top: 32px; left: 32px; display: flex; align-items: center; gap: 12px; z-index: 10; }
        .logo-text { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.04em; color: white; }
        .logo-icon { width: 28px; height: 28px; stroke: white; }

        .form-page-main { padding: 120px 20px 60px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .login-glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.08); padding: 3rem; border-radius: 2rem; width: 100%; max-width: 460px; box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6); }
        h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.04em; }
        .subtitle { color: #94a3b8; margin-bottom: 2rem; font-size: 0.95rem; }
        
        .error-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.85rem; }
        .success-alert { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.85rem; }

        .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        input { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 1rem; color: white; font-size: 0.95rem; transition: all 0.2s; }
        input:focus { outline: none; border-color: rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.08); }

        .submit-btn { background: #ffffff; color: #000000; border: none; border-radius: 100px; padding: 1.1rem; width: 100%; font-weight: 800; cursor: pointer; font-size: 1rem; margin-top: 1.5rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(255,255,255,0.15); }
        .submit-btn:active { transform: translateY(0); }

        .send-otp-btn { background: rgba(255, 255, 255, 0.05); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 0.85rem; width: 100%; font-weight: 600; cursor: pointer; font-size: 0.85rem; margin-bottom: 0.5rem; transition: all 0.2s; }
        .send-otp-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); }
        .send-otp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .bottom-link { text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.85rem; }
        .bottom-link a { color: #ffffff; font-weight: 700; text-decoration: none; margin-left: 0.5rem; }
        .bottom-link a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .logo-container { top: 24px; left: 24px; }
          .logo-text { font-size: 1.25rem; }
          .logo-icon { width: 24px; height: 24px; }
          .form-page-main { padding-top: 100px; }
          .login-glass-card { padding: 2.5rem 1.5rem; border-radius: 1.5rem; }
          h1 { font-size: 1.85rem; }
        }
      `}</style>
    </div>
  );
}
