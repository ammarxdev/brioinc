"use client";

import "./admin.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";


export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "invoices" | "audit" | "create-admin">("users");

  // Users Tab States
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [selectedReviewUser, setSelectedReviewUser] = useState<any | null>(null);

  // Invoices Tab States
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
  // Decryption & Settlement States
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedAccount, setDecryptedAccount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [settleNotes, setSettleNotes] = useState("");
  const [settling, setSettling] = useState(false);

  // Audit Tab States
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // Create Admin State
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserMsg, setCreateUserMsg] = useState({ type: "", text: "" });

  // Auth state variables
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginInfo, setLoginInfo] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [dataLoadError, setDataLoadError] = useState("");

  const [showBootstrapAdmin, setShowBootstrapAdmin] = useState(false);
  const [bootstrapName, setBootstrapName] = useState("");
  const [bootstrapEmail, setBootstrapEmail] = useState("");
  const [bootstrapPassword, setBootstrapPassword] = useState("");
  const [bootstrapOtp, setBootstrapOtp] = useState("");
  const [bootstrapOtpSent, setBootstrapOtpSent] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      console.log("Admin auth check: starting...");
      setCheckingAuth(true);

      console.log("Admin auth check: getting session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Admin auth check: session found?", !!session);
      
      if (!session?.user) {
        console.log("Admin auth check: no session user, showing login form.");
        setIsAdmin(false);
        setCheckingAuth(false);
        return;
      }

      console.log("Admin auth check: querying users table for role...");
      // Check role in public.users table
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      console.log("Admin auth check: users table query response:", { data, error });

      if (error || data?.role !== "admin") {
        console.log("Admin auth check: user is not an admin or error occurred.");
        setIsAdmin(false);
      } else {
        console.log("Admin auth check: user IS an admin, loading dashboard data...");
        setAdminUser(session.user);
        setIsAdmin(true);
        fetchInitialData();
      }
    } catch (err) {
      console.error("Admin auth check failed with exception:", err);
      setIsAdmin(false);
    } finally {
      console.log("Admin auth check: finished, setting checkingAuth to false.");
      setCheckingAuth(false);
    }
  };

  const handleBootstrapSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapLoading(true);
    setLoginError("");
    setLoginInfo("");

    try {
      const normalizedEmail = bootstrapEmail.trim().toLowerCase();
      if (!bootstrapName.trim()) throw new Error("Name is required.");
      if (!normalizedEmail) throw new Error("Email is required.");
      if (!bootstrapPassword || bootstrapPassword.trim().length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: bootstrapPassword,
        options: {
          data: {
            name: bootstrapName.trim(),
          },
        },
      });

      if (error) throw error;

      setBootstrapOtpSent(true);
    } catch (err: any) {
      setLoginError(err?.message || "Failed to start admin setup.");
    } finally {
      setBootstrapLoading(false);
    }
  };

  const handleBootstrapVerifyOtpAndPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapLoading(true);
    setLoginError("");
    setLoginInfo("");

    try {
      const normalizedEmail = bootstrapEmail.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("Email is required.");
      if (bootstrapOtp.trim().length < 4) throw new Error("OTP is required.");

      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: bootstrapOtp.trim(),
        type: "signup",
      });

      if (error) throw error;
      if (!data?.session?.access_token) throw new Error("No session created. Please try again.");

      const res = await fetch("/api/admin/setup/promote-self", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to promote admin");
      }

      await checkAdminAuth();
    } catch (err: any) {
      setLoginError(err?.message || "Failed to verify OTP.");
    } finally {
      setBootstrapLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    setLoginInfo("");
    setDataLoadError("");

    try {
      const sanitizedUsername = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedUsername,
        password: sanitizedPassword,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user session created.");

      // Verify admin role
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access Denied: This account is not authorized as an administrator.");
      }

      setAdminUser(data.user);
      setIsAdmin(true);
      fetchInitialData();
    } catch (err: any) {
      console.error("Admin login error:", err);
      setLoginError(err.message || "Authentication failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendAdminResetEmail = async () => {
    setLoginLoading(true);
    setLoginError("");
    setLoginInfo("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("Enter your email first.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new Error("Invalid email address.");
      }

      const next = "/reset-password?next=/admin";
      const redirectTo = `${window.location.origin}/auth/callback?type=recovery&next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      if (error) throw error;

      setLoginInfo("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setLoginError(err?.message || "Failed to send reset email.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreateUserMsg({ type: "", text: "" });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("You must be logged in as an admin to create an admin account.");
      }
      const res = await fetch("/api/admin/admins/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");

      setCreateUserMsg({ type: "success", text: "Admin account created successfully!" });
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      fetchPendingUsers();
    } catch (err: any) {
      setCreateUserMsg({ type: "error", text: err.message });
    } finally {
      setCreatingUser(false);
    }
  };

  const fetchInitialData = async () => {
    console.log("fetchInitialData: starting...");
    setLoading(true);
    setDataLoadError("");
    try {
      await Promise.all([
        fetchPendingUsers(),
        fetchInvoices(),
        fetchAuditLogs()
      ]);
      console.log("fetchInitialData: successfully loaded all data.");
    } catch (err) {
      console.error("fetchInitialData: failed to load data:", err);
    } finally {
      setLoading(false);
      console.log("fetchInitialData: finished.");
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: any = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/admin/kyc/pending", {
        method: "GET",
        headers,
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to fetch pending KYC");
      }

      const mapped = (payload.submissions || []).map((s: any) => {
        const userRow = Array.isArray(s.users) ? s.users[0] : s.users;
        return {
          id: s.id,
          submission_id: s.id,
          user_id: s.user_id,
          name: userRow?.name || `${userRow?.first_name || ""} ${userRow?.last_name || ""}`.trim(),
          email: userRow?.email,
          status: "pending",
          cnic_front: s.cnic_front_url,
          cnic_back: s.cnic_back_url,
          selfie: s.selfie_url,
        };
      });

      setPendingUsers(mapped);
    } catch (err) {
      console.warn("Error fetching real users:", err);
      setDataLoadError((prev) => prev || (err as any)?.message || "Failed to fetch pending KYC");
      setPendingUsers([]);
    }
  };

  const fetchInvoices = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: any = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/admin/invoices/list", {
        method: "GET",
        headers,
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to fetch invoices");
      }

      setInvoices(payload?.invoices || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setDataLoadError((prev) => prev || (err as any)?.message || "Failed to fetch invoices");
      setInvoices([]);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const [adminRes, emailRes] = await Promise.all([
        supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("email_logs").select("*").order("created_at", { ascending: false }).limit(50)
      ]);
      
      if (!adminRes.error && adminRes.data) setAdminLogs(adminRes.data);
      if (!emailRes.error && emailRes.data) setEmailLogs(emailRes.data);
    } catch (err) {
      console.warn("Audit log fetch error:", err);
    }
  };

  const handleApprove = async (user: any) => {
    try {
      if (!user?.submission_id) {
        throw new Error("Missing submission id. Please refresh the page and try again.");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Unauthorized");
      }

      setLoading(true);

      const res = await fetch("/api/admin/kyc/decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ submissionId: user.submission_id, decision: "approve" }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to approve");
      }

      setSelectedReviewUser(null);
      await Promise.all([fetchPendingUsers(), fetchAuditLogs()]);
    } catch (err) {
      console.error("Failed to approve user:", err);
      const msg = (err as any)?.message || "Failed to approve";
      setDataLoadError((prev) => prev || msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (user: any) => {
    if (!window.confirm("Are you sure you want to reject this user?")) return;
    
    try {
      if (!user?.submission_id) {
        throw new Error("Missing submission id. Please refresh the page and try again.");
      }

      const reason = window.prompt("Rejection reason (shown to user):", "Document unclear / mismatch") || "";
      if (reason.trim().length < 3) {
        alert("Rejection reason is required.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Unauthorized");
      }

      setLoading(true);

      const res = await fetch("/api/admin/kyc/decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ submissionId: user.submission_id, decision: "reject", reason }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Failed to reject");
      }

      setSelectedReviewUser(null);
      await Promise.all([fetchPendingUsers(), fetchAuditLogs()]);
    } catch (err) {
      console.error("Failed to reject user:", err);
      const msg = (err as any)?.message || "Failed to reject";
      setDataLoadError((prev) => prev || msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Secure Decrypt Bank Details Trigger
  const handleDecryptBank = async (invoiceId: string) => {
    if (!adminUser) return;
    
    try {
      setDecrypting(true);
      setDecryptedAccount("");

      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/settle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'decrypt-bank',
          invoiceId
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDecryptedAccount(data.decryptedAccount);
      } else {
        alert(data.error || "Failed to decrypt bank info.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting decryption service.");
    } finally {
      setDecrypting(false);
    }
  };

  // Settle Invoice Trigger
  const handleConfirmSettlement = async () => {
    if (!selectedInvoice || !referenceNumber) {
      alert("Please enter a valid transfer reference hash/ID.");
      return;
    }

    try {
      setSettling(true);

      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/settle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          action: 'complete-settlement',
          invoiceId: selectedInvoice.id,
          referenceNumber,
          notes: settleNotes
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Settlement completed successfully! Vendor ledger updated.");
        setSelectedInvoice(null);
        setReferenceNumber("");
        setSettleNotes("");
        setDecryptedAccount("");
        
        // Refresh Lists
        fetchInvoices();
        fetchAuditLogs();
      } else {
        alert(data.error || "Failed to submit settlement confirmation.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error confirming payout.");
    } finally {
      setSettling(false);
    }
  };

  // CSV Report Generator
  const handleExportCSV = () => {
    if (invoices.length === 0) {
      alert("No invoice records to export.");
      return;
    }

    const headers = ["Invoice Number", "Client Name", "Client Email", "Amount", "Currency", "Status", "Bank Name", "Bank Country", "Created At"];
    const rows = invoices.map(inv => [
      inv.invoice_number,
      inv.client_name || 'N/A',
      inv.client_email,
      inv.amount,
      inv.currency || 'USD',
      inv.status,
      inv.bank_name || 'N/A',
      inv.bank_country || 'N/A',
      new Date(inv.created_at).toLocaleString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brioinc_invoice_settlement_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter invoices based on search & filter state
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.client_name?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.client_email?.toLowerCase().includes(invoiceSearch.toLowerCase());
    
    const matchesStatus = invoiceStatusFilter === "all" || inv.status === invoiceStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (checkingAuth || isAdmin === null) {
    return (
      <div className="admin-login-bg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1.5rem' }}>
        <div className="spinner"></div>
        <span style={{ color: "#94a3b8", fontFamily: "monospace", letterSpacing: "0.15em", fontSize: "0.85rem", textTransform: "uppercase" }}>
          Authenticating Clearance...
        </span>
        <style jsx global>{`
          .admin-login-bg { background: #000; min-height: 100vh; }
          .spinner { width: 3rem; height: 3rem; border: 3px solid rgba(255,255,255,0.05); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-login-bg">
        <div className="admin-login-card">
          <div className="lock-icon-box">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          
          <h1 className="login-title">Security Gateway</h1>
          <p className="login-subtitle">Brioinc Multi-Asset Settlement System</p>

          {loginError && <div className="login-error">{loginError}</div>}
          {loginInfo && <div className="login-info">{loginInfo}</div>}

          {!showBootstrapAdmin ? (
            <>
              <form onSubmit={handleAdminLogin} className="login-form">
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="login-label">Email Username</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="operator@brioinc.net" 
                    className="login-input" 
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "1rem" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                  <label className="login-label">Access Token / Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••••••" 
                    className="login-input" 
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "1rem" }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={loginLoading} className="login-btn">
                  {loginLoading ? "Verifying Clearance..." : "Establish Secure Session"}
                </button>

                <button
                  type="button"
                  disabled={loginLoading}
                  className="login-btn"
                  style={{ marginTop: '1rem', background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
                  onClick={handleSendAdminResetEmail}
                >
                  Reset Password
                </button>
              </form>
            </>
          ) : (
            <>
              {!bootstrapOtpSent ? (
                <form onSubmit={handleBootstrapSendOtp} className="login-form">
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="login-label">Full Name</label>
                    <input
                      type="text"
                      required
                      className="login-input"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "1rem" }}
                      value={bootstrapName}
                      onChange={(e) => setBootstrapName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="login-label">Email</label>
                    <input
                      type="email"
                      required
                      className="login-input"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "1rem" }}
                      value={bootstrapEmail}
                      onChange={(e) => setBootstrapEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="login-label">Password</label>
                    <input
                      type="password"
                      required
                      className="login-input"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "1rem" }}
                      value={bootstrapPassword}
                      onChange={(e) => setBootstrapPassword(e.target.value)}
                    />
                  </div>

                  <button type="submit" disabled={bootstrapLoading} className="login-btn">
                    {bootstrapLoading ? "Sending OTP..." : "Send OTP"}
                  </button>

                  <button
                    type="button"
                    className="login-btn"
                    style={{ marginTop: '1rem', background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
                    onClick={() => {
                      setShowBootstrapAdmin(false);
                      setLoginError("");
                    }}
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBootstrapVerifyOtpAndPromote} className="login-form">
                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="login-label">OTP Code</label>
                    <input
                      type="text"
                      required
                      className="login-input"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "white", padding: "1rem" }}
                      value={bootstrapOtp}
                      onChange={(e) => setBootstrapOtp(e.target.value)}
                    />
                  </div>

                  <button type="submit" disabled={bootstrapLoading} className="login-btn">
                    {bootstrapLoading ? "Verifying..." : "Verify OTP & Create Admin"}
                  </button>
                </form>
              )}
            </>
          )}
          
          <div className="login-footer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            This system logs all access. Unauthorized connections will be recorded.
          </div>
        </div>

        <style jsx global>{`
          .admin-login-bg {
            background: #000;
            background-image: radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, rgba(0,0,0,1) 70%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .admin-login-card {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(40px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 3.5rem 3rem;
            border-radius: 2rem;
            width: 100%;
            max-width: 480px;
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.9);
            text-align: center;
          }
          .lock-icon-box {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 72px;
            height: 72px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 1.5rem;
            color: white;
            margin-bottom: 2rem;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          }
          .login-title {
            color: white;
            font-size: 1.75rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.03em;
          }
          .login-subtitle {
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 2.5rem;
          }
          .login-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.15);
            color: #f87171;
            padding: 0.85rem;
            border-radius: 0.75rem;
            font-size: 0.8rem;
            margin-bottom: 2rem;
            text-align: left;
            line-height: 1.4;
          }
          .login-info {
            background: rgba(34, 197, 94, 0.08);
            border: 1px solid rgba(34, 197, 94, 0.18);
            color: #4ade80;
            padding: 0.85rem;
            border-radius: 0.75rem;
            font-size: 0.8rem;
            margin-bottom: 2rem;
            text-align: left;
            line-height: 1.4;
          }
          .login-form {
            text-align: left;
          }
          .login-label {
            display: block;
            font-size: 0.7rem;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
          }
          .login-btn {
            width: 100%;
            background: white;
            color: black;
            border: none;
            padding: 1.1rem;
            border-radius: 100px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 20px rgba(255,255,255,0.15);
          }
          .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255,255,255,0.25);
          }
          .login-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .login-footer {
            margin-top: 2.5rem;
            color: #475569;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            line-height: 1.4;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="page-content">
        
        {/* Dynamic Nav tabs */}
        <div className="admin-header">
          <div>
            <h1 className="page-title">Administrative Terminal</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Audit gateways, verify global accounts, and dispatch manual bank wires.
            </p>
          </div>
          
          <div className="admin-header-actions" style={{ display: "flex", gap: "1rem" }}>
            <button className="btn-header btn-header-outline" onClick={handleExportCSV}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Report
            </button>
            <button 
              className="btn-header btn-header-dark" 
              onClick={async () => {
                await supabase.auth.signOut();
                setIsAdmin(false);
                setAdminUser(null);
              }}
              style={{ backgroundColor: "#dc2626", borderColor: "#dc2626", color: "white" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Secure Exit
            </button>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: "1.5rem" }}>
          <button 
            onClick={() => setActiveTab("users")}
            style={{ 
              padding: "0.75rem 1rem", 
              background: "none", 
              border: "none", 
              borderBottom: activeTab === "users" ? "2px solid #ffffff" : "2px solid transparent", 
              fontWeight: activeTab === "users" ? 700 : 500, 
              color: activeTab === "users" ? "#ffffff" : "#64748b", 
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            Users & KYC Verification
          </button>
          <button 
            onClick={() => setActiveTab("invoices")}
            style={{ 
              padding: "0.75rem 1rem", 
              background: "none", 
              border: "none", 
              borderBottom: activeTab === "invoices" ? "2px solid #ffffff" : "2px solid transparent", 
              fontWeight: activeTab === "invoices" ? 700 : 500, 
              color: activeTab === "invoices" ? "#ffffff" : "#64748b", 
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            Invoices & Settlement ({invoices.filter(i => i.status === 'paid').length} Paid)
          </button>
          <button 
            onClick={() => setActiveTab("audit")}
            style={{ 
              padding: "0.75rem 1rem", 
              background: "none", 
              border: "none", 
              borderBottom: activeTab === "audit" ? "2px solid #ffffff" : "2px solid transparent", 
              fontWeight: activeTab === "audit" ? 700 : 500, 
              color: activeTab === "audit" ? "#ffffff" : "#64748b", 
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            System Logs & Audit
          </button>
          <button 
            onClick={() => setActiveTab("create-admin")}
            style={{ 
              padding: "0.75rem 1rem", 
              background: "none", 
              border: "none", 
              borderBottom: activeTab === "create-admin" ? "2px solid #ffffff" : "2px solid transparent", 
              fontWeight: activeTab === "create-admin" ? 700 : 500, 
              color: activeTab === "create-admin" ? "#ffffff" : "#64748b", 
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            Create Admin
          </button>
        </div>

        {dataLoadError && (
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "0.9rem 1rem",
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              background: "rgba(239, 68, 68, 0.06)",
              color: "#fca5a5",
              fontSize: "0.85rem",
              lineHeight: 1.5,
            }}
          >
            {dataLoadError}
          </div>
        )}

        {/* Tab Panel contents */}
        {activeTab === "users" && (
          <div className="bottom-widgets-grid" style={{ gridTemplateColumns: "2fr 1.2fr" }}>
            <div className="widget-card">
              <div className="widget-header">
                <h2 className="section-title" style={{ fontSize: "1.1rem", fontWeight: 700 }}>Pending KYC & User Reviews</h2>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Total pending: {pendingUsers.length}</span>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User Details</th>
                      <th>Application status</th>
                      <th>Risk Check</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>Querying database records...</td></tr>
                    ) : pendingUsers.length === 0 ? (
                      <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem', color: "#6b7280"}}>All KYC requests verified. Desk clear!</td></tr>
                    ) : (
                      pendingUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{u.name?.substring(0, 2).toUpperCase() || 'U'}</div>
                              <div className="user-info">
                                <span className="user-name">{u.name || 'Unknown User'}</span>
                                <span className="user-email">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="status-badge" style={{ background: "rgba(234, 179, 8, 0.08)", color: "#ca8a04" }}>
                              <div className="status-dot"></div>
                              PENDING REVIEW
                            </div>
                          </td>
                          <td>
                            <div className="risk-score risk-low">
                              <div className="risk-bar-container">
                                <div className="risk-bar"></div>
                              </div>
                              <span className="risk-label" style={{ color: '#16a34a' }}>Low Risk</span>
                            </div>
                          </td>
                          <td>
                            <div className="action-cell">
                              <button 
                                className="btn-inspect" 
                                onClick={() => setSelectedReviewUser(u)} 
                                style={{ 
                                  backgroundColor: "#0f172a", 
                                  color: "white", 
                                  padding: "0.5rem 1rem", 
                                  borderRadius: "6px", 
                                  fontSize: "0.8rem", 
                                  fontWeight: 700, 
                                  border: "none",
                                  cursor: "pointer"
                                }}
                              >
                                Inspect CNIC
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side activity feed */}
            <div className="widget-card">
              <div className="feed-header">
                <div className="live-dot"></div>
                Live Node Watcher
              </div>
              <div className="feed-list">
                <div className="feed-item">
                  <div className="feed-item-header">
                    <div className="feed-icon">🔑</div>
                    <div className="feed-title">
                      Webhooks Operational
                      <span className="feed-time">Active</span>
                    </div>
                  </div>
                  <div className="feed-desc">NowPayments IPN verification listener loaded on host.</div>
                </div>
                <div className="feed-item" style={{ background: "rgba(16,185,129,0.02)" }}>
                  <div className="feed-item-header">
                    <div className="feed-icon">🏦</div>
                    <div className="feed-title">
                      AES Banking Shield Active
                      <span className="feed-time">System</span>
                    </div>
                  </div>
                  <div className="feed-desc">Direct database banking details are cryptographically locked.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="widget-card">
            {/* Search and filters row */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <input 
                type="text" 
                placeholder="Search Invoice #, Client name, Client email..." 
                className="form-input"
                style={{ flex: 1, padding: "0.6rem 1rem", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", background: "rgba(255,255,255,0.02)", color: "white" }}
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
              />
              <select 
                className="form-input"
                style={{ width: "200px", padding: "0.6rem", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", background: "rgba(255,255,255,0.02)", color: "white" }}
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
              >
                <option value="all" style={{ background: "#050505", color: "white" }}>All Invoices</option>
                <option value="pending" style={{ background: "#050505", color: "white" }}>Pending Checkout</option>
                <option value="paid" style={{ background: "#050505", color: "white" }}>Paid (Needs Payout)</option>
                <option value="completed" style={{ background: "#050505", color: "white" }}>Completed / Settled</option>
                <option value="rejected" style={{ background: "#050505", color: "white" }}>Rejected / Voided</option>
              </select>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr style={{ color: "#64748b" }}>
                    <th>Invoice Number</th>
                    <th>Client Details</th>
                    <th>Billed Amount</th>
                    <th>Settlement Status</th>
                    <th>Created On</th>
                    <th style={{ textAlign: "right" }}>Payout Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>No matching invoices found in database ledger.</td></tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 700, fontFamily: "monospace", color: "#ffffff" }}>{inv.invoice_number}</td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600, color: "#ffffff" }}>{inv.client_name || 'Partner client'}</span>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{inv.client_email}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: "#ffffff" }}>
                          {inv.amount.toLocaleString()} {inv.currency || 'USD'}
                        </td>
                        <td>
                          {inv.status === 'pending' && (
                            <span style={{ background: "rgba(234,179,8,0.08)", color: "#ca8a04", padding: "0.25rem 0.5rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600 }}>
                              Checkout Pending
                            </span>
                          )}
                          {inv.status === 'paid' && (
                            <span style={{ background: "rgba(16,185,129,0.08)", color: "#16a34a", padding: "0.25rem 0.5rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, animation: "pulse 1.5s infinite" }}>
                              Paid (Needs Wire)
                            </span>
                          )}
                          {inv.status === 'completed' && (
                            <span style={{ background: "rgba(59,130,246,0.08)", color: "#2563eb", padding: "0.25rem 0.5rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600 }}>
                              Settled & Closed
                            </span>
                          )}
                          {inv.status === 'rejected' && (
                            <span style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", padding: "0.25rem 0.5rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600 }}>
                              Voided / Expired
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {inv.status === 'paid' && (
                            <button 
                              onClick={() => setSelectedInvoice(inv)}
                              style={{ border: "none", background: "#ffffff", color: "black", padding: "0.5rem 1rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", textTransform: "uppercase" }}
                            >
                              Settle Payout
                            </button>
                          )}
                          {inv.status === 'completed' && (
                            <button 
                              onClick={() => setSelectedInvoice(inv)}
                              style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#cbd5e1", padding: "0.5rem 1rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                            >
                              Inspect Log
                            </button>
                          )}
                          {inv.status === 'pending' && (
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Awaiting Client</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Left: Administrative actions */}
            <div className="widget-card">
              <h3 style={{ margin: "0 0 1.25rem 0", fontSize: "1.1rem", fontWeight: 700, color: "white" }}>Admin Activity Trails (Decryptions & Releases)</h3>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {adminLogs.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>No admin activity logged yet.</p>
                ) : (
                  adminLogs.map(log => (
                    <div key={log.id} style={{ padding: "0.85rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <strong style={{ color: "#ffffff", textTransform: "uppercase" }}>{log.action}</strong>
                        <span style={{ color: "#64748b" }}>{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ margin: "0 0 4px 0", color: "#94a3b8" }}>{log.details}</p>
                      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>IP Registered: {log.ip_address || 'Internal'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: sent transactional email metrics */}
            <div className="widget-card">
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 700 }}>Nodemailer Dispatch Audits</h3>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {emailLogs.length === 0 ? (
                  <p style={{ color: "#6b7280", fontSize: "0.85rem", textAlign: "center", padding: "2rem" }}>No dispatches registered.</p>
                ) : (
                  emailLogs.map(log => (
                    <div key={log.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid #f3f4f6", fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{log.recipient}</span>
                        <span style={{ color: log.status === 'sent' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 4px 0", color: "#4b5563" }}>Subject: {log.subject}</p>
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Triggered Action: {log.action} • {new Date(log.created_at).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Settle Drawer/Modal Popover overlay */}
        {selectedInvoice && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "#08080a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "2.5rem", maxWidth: "600px", width: "100%", boxShadow: "0 30px 100px rgba(0,0,0,0.9)", position: "relative", color: "#ffffff" }}>
              
              <button 
                onClick={() => { setSelectedInvoice(null); setDecryptedAccount(""); setReferenceNumber(""); }}
                style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>

              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem", color: "#ffffff" }}>
                {selectedInvoice.status === 'completed' ? 'Invoice Logs Review' : 'Settle Paid Invoice Payout'}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1.5rem 0" }}>
                Invoice reference: <strong style={{ color: "white" }}>{selectedInvoice.invoice_number}</strong>
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>Client Name:</span>
                  <div style={{ fontWeight: 600, color: "#ffffff" }}>{selectedInvoice.client_name}</div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Total Collected:</span>
                  <div style={{ fontWeight: 700, color: "#10b981" }}>
                    {selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency}
                  </div>
                </div>
              </div>

              {/* Bank accounts processing block */}
              <div style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.8rem", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>Creator Receiving Bank Wire Details</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Bank Name:</span>
                    <div style={{ fontWeight: 600, color: "#ffffff" }}>{selectedInvoice.bank_name}</div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Destination Country:</span>
                    <div style={{ fontWeight: 600, color: "#ffffff" }}>{selectedInvoice.bank_country}</div>
                  </div>
                </div>

                <div>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Bank Account Number / IBAN:</span>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "4px" }}>
                    <input 
                      type="text" 
                      readOnly 
                      className="form-input" 
                      style={{ 
                        flex: 1, 
                        background: "rgba(255,255,255,0.02)", 
                        border: "1px solid rgba(255,255,255,0.06)", 
                        fontSize: "0.85rem", 
                        fontFamily: "monospace", 
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        color: "#ffffff"
                      }}
                      value={decryptedAccount || "••••••••••••••••••••••••••••"} 
                    />
                    
                    {selectedInvoice.status !== 'completed' && !decryptedAccount && (
                      <button 
                        onClick={() => handleDecryptBank(selectedInvoice.id)}
                        disabled={decrypting}
                        style={{ 
                          background: "#ffffff", 
                          color: "#000000", 
                          border: "none", 
                          padding: "0.4rem 1rem", 
                          borderRadius: "100px", 
                          fontSize: "0.75rem", 
                          fontWeight: 800, 
                          cursor: "pointer",
                          textTransform: "uppercase"
                        }}
                      >
                        {decrypting ? "Decrypting..." : "Reveal IBAN"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Settlement form */}
              {selectedInvoice.status !== 'completed' ? (
                <div>
                  <div className="form-group" style={{ marginBottom: "1rem" }}>
                    <label className="form-label" style={{ fontWeight: 600, color: "#cbd5e1", fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>Binance TXN ID / Wire Reference *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Enter the wire transaction receipt reference code"
                      style={{ padding: "0.6rem 0.8rem", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", width: "100%", background: "rgba(255,255,255,0.02)", color: "white" }}
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                    <label className="form-label" style={{ color: "#cbd5e1", fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>Settlement Internal Notes (Optional)</label>
                    <textarea 
                      className="form-input"
                      rows={2}
                      placeholder="e.g. Cleared manual bank wire SEPA transfer."
                      style={{ padding: "0.6rem 0.8rem", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", width: "100%", background: "rgba(255,255,255,0.02)", color: "white", fontFamily: "inherit" }}
                      value={settleNotes}
                      onChange={(e) => setSettleNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                      onClick={handleConfirmSettlement}
                      disabled={settling}
                      style={{ 
                        flex: 1, 
                        background: "#10b981", 
                        color: "white", 
                        border: "none", 
                        padding: "0.8rem", 
                        borderRadius: "100px", 
                        fontWeight: 800, 
                        cursor: "pointer",
                        textTransform: "uppercase",
                        fontSize: "0.8rem",
                        letterSpacing: "0.05em"
                      }}
                    >
                      {settling ? "Confirming Release..." : "Release Payout & Settle Invoice"}
                    </button>
                    
                    <button 
                      onClick={() => { setSelectedInvoice(null); setDecryptedAccount(""); }}
                      style={{ 
                        background: "rgba(255,255,255,0.03)", 
                        border: "1px solid rgba(255,255,255,0.05)",
                        color: "#cbd5e1", 
                        padding: "0.8rem 1.2rem", 
                        borderRadius: "100px", 
                        fontWeight: 600, 
                        cursor: "pointer" 
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)", padding: "1.25rem", borderRadius: "12px", fontSize: "0.85rem", color: "#4ade80", lineHeight: 1.5 }}>
                  <strong>🔒 Audit Confirmed</strong>: This transaction has been fully completed. The local bank wire was successfully released.
                </div>
              )}

            </div>
          </div>
        )}

        {/* Dynamic CNIC Review Modal Popover overlay */}
        {selectedReviewUser && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "#08080a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "2.5rem", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 100px rgba(0,0,0,0.9)", position: "relative", color: "#ffffff" }}>
              
              <button 
                onClick={() => setSelectedReviewUser(null)}
                style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
              >
                &times;
              </button>

              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                Identity Verification Review (CNIC)
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1.5rem 0" }}>
                Review user uploaded CNIC documents and verify registration details.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>Full Name:</span>
                  <div style={{ fontWeight: 600, color: "#ffffff" }}>{selectedReviewUser.name || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>Email Address:</span>
                  <div style={{ fontWeight: 600, color: "#ffffff" }}>{selectedReviewUser.email}</div>
                </div>
              </div>

              {/* Document Images Display */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                <div>
                  <span style={{ color: "#cbd5e1", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>CNIC Front Side</span>
                  <div style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.01)", height: "150px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {selectedReviewUser.cnic_front ? (
                      <img 
                        src={selectedReviewUser.cnic_front} 
                        alt="CNIC Front Document" 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                      />
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.85rem" }}>No Front Image Uploaded</span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ color: "#cbd5e1", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>CNIC Back Side</span>
                  <div style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.01)", height: "150px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {selectedReviewUser.cnic_back ? (
                      <img 
                        src={selectedReviewUser.cnic_back} 
                        alt="CNIC Back Document" 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                      />
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.85rem" }}>No Back Image Uploaded</span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ color: "#cbd5e1", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Selfie (SN)</span>
                  <div style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.01)", height: "150px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {selectedReviewUser.selfie ? (
                      <img 
                        src={selectedReviewUser.selfie} 
                        alt="Selfie" 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                      />
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.85rem" }}>No Selfie Uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => handleReject(selectedReviewUser)}
                  style={{ 
                    border: "1px solid rgba(239,68,68,0.2)", 
                    background: "rgba(239,68,68,0.05)", 
                    color: "#f87171", 
                    padding: "0.75rem 1.5rem", 
                    borderRadius: "100px", 
                    fontSize: "0.8rem", 
                    fontWeight: 700, 
                    cursor: "pointer",
                    textTransform: "uppercase"
                  }}
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => handleApprove(selectedReviewUser)}
                  style={{ 
                    border: "none", 
                    background: "#10b981", 
                    color: "white", 
                    padding: "0.75rem 1.5rem", 
                    borderRadius: "100px", 
                    fontSize: "0.8rem", 
                    fontWeight: 800, 
                    cursor: "pointer",
                    textTransform: "uppercase"
                  }}
                >
                  Approve Verification
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: Create User */}
        {activeTab === "create-admin" && (
          <div className="tab-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="section-card">
              <h2 className="section-title">Create Admin Account</h2>
              <p className="section-subtitle">Provision a new administrator account.</p>
              
              {createUserMsg.text && (
                <div style={{ 
                  padding: "1rem", 
                  borderRadius: "0.5rem", 
                  marginBottom: "1.5rem", 
                  backgroundColor: createUserMsg.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: createUserMsg.type === "success" ? "#4ade80" : "#f87171",
                  border: `1px solid ${createUserMsg.type === "success" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                  fontSize: "0.9rem"
                }}>
                  {createUserMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="form-group">
                  <label className="login-label">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="John Doe" 
                    className="login-input" 
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                </div>

                <div className="form-group">
                  <label className="login-label">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="user@example.com" 
                    className="login-input" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                </div>

                <div className="form-group">
                  <label className="login-label">Initial Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••••••" 
                    className="login-input" 
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={creatingUser} 
                  className="login-btn"
                  style={{ marginTop: "1rem" }}
                >
                  {creatingUser ? "Provisioning..." : "Create Admin Account"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
