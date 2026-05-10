"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KYCPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(user ? 2 : 1); // If user is already logged in, they've verified their email, so start at Step 2.
  
  // OTP States
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const emailFromQuery = (searchParams.get("email") || "").trim().toLowerCase();
  const otpEmail = (emailFromQuery || user?.email || "").trim().toLowerCase();

  // KYC Upload States
  const [cnicFrontFile, setCnicFrontFile] = useState<File | null>(null);
  const [cnicBackFile, setCnicBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showPopup, setShowPopup] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const cnicFrontPreview = useMemo(() => (cnicFrontFile ? URL.createObjectURL(cnicFrontFile) : null), [cnicFrontFile]);
  const cnicBackPreview = useMemo(() => (cnicBackFile ? URL.createObjectURL(cnicBackFile) : null), [cnicBackFile]);
  const selfiePreview = useMemo(() => (selfieFile ? URL.createObjectURL(selfieFile) : null), [selfieFile]);

  // If user status is already pending or approved, directly show relevant state
  useEffect(() => {
    if (user?.status === 'pending') {
      setShowPopup(true);
    }
  }, [user?.status]);

  const sendOTP = useCallback(async () => {
    if (!otpEmail) {
      setMsg({ type: "error", text: "Missing email. Please go back and enter your email again." });
      return;
    }
    setSendingOtp(true);
    setMsg({ type: "", text: "" });
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: otpEmail,
      });
      
      if (error) {
        throw error;
      }

      setOtpSent(true);
      setMsg({ type: "success", text: `Verification code sent to ${otpEmail}!` });
    } catch (err: any) {
      console.error(err);
      setMsg({ type: "error", text: err.message || "Failed to send verification code." });
    } finally {
      setSendingOtp(false);
    }
  }, [otpEmail]);



  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (step !== 1) return;
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) return;

      const storedProfile = typeof window !== "undefined" ? localStorage.getItem("brioinc_pending_signup_profile") : null;
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);

        const { error: profileErr } = await supabase
          .from("users")
          .update({
            name: `${profile.firstName} ${profile.lastName}`.trim(),
            first_name: profile.firstName,
            last_name: profile.lastName,
            date_of_birth: profile.dateOfBirth,
            phone: profile.phone,
            address: profile.address,
            status: "kyc_required",
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.user.id);

        if (profileErr) {
          setMsg({ type: "error", text: profileErr.message || "Failed to update your profile." });
          return;
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("brioinc_pending_signup_profile");
        }
      }

      if (!mounted) return;

      setStep(2);
      setMsg((prev) => (prev.text ? prev : { type: "success", text: "Email verified successfully! Please upload your documents." }));
    };

    run();

    return () => {
      mounted = false;
    };
  }, [step]);

  const handleVerifyOTP = async () => {
    if (!otpEmail) {
      setMsg({ type: "error", text: "Missing email. Please go back and enter your email again." });
      return;
    }
    setMsg({ type: "", text: "" });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token: otpCode,
        type: 'signup'
      });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        // Retrieve and write the user profile details only now that OTP is verified
        const storedProfile = typeof window !== "undefined" ? localStorage.getItem("brioinc_pending_signup_profile") : null;
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          
          const { error: profileErr } = await supabase
            .from("users")
            .update({
              name: `${profile.firstName} ${profile.lastName}`.trim(),
              first_name: profile.firstName,
              last_name: profile.lastName,
              date_of_birth: profile.dateOfBirth,
              phone: profile.phone,
              address: profile.address,
              status: "kyc_required",
              updated_at: new Date().toISOString(),
            })
            .eq("id", data.user.id);

          if (profileErr) throw profileErr;
          
          if (typeof window !== "undefined") {
            localStorage.removeItem("brioinc_pending_signup_profile");
          }
        }

        setStep(2); // Go to step 3 (KYC details)
        setMsg({ type: "success", text: "Email verified successfully! Please upload your documents." });
      } else {
        throw new Error("Verification succeeded but no user session was created. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setMsg({ type: "error", text: err.message || "Invalid verification code. Please check your email." });
    }
  };

  const validateFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be under 5MB.";
    }
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      return "Only PNG, JPG, or WEBP images are allowed.";
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "selfie") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setMsg({ type: "error", text: validationError });
      return;
    }

    if (type === "front") setCnicFrontFile(file);
    else if (type === "back") setCnicBackFile(file);
    else if (type === "selfie") setSelfieFile(file);
  };

  const handleSubmitVerification = async () => {
    if (!cnicFrontFile || !cnicBackFile || !selfieFile) {
      setMsg({ type: "error", text: "Please upload CNIC Front, CNIC Back, and Selfie images." });
      return;
    }

    setSubmitting(true);
    setMsg({ type: "", text: "" });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Unauthorized. Please sign in again.");

      const userId = session.user.id;
      const timestamp = Date.now();

      const extFromType = (t: string) => t === "image/png" ? "png" : t === "image/webp" ? "webp" : "jpg";

      const frontPath = `${userId}/${timestamp}-front.${extFromType(cnicFrontFile.type)}`;
      const backPath = `${userId}/${timestamp}-back.${extFromType(cnicBackFile.type)}`;
      const selfiePath = `${userId}/${timestamp}-selfie.${extFromType(selfieFile.type)}`;

      const [frontUpload, backUpload, selfieUpload] = await Promise.all([
        supabase.storage.from("kyc").upload(frontPath, cnicFrontFile, { contentType: cnicFrontFile.type }),
        supabase.storage.from("kyc").upload(backPath, cnicBackFile, { contentType: cnicBackFile.type }),
        supabase.storage.from("kyc").upload(selfiePath, selfieFile, { contentType: selfieFile.type })
      ]);

      if (frontUpload.error) throw frontUpload.error;
      if (backUpload.error) throw backUpload.error;
      if (selfieUpload.error) throw selfieUpload.error;

      const submitRes = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          cnicFrontPath: frontPath,
          cnicBackPath: backPath,
          selfiePath: selfiePath,
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.error || "Failed to submit verification");

      setMsg({ type: "success", text: "Verification submitted successfully!" });
      setShowPopup(true);
    } catch (err: any) {
      console.error("KYC submit error:", err);
      setMsg({ type: "error", text: err.message || "Failed to submit verification." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requireVerified={false}>
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
          <div className="signup-glass-card kyc-card">
            {step === 1 ? (
              // STEP 2: Email OTP Verification Screen
              <>
                <h1>Verify your email</h1>
                <p className="subtitle">Step 2: Enter the 6-digit verification code sent to <strong>{otpEmail || "your inbox"}</strong>.</p>

                {msg.text && (
                  <div className={msg.type === "error" ? "error-alert" : "success-alert"}>
                    {msg.text}
                  </div>
                )}

                <div className="otp-container">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000 000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="otp-input-field"
                  />
                  
                  <button 
                    onClick={handleVerifyOTP}
                    disabled={otpCode.length !== 6}
                    className="submit-btn"
                    style={{ marginTop: '2rem' }}
                  >
                    Verify & Continue
                  </button>

                  <p className="resend-text">
                    Didn't receive the code?{" "}
                    <button 
                      onClick={sendOTP} 
                      disabled={sendingOtp || !otpEmail}
                      className="resend-link"
                    >
                      {sendingOtp ? "Sending code..." : "Resend OTP"}
                    </button>
                  </p>
                </div>
              </>
            ) : (
              // STEP 3: KYC Details & Document Upload Screen
              <>
                <h1>Identity Verification</h1>
                <p className="subtitle">Step 3: Upload your CNIC and Selfie for secure admin verification.</p>

                {msg.text && (
                  <div className={msg.type === "error" ? "error-alert" : "success-alert"}>
                    {msg.text}
                  </div>
                )}

                <div className="kyc-grid">
                  {/* Front Side */}
                  <div className="upload-box" onClick={() => frontInputRef.current?.click()}>
                    {cnicFrontPreview ? (
                      <img src={cnicFrontPreview} alt="CNIC Front" />
                    ) : (
                      <div className="upload-content">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <span>Upload CNIC Front</span>
                      </div>
                    )}
                  </div>

                  {/* Back Side */}
                  <div className="upload-box" onClick={() => backInputRef.current?.click()}>
                    {cnicBackPreview ? (
                      <img src={cnicBackPreview} alt="CNIC Back" />
                    ) : (
                      <div className="upload-content">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <span>Upload CNIC Back</span>
                      </div>
                    )}
                  </div>

                  {/* Selfie */}
                  <div className="upload-box selfie-box" onClick={() => selfieInputRef.current?.click()}>
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="Selfie" />
                    ) : (
                      <div className="upload-content">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        <span>Upload Selfie (SN)</span>
                      </div>
                    )}
                  </div>
                </div>

                <input type="file" ref={frontInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, "front")} />
                <input type="file" ref={backInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, "back")} />
                <input type="file" ref={selfieInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, "selfie")} />

                <button 
                  onClick={handleSubmitVerification}
                  disabled={submitting || !cnicFrontFile || !cnicBackFile || !selfieFile}
                  className="submit-btn"
                  style={{ marginTop: '2rem' }}
                >
                  {submitting ? "Uploading Documents..." : "Submit for Approval"}
                </button>
              </>
            )}
          </div>
        </main>

        <Footer />

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="popup-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h2>Application Received</h2>
              <p>Please wait for 24 hours until admin approved and the application reached the admin dashboard. Once approved, you will be automatically redirected to your dashboard.</p>
              <button onClick={() => {
                const checkStatus = async () => {
                  const { data } = await supabase.from('users').select('status').eq('id', user?.id).single();
                  if (data?.status === 'approved') {
                    window.location.href = '/dashboard';
                  } else {
                    alert('Still pending admin approval.');
                  }
                };
                checkStatus();
              }} className="popup-btn">Check Status</button>
            </div>
          </div>
        )}

        <style jsx>{`
          .landing-container { min-height: 100vh; width: 100%; position: relative; color: white; background: #000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .bg-container { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -2; }
          .bg-overlay {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 50%, #000 70%);
            box-shadow: inset 0 0 150px 50px #000; z-index: 1;
          }
          .logo-container { position: absolute; top: 40px; left: 40px; display: flex; align-items: center; gap: 12px; z-index: 10; }
          .logo-text { font-size: 1.75rem; font-weight: 600; letter-spacing: -0.04em; }
          .logo-icon { width: 32px; height: 32px; }

          .form-page-main { padding: 140px 20px 80px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .signup-glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 3rem; border-radius: 2.5rem; width: 100%; max-width: 800px; box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5); }
          h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.04em; }
          .subtitle { color: #94a3b8; margin-bottom: 2.5rem; }
          
          .error-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.9rem; }
          .success-alert { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; padding: 1rem; border-radius: 1rem; margin-bottom: 2rem; font-size: 0.9rem; }

          .otp-container { display: flex; flex-direction: column; align-items: center; width: 100%; margin-top: 2rem; }
          .otp-input-field {
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); 
            padding: 1.25rem; border-radius: 1.25rem; color: white; font-size: 2rem; letter-spacing: 0.75rem;
            text-align: center; width: 100%; max-width: 320px; font-weight: 800; transition: all 0.2s;
          }
          .otp-input-field:focus { outline: none; border-color: white; background: rgba(255, 255, 255, 0.1); box-shadow: 0 0 20px rgba(255,255,255,0.05); }

          .resend-text { font-size: 0.9rem; color: #94a3b8; margin-top: 1.5rem; text-align: center; }
          .resend-link { background: none; border: none; color: white; font-weight: 700; cursor: pointer; text-decoration: underline; padding: 0; font-size: inherit; }
          .resend-link:disabled { opacity: 0.5; cursor: not-allowed; text-decoration: none; }

          .kyc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .selfie-box { grid-column: span 2; height: 250px !important; }
          
          .upload-box {
            background: rgba(255, 255, 255, 0.03); border: 2px dashed rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem; height: 180px; display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s; overflow: hidden; position: relative;
          }
          .upload-box:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.3); }
          .upload-box img { width: 100%; height: 100%; object-fit: cover; }
          .upload-content { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: #94a3b8; font-size: 0.9rem; font-weight: 600; }

          .submit-btn { background: white; color: black; border: none; border-radius: 100px; padding: 1.25rem; width: 100%; font-weight: 800; cursor: pointer; font-size: 1rem; transition: all 0.3s; }
          .submit-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(255,255,255,0.2); }
          .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

          .popup-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 100; }
          .popup-content { background: #0f172a; border: 1px solid #1e293b; padding: 3rem; border-radius: 2rem; max-width: 500px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .popup-icon { background: rgba(14, 165, 233, 0.1); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
          .popup-content h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: white; }
          .popup-content p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }
          .popup-btn { background: white; color: black; border: none; padding: 1rem 2rem; border-radius: 100px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
          .popup-btn:hover { transform: scale(1.05); }

          @media (max-width: 768px) {
            .kyc-grid { grid-template-columns: 1fr; }
            .selfie-box { grid-column: span 1; }
            .signup-glass-card { padding: 2rem; border-radius: 2rem; }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
