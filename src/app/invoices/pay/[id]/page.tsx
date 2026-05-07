"use client";

import { useState, useEffect, use } from "react";

interface PayPageProps {
  params: Promise<{ id: string }>;
}

export default function PublicInvoicePayPage({ params }: PayPageProps) {
  // Unwrap Next.js dynamic path parameters
  const { id } = use(params);

  // States
  const [invoice, setInvoice] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [polling, setPolling] = useState(true);

  // Load invoice detail on mount
  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  // Status Poller
  useEffect(() => {
    if (!id || !polling) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/invoices/status?id=${id}`);
        const data = await res.json();
        
        if (data.success) {
          setStatus(data.status);
          
          // Stop polling if completed or rejected
          if (["completed", "rejected", "failed", "expired"].includes(data.status)) {
            setPolling(false);
          }
          // Also update our local invoice object status
          setInvoice((prev: any) => prev ? { ...prev, status: data.status } : null);
        }
      } catch (err) {
        console.warn("Status poll error:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [id, polling]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/invoices?id=${id}`);
      const data = await res.json();

      if (!data?.success || !data.invoice) {
        console.error("Failed to load invoice:", data?.error);
        setLoading(false);
        return;
      }

      setInvoice(data.invoice);
      setVendor(data.vendor);
      setStatus(data.invoice.status);

      if (["completed", "rejected", "failed", "expired"].includes(data.invoice.status)) {
        setPolling(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#050505", color: "#ffffff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem auto" }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading secure gateway...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#050505", color: "#ffffff" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>Invoice Not Found</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.5 }}>
            This link is invalid, expired, or has been removed from the platform archives.
          </p>
        </div>
      </div>
    );
  }

  // Get status pill colors
  const getStatusBadge = () => {
    switch (status) {
      case "pending":
      case "payment_pending":
        return { bg: "rgba(234, 179, 8, 0.08)", border: "rgba(234, 179, 8, 0.25)", color: "#facc15", text: "Pending Payment" };
      case "paid":
      case "processing":
        return { bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.25)", color: "#34d399", text: "Paid (Processing Settlement)" };
      case "completed":
        return { bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.25)", color: "#60a5fa", text: "Settled & Dispatched" };
      default:
        return { bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.25)", color: "#f87171", text: "Rejected / Void" };
    }
  };

  const badge = getStatusBadge();

  return (
    <div style={{ background: "#050505", minHeight: "100vh", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Top Header branding */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "2rem", marginBottom: "3rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Brioinc Corp</h1>
            <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Secure Escrow Gateways</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "8px", height: "8px", backgroundColor: "#10b981", borderRadius: "50%" }}></span>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Secured by SSL & HMAC</span>
          </div>
        </div>

        {/* Layout grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2.5rem", alignItems: "start" }}>
          {/* Left panel: Invoice specifications */}
          <div style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Invoice Number</span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "4px 0 0 0" }}>{invoice.invoice_number}</h2>
              </div>
              <span style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, padding: "0.4rem 0.8rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700 }}>
                {badge.text}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem 0", marginBottom: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Billed From</span>
                <strong style={{ color: "#ffffff", fontSize: "0.9rem" }}>{vendor?.name || "Brioinc Partner"}</strong>
                <span style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>{vendor?.email || ""}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Billed To</span>
                <strong style={{ color: "#ffffff", fontSize: "0.9rem" }}>{invoice.client_name}</strong>
                <span style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>{invoice.client_email}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Billing Summary</span>
              <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1.25rem", marginTop: "0.75rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px", color: "#64748b" }}>
                      <th style={{ textAlign: "left", fontWeight: 500, paddingBottom: "8px" }}>Item Description</th>
                      <th style={{ textAlign: "right", fontWeight: 500, paddingBottom: "8px" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ paddingTop: "12px" }}>
                        <span style={{ color: "#ffffff", fontWeight: 500 }}>{invoice.description}</span>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>Reference order: {invoice.invoice_number}</span>
                      </td>
                      <td style={{ textAlign: "right", color: "#10b981", fontWeight: 700, fontSize: "1rem", paddingTop: "12px" }}>
                        {invoice.amount.toLocaleString()} {invoice.currency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {invoice.notes && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Creator Terms & Notes</span>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5, margin: 0, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px" }}>
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right panel: Payment Processing State */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "2.5rem", textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Amount Due</span>
              <span style={{ fontSize: "2.25rem", fontWeight: 800, color: "#10b981", letterSpacing: "-0.04em", display: "block", marginBottom: "1.5rem" }}>
                {invoice.amount.toLocaleString()} {invoice.currency}
              </span>

              {/* Status dynamic cards */}
              {(status === "pending" || status === "payment_pending") && (
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "2rem", textAlign: "left" }}>
                    Select your preferred cryptocurrency (USDT, BTC, ETH) or standard credit cards to settle this invoice. NowPayments escrow handles dynamic conversion.
                  </p>
                  
                  <a 
                    href={invoice.nowpayment_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: "block", 
                      background: "#ffffff", 
                      color: "#000000", 
                      textDecoration: "none", 
                      padding: "1rem", 
                      borderRadius: "100px", 
                      fontWeight: 700, 
                      fontSize: "0.95rem",
                      boxShadow: "0 0 20px rgba(255,255,255,0.1)",
                      marginBottom: "1.5rem"
                    }}
                  >
                    Proceed to Escrow Checkout
                  </a>

                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.75rem" }}>
                    <div style={{ width: "6px", height: "6px", backgroundColor: "#eab308", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></div>
                    <span>Listening for blockchain confirmations...</span>
                  </div>
                </div>
              )}

              {(status === "paid" || status === "processing") && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-flex", padding: "12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", color: "#34d399", marginBottom: "1rem" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#34d399", margin: "0 0 0.5rem 0" }}>Payment Captured</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, margin: "0 0 1rem 0" }}>
                    Your cryptocurrency transfer is validated by NowPayments. We are actively processing manual wire releases directly to the partner's bank.
                  </p>
                </div>
              )}

              {status === "completed" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-flex", padding: "12px", background: "rgba(96, 165, 250, 0.1)", borderRadius: "50%", color: "#60a5fa", marginBottom: "1rem" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#60a5fa", margin: "0 0 0.5rem 0" }}>Settlement Dispatched</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>
                    This invoice is fully settled and local fiat funds have been transferred directly to the vendor's receiving bank wire account. No further actions needed.
                  </p>
                </div>
              )}

              {["rejected", "failed", "expired"].includes(status) && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "inline-flex", padding: "12px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "50%", color: "#f87171", marginBottom: "1rem" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f87171", margin: "0 0 0.5rem 0" }}>Invoice Void / Expired</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>
                    This payment link has been closed, expired, or rejected. Please contact the issuer for details.
                  </p>
                </div>
              )}
            </div>

            <div style={{ background: "#0c0d0e", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "1.5rem", fontSize: "0.8rem", color: "#64748b" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div style={{ lineHeight: 1.4 }}>
                  <span style={{ display: "block", color: "#94a3b8", fontWeight: 600 }}>Secured Smart Contract Releases</span>
                  All cryptocurrency receipts undergo strict programmatic audits before local fiat rails trigger. Your funds are protected at all stages.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
