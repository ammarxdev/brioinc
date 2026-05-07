"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    const reason = searchParams.get("reason");
    if (fromQuery && !email) setEmail(fromQuery);
    if (reason === "exists") {
      setInfo("Account already exists. Please sign in.");
    }
  }, [searchParams, email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    console.log("Login button clicked for:", email);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("Email is required.");
      if (!password) throw new Error("Password is required.");

      console.log("Initiating Supabase signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      console.log("Supabase Response:", { data, error });

      if (error) {
        console.warn("Supabase Auth Error returned:", error.message);
        throw error;
      }
      if (!data?.session) {
        console.warn("No session returned in data payload.");
        throw new Error("Sign-in failed. Please try again.");
      }
      console.log("Login successful! Redirecting to /dashboard...");
      router.push("/dashboard");
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error("Login process caught error:", err);
      setError(err.message || "Failed to sign in.");
    } finally {
      console.log("handleLogin complete, resetting loading state.");
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
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

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="bottom-link">
              New to Brioinc? <Link href="/signup">Create account</Link>
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
        input { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 1.25rem; border-radius: 1.25rem; color: white; font-size: 1rem; }
        input:focus { outline: none; border-color: white; background: rgba(255, 255, 255, 0.1); }

        .verification-glass { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 1.5rem; margin: 1.5rem 0; }
        .otp-action-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; gap: 1rem; }
        .send-otp-btn { background: white; color: black; border: none; border-radius: 1rem; padding: 0.75rem 1.25rem; font-weight: 700; cursor: pointer; font-size: 0.85rem; white-space: nowrap; }
        .send-otp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .otp-inputs { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
        .otp-box { width: 3.25rem; height: 3.25rem; text-align: center; font-weight: 700; font-size: 1.2rem; padding: 0; }

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
