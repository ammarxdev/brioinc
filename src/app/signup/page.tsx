"use client";

import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function SearchParamsHandler({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    if (fromQuery && !email) setEmail(fromQuery);
  }, [searchParams, email, setEmail]);

  return null;
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isStrongPassword = (v: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v);
  const isValidPhone = (v: string) => /^\+?[0-9]{10,15}$/.test(v);
  const isAdult = (isoDate: string) => {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
    return age >= 18;
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

      const normalizedEmail = email.trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        throw new Error("Please enter a valid email address.");
      }
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error("First name and last name are required.");
      }
      if (!dateOfBirth || !isAdult(dateOfBirth)) {
        throw new Error("You must be at least 18 years old.");
      }
      if (!isValidPhone(phone.trim())) {
        throw new Error("Please enter a valid phone number.");
      }
      if (!address.trim()) {
        throw new Error("Address is required.");
      }
      if (!isStrongPassword(password)) {
        throw new Error("Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Account creation failed.");

      // Store signup registration fields in localStorage to be created only when OTP is verified in Step 2
      if (typeof window !== "undefined") {
        localStorage.setItem("brioinc_pending_signup_profile", JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          dateOfBirth,
          address: address.trim(),
        }));
      }

      router.push(`/signup/kyc?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <Suspense fallback={null}>
        <SearchParamsHandler email={email} setEmail={setEmail} />
      </Suspense>
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
                <label>First Name</label>
                <input type="text" placeholder="e.g. Jane" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" placeholder="e.g. Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="e.g. +923001234567" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" placeholder="Street, City, Country" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Create a strong password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Re-enter your password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <label htmlFor="terms">I accept the <a href="/terms">Terms and Conditions</a></label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !termsAccepted}>
              {loading ? "Processing..." : "Create Account"}
            </button>

            <p className="bottom-link">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
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
        .logo-container { position: absolute; top: 32px; left: 32px; display: flex; align-items: center; gap: 12px; z-index: 10; }
        .logo-text { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.04em; color: white; }
        .logo-icon { width: 28px; height: 28px; stroke: white; }

        .form-page-main { padding: 120px 20px 80px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .signup-glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.08); padding: 3rem; border-radius: 2rem; width: 100%; max-width: 600px; box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6); }
        h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.04em; }
        .subtitle { color: #94a3b8; margin-bottom: 2.5rem; }
        
        .error-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.85rem; }
        .success-alert { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.85rem; }

        .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .form-row { display: flex; gap: 1.5rem; width: 100%; }
        label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        input:not([type="checkbox"]), select { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 1rem; color: white; font-size: 0.95rem; width: 100%; transition: all 0.2s; }
        input:focus { outline: none; border-color: rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.08); }

        .checkbox-group { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2.5rem; font-size: 0.9rem; color: #94a3b8; }
        .checkbox-group a { color: white; font-weight: 600; text-decoration: underline; }
        
        .submit-btn { background: white; color: black; border: none; border-radius: 100px; padding: 1.1rem; width: 100%; font-weight: 800; cursor: pointer; font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(255,255,255,0.15); }

        .bottom-link { text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.85rem; }
        .bottom-link a { color: #ffffff; font-weight: 700; text-decoration: none; margin-left: 0.5rem; }
        .bottom-link a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .logo-container { top: 24px; left: 24px; }
          .logo-text { font-size: 1.25rem; }
          .logo-icon { width: 24px; height: 24px; }
          .form-page-main { padding-top: 100px; }
          .signup-glass-card { padding: 2.5rem 1.5rem; border-radius: 1.5rem; }
          h1 { font-size: 1.85rem; }
          .form-row { flex-direction: column; gap: 0; }
        }
      `}</style>
    </div>
  );
}
