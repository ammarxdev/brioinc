"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import "./invoices.css";

export default function NewInvoicePage() {
  const { user } = useAuth();

  // Form Fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("Thank you for your business.");
  
  // Bank Fields
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankCountry, setBankCountry] = useState("");
  const [saveBankProfile, setSaveBankProfile] = useState(false);

  // Saved Bank Profiles
  const [savedBanks, setSavedBanks] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>("new");

  // State Management
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [error, setError] = useState("");

  // Fetch saved bank profiles on mount
  useEffect(() => {
    if (user?.id) {
      fetchSavedBanks();
    }
  }, [user]);

  const fetchSavedBanks = async () => {
    try {
      const { data, error: fetchErr } = await supabase
        .from("bank_details")
        .select("*")
        .eq("user_id", user?.id);
      
      if (!fetchErr && data) {
        setSavedBanks(data);
      }
    } catch (err) {
      console.warn("Error fetching bank profiles:", err);
    }
  };

  // Autofill form when saved bank profile is selected
  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedBankId(id);
    
    if (id === "new") {
      setBankName("");
      setBankAccountNumber("");
      setBankCountry("");
    } else {
      const bank = savedBanks.find(b => b.id === id);
      if (bank) {
        setBankName(bank.bank_name);
        // Bank account number is encrypted on server, so we prompt them to re-enter if updating, 
        // or we allow them to keep it as is. We'll pre-fill a placeholder.
        setBankAccountNumber("••••••••••••••••");
        setBankCountry(bank.country);
      }
    }
  };

  const handleSendInvoice = async () => {
    setError("");
    setSuccess(false);

    if (!clientEmail || !clientName || !amount || !bankName || !bankAccountNumber || !bankCountry) {
      setError("Please complete all required fields, including receiving bank details.");
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setError("You must be logged in to create an invoice.");
        return;
      }
      
      // 1. If save bank profile checked AND it's a new profile, save it to bank_details (optional client-side fallback check)
      if (saveBankProfile && selectedBankId === "new") {
        try {
          await fetch('/api/bank-details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              bankName,
              accountName: user?.name || "User Account",
              accountNumber: bankAccountNumber,
              country: bankCountry,
              isDefault: savedBanks.length === 0,
            }),
          });
          fetchSavedBanks();
        } catch (bankErr) {
          console.warn("Failed to save bank profile, proceeding with invoice:", bankErr);
        }
      }

      // 2. Dispatch creation to our secure api backend
      const response = await axios.post("/api/invoices", {
        clientName,
        clientEmail,
        amount: parseFloat(amount),
        currency,
        description: description || "Professional Services Rendering",
        bankName,
        bankAccountNumber: bankAccountNumber === "••••••••••••••••" 
          ? (savedBanks.find(b => b.id === selectedBankId)?.account_number_encrypted || "")
          : bankAccountNumber,
        bankCountry,
        notes,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setGeneratedLink(response.data.payPageUrl);
        
        // Reset non-bank form fields
        setClientName("");
        setClientEmail("");
        setAmount("");
        setDescription("");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to initiate invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-content" style={{ background: "#050505", minHeight: "100vh", color: "#ffffff" }}>
      <div className="invoice-header" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1.5rem" }}>
        <div>
          <h1 className="invoice-header-title" style={{ color: "#ffffff", letterSpacing: "-0.03em" }}>Create Invoice</h1>
          <div className="invoice-header-sub" style={{ color: "#94a3b8" }}>
            Generate high-end dynamic invoices and convert global client payments.
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#34d399", padding: "1.5rem", borderRadius: "16px", marginBottom: "2rem" }}>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 700 }}>🚀 Invoice Created and Dispatched!</h3>
          <p style={{ margin: "0 0 1rem 0", color: "#a7f3d0", fontSize: "0.9rem" }}>
            A premium notification has been emailed to your client with secure billing details.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "#000000", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {generatedLink}
            </span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert("Payment link copied to clipboard!");
              }}
              style={{ background: "#ffffff", color: "#000000", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      <div className="new-invoice-grid">
        {/* Left Side Inputs */}
        <div>
          {/* Section: Client details */}
          <div className="card" style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="card-title" style={{ color: "#f8fafc" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Customer Details
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: "#94a3b8" }}>Client Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                  placeholder="e.g. Acme Corporation Inc" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: "#94a3b8" }}>Client Email *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                  placeholder="billing@acme.com" 
                  value={clientEmail} 
                  onChange={(e) => setClientEmail(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Section: Receiving Bank account */}
          <div className="card" style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="card-title" style={{ color: "#f8fafc", justifyContent: "space-between", display: "flex", width: "100%" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <rect x="3" y="21" width="18" height="2" />
                  <path d="M5 21V10l7-7 7 7v11" />
                </svg>
                Receiving Bank Details (For Fiat Payout)
              </span>

              {savedBanks.length > 0 && (
                <select 
                  className="form-input" 
                  style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", padding: "0.25rem 0.5rem", fontSize: "0.8rem", height: "auto", width: "auto" }}
                  value={selectedBankId}
                  onChange={handleBankSelect}
                >
                  <option value="new">-- New Bank Profile --</option>
                  {savedBanks.map((b) => (
                    <option key={b.id} value={b.id}>{b.bank_name} ({b.country})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: "#94a3b8" }}>Bank Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                  placeholder="e.g. JPMorgan Chase" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: "#94a3b8" }}>Country *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                  placeholder="e.g. United States" 
                  value={bankCountry}
                  onChange={(e) => setBankCountry(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ color: "#94a3b8" }}>IBAN / Bank Account Number *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                  placeholder="Enter full IBAN or routing+account string" 
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                />
              </div>
            </div>

            {selectedBankId === "new" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input 
                  type="checkbox" 
                  id="save_profile"
                  checked={saveBankProfile}
                  onChange={(e) => setSaveBankProfile(e.target.checked)}
                  style={{ accentColor: "#10b981", cursor: "pointer" }}
                />
                <label htmlFor="save_profile" style={{ fontSize: "0.85rem", color: "#94a3b8", cursor: "pointer" }}>
                  Save bank credentials for future invoices
                </label>
              </div>
            )}
          </div>

          {/* Section: Dynamic Invoice items */}
          <div className="card" style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="card-title" style={{ color: "#f8fafc" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <circle cx="3" cy="6" r="1" />
                <circle cx="3" cy="12" r="1" />
                <circle cx="3" cy="18" r="1" />
              </svg>
              Invoice Description & Amount
            </div>
            
            <div className="form-row" style={{ flexDirection: "column" }}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" style={{ color: "#94a3b8" }}>Itemized Billing Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff" }}
                  placeholder="e.g. Enterprise Consulting Services - April" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ color: "#94a3b8" }}>Invoice Fiat Amount *</label>
                  <div className="input-with-icon" style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px" }}>
                    <span style={{ paddingLeft: "0.75rem", color: "#10b981", fontWeight: 700 }}>$</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      style={{ background: "transparent", border: "none", color: "#ffffff", paddingLeft: "0.25rem", width: "100%" }}
                      placeholder="5000.00" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: "#94a3b8" }}>Payer Currency</label>
                  <select 
                    className="form-input" 
                    style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", width: "100%" }}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Notes & instructions */}
          <div className="card" style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 0 }}>
            <div className="card-title" style={{ color: "#f8fafc" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Notes & Terms
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ color: "#94a3b8" }}>Optional Notes for Client</label>
              <textarea 
                className="form-input" 
                rows={3} 
                style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontFamily: "inherit" }}
                placeholder="Thank you for your business. Terms are net-30 upon receipt."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Side summary */}
        <div>
          <div className="card" style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="card-title" style={{ color: "#f8fafc" }}>Summary</div>
            
            <div className="summary-row" style={{ color: "#94a3b8" }}>
              <span>Billed Amount:</span>
              <span style={{ color: "#ffffff" }}>{amount ? `${parseFloat(amount).toLocaleString()} ${currency}` : `-`}</span>
            </div>
            
            <div className="summary-row" style={{ color: "#94a3b8" }}>
              <span>Payment Gateway:</span>
              <span style={{ color: "#10b981", fontWeight: 600 }}>NOWPayments</span>
            </div>

            <div className="summary-row total" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
              <span className="total-label" style={{ color: "#94a3b8" }}>Total Due</span>
              <span className="total-value" style={{ color: "#10b981", fontSize: "1.50rem" }}>
                {amount ? `${parseFloat(amount).toLocaleString()} ${currency}` : `0.00 USD`}
              </span>
            </div>

            <button 
              className="btn btn-dark" 
              style={{ width: "100%", marginTop: "1.5rem", padding: "0.8rem", background: "#ffffff", color: "#000000", border: "none", borderRadius: "100px", fontWeight: 700 }} 
              onClick={handleSendInvoice} 
              disabled={loading}
            >
              {loading ? "Creating..." : "Generate Invoice Link"}
            </button>
          </div>

          <div className="card" style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.85rem", color: "#f8fafc" }}>Bank-Grade Security</h4>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b", lineHeight: 1.4 }}>
                  All account details are encrypted immediately with industrial AES-256-GCM.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
