"use client";

import Image from "next/image";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, timeoutMessage: string) => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), ms);
      }),
    ]);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelectorAll('.otp-box')[index + 1] as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const sendOtp = async () => {
    if (!name) {
      setError("Please enter your full name first.");
      return;
    }
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setOtpLoading(true);
    setError("");
    setSuccess("");

    try {
      setOtp(["", "", "", "", "", ""]);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      setIsOtpSent(true);
      setSuccess("Verification code sent to your email.");
    } catch (err: any) {
      console.error('OTP sending error:', err);
      const message = err?.message || "Failed to send verification code. Please try again.";
      if (typeof message === "string" && message.toLowerCase().includes("error sending confirmation email")) {
        setError("Supabase could not send the OTP email. Configure SMTP in your Supabase project (Auth > SMTP) or email OTP sign-up will not work.");
      } else {
        setError(message);
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!termsAccepted) {
        throw new Error("You must accept the Terms and Conditions.");
      }

      if (!name) {
        throw new Error("Please fill in all required fields.");
      }

      if (!isOtpSent) {
        throw new Error("Please click Send Code first.");
      }

      const enteredOtp = otp.join("");
      if (enteredOtp.length !== 6) {
        throw new Error("Please enter the complete 6-digit verification code.");
      }

      // Verify OTP with Supabase
      const { data: verifyData, error: verifyError } = await withTimeout(
        supabase.auth.verifyOtp({
          email,
          token: enteredOtp,
          type: 'email',
        }),
        15000,
        "OTP verification timed out. Please try again."
      );

      if (verifyError) throw verifyError;
      if (!verifyData?.session) {
        throw new Error("OTP verified but no session was created. Check your Supabase email auth settings.");
      }

      // Update user metadata after verification
      const { error: updateError } = await withTimeout(
        supabase.auth.updateUser({
          data: {
            name: name,
          },
        }),
        15000,
        "Profile update timed out. Please try again."
      );

      if (updateError) {
        console.error("Failed to update user metadata:", updateError);
      }

      router.push("/dashboard/verification");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
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
        <div className="signup-glass-card">
          <h1>Create your account</h1>
          <p className="subtitle">Join the global fiat-to-binance institutional bridge.</p>

          {error && <div className="error-alert">{error}</div>}
          {success && <div className="success-alert">{success}</div>}

          <form onSubmit={handleRegister} className="signup-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Jane Doe" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="verification-glass">
              <label>Security Verification</label>
              <div className="otp-row">
                <button type="button" className="send-otp-btn" onClick={sendOtp} disabled={otpLoading}>
                  {otpLoading ? "..." : isOtpSent ? "Resend" : "Send Code"}
                </button>
              </div>
              <div className="otp-inputs">
                {otp.map((val, i) => (
                  <input key={i} type="text" maxLength={1} className="otp-box" value={val} onChange={(e) => handleOtpChange(i, e.target.value)} />
                ))}
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <label htmlFor="terms">I accept the <a href="/terms">Terms and Conditions</a></label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !termsAccepted || !isOtpSent}>
              {loading ? "Processing..." : "Create Account"}
            </button>
          </form>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .landing-container { min-height: 100vh; width: 100%; position: relative; color: white; background: #000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .bg-container { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -2; }
        .bg-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 50%, #000 70%);
          box-shadow: inset 0 0 150px 50px #000;
          z-index: 1;
        }
        .logo-container { position: absolute; top: 40px; left: 40px; display: flex; align-items: center; gap: 12px; z-index: 10; }
        .logo-text { font-size: 1.75rem; font-weight: 600; letter-spacing: -0.04em; }
        .logo-icon { width: 32px; height: 32px; }

        .form-page-main { padding: 140px 20px 80px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .signup-glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 3rem; border-radius: 2.5rem; width: 100%; max-width: 600px; box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5); }
        h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.04em; }
        .subtitle { color: #94a3b8; margin-bottom: 2.5rem; }
        
        .error-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.9rem; }
        .success-alert { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.9rem; }

        .form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .form-row { display: flex; gap: 1.5rem; width: 100%; }
        label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        input:not([type="checkbox"]), select { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 1rem; color: white; font-size: 1rem; width: 100%; }
        input:focus { outline: none; border-color: white; background: rgba(255, 255, 255, 0.1); }

        .verification-glass { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 1.5rem; margin: 2rem 0; }
        .otp-row { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
        .send-otp-btn { background: white; color: black; border: none; border-radius: 1rem; padding: 0 1.5rem; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
        .send-otp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .otp-inputs { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
        .otp-box { width: 3.5rem !important; height: 3.5rem; text-align: center; font-weight: 700; font-size: 1.2rem !important; }

        .checkbox-group { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2.5rem; }
        .checkbox-group a { color: white; text-decoration: underline; }
        
        .submit-btn { background: white; color: black; border: none; border-radius: 100px; padding: 1.25rem; width: 100%; font-weight: 800; cursor: pointer; font-size: 1rem; transition: all 0.3s; }
        .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(255,255,255,0.2); }

        @media (max-width: 768px) {
          .signup-glass-card { padding: 2rem; border-radius: 2rem; }
          .form-row { flex-direction: column; gap: 0; }
          .logo-container { top: 20px; left: 20px; }
          h1 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
