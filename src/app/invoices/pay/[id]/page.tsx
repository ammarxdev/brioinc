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

  // Payment Method Selection States
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" or "crypto"
  const [selectedCoin, setSelectedCoin] = useState("usdt");
  const [cryptoCreating, setCryptoCreating] = useState(false);
  const [cryptoError, setCryptoError] = useState("");

  const getCoinDetails = () => {
    switch (selectedCoin) {
      case "usdt":
        return { name: "Tether USD", ticker: "USDT", network: "TRON (TRC-20)", payCurrency: "usdttrc20" };
      case "btc":
        return { name: "Bitcoin", ticker: "BTC", network: "Bitcoin Network", payCurrency: "btc" };
      case "eth":
        return { name: "Ethereum", ticker: "ETH", network: "Ethereum Network", payCurrency: "eth" };
      default:
        return { name: "Tether USD", ticker: "USDT", network: "TRON (TRC-20)", payCurrency: "usdttrc20" };
    }
  };

  const coinDetails = getCoinDetails();

  const handleCreateCryptoPayment = async () => {
    if (!id) return;
    setCryptoError("");
    setCryptoCreating(true);
    try {
      const res = await fetch("/api/public/invoices/nowpayments-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: id, payCurrency: coinDetails.payCurrency }),
      });

      const data = await res.json();
      if (!data?.success) {
        setCryptoError(data?.error || "Failed to create crypto payment.");
        return;
      }

      setInvoice((prev: any) =>
        prev
          ? {
              ...prev,
              nowpayment_pay_address: data.payAddress,
              nowpayment_pay_currency: data.payCurrency,
              crypto_amount: data.payAmount,
            }
          : prev
      );
    } catch (err: any) {

      setCryptoError(err?.message || "Failed to create crypto payment.");
    } finally {
      setCryptoCreating(false);
    }
  };

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
                  {/* Tab Selector */}
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "100px", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <button 
                      onClick={() => setPaymentMethod("card")}
                      style={{ 
                        flex: 1, 
                        background: paymentMethod === "card" ? "#ffffff" : "transparent", 
                        color: paymentMethod === "card" ? "#000000" : "#94a3b8", 
                        border: "none", 
                        padding: "0.6rem", 
                        borderRadius: "100px", 
                        fontSize: "0.85rem", 
                        fontWeight: 700, 
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      ATM / Debit Card
                    </button>
                    <button 
                      onClick={() => setPaymentMethod("crypto")}
                      style={{ 
                        flex: 1, 
                        background: paymentMethod === "crypto" ? "#ffffff" : "transparent", 
                        color: paymentMethod === "crypto" ? "#000000" : "#94a3b8", 
                        border: "none", 
                        padding: "0.6rem", 
                        borderRadius: "100px", 
                        fontSize: "0.85rem", 
                        fontWeight: 700, 
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Crypto QR Code
                    </button>
                  </div>

                  {paymentMethod === "card" ? (
                    <div style={{ textAlign: "left" }}>
                      <div style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "16px",
                        padding: "1.25rem",
                        marginBottom: "1rem",
                      }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#ffffff", marginBottom: "0.5rem" }}>
                          Pay with ATM / Debit Card (Fiat via NOWPayments)
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5 }}>
                          You will be redirected to NOWPayments' secure checkout to enter your card details. NOWPayments will process the fiat payment and convert it to crypto automatically.
                        </div>
                      </div>

                      <a 
                        href={invoice.nowpayment_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: "block", 
                          width: "100%",
                          background: "#ffffff", 
                          color: "#000000", 
                          border: "none",
                          padding: "0.85rem", 
                          borderRadius: "100px", 
                          fontWeight: 800, 
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          boxShadow: "0 0 20px rgba(255,255,255,0.1)",
                          textAlign: "center",
                          textDecoration: "none",
                        }}
                      >
                        Continue to NOWPayments Card Checkout
                      </a>
                    </div>
                  ) : (
                    /* Crypto & QR Option with official coin selector */
                    <div>
                      {/* Coin Buttons */}
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        {["usdt", "btc", "eth"].map((coin) => (
                          <button
                            key={coin}
                            onClick={() => setSelectedCoin(coin)}
                            style={{
                              flex: 1,
                              background: selectedCoin === coin ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.02)",
                              border: selectedCoin === coin ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.05)",
                              color: selectedCoin === coin ? "#34d399" : "#94a3b8",
                              borderRadius: "10px",
                              padding: "0.5rem",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px"
                            }}
                          >
                            <span style={{ width: "6px", height: "6px", backgroundColor: selectedCoin === coin ? "#10b981" : "#64748b", borderRadius: "50%" }}></span>
                            {coin}
                          </button>
                        ))}
                      </div>

                      {cryptoError && (
                        <div style={{ marginBottom: "1rem", color: "#f87171", fontSize: "0.8rem", fontWeight: 600 }}>
                          {cryptoError}
                        </div>
                      )}

                      {!invoice.nowpayment_pay_address && (
                        <button
                          onClick={handleCreateCryptoPayment}
                          disabled={cryptoCreating}
                          style={{ 
                            display: "block", 
                            width: "100%",
                            background: "#ffffff", 
                            color: "#000000", 
                            border: "none",
                            padding: "0.85rem", 
                            borderRadius: "100px", 
                            fontWeight: 800, 
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            boxShadow: "0 0 20px rgba(255,255,255,0.1)",
                            marginBottom: "1rem"
                          }}
                        >
                          {cryptoCreating ? "Generating Deposit Address..." : `Generate ${coinDetails.ticker} Deposit Address`}
                        </button>
                      )}

                      {invoice.nowpayment_pay_address && (
                        <>
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                            <div style={{ background: "#ffffff", padding: "10px", borderRadius: "16px", display: "inline-block", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&bgcolor=ffffff&color=000000&data=${encodeURIComponent(String(invoice.nowpayment_pay_address))}`}
                                alt="Payment QR Code" 
                                style={{ width: "160px", height: "160px", display: "block" }}
                              />
                            </div>
                          </div>

                          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Send Amount:</span>
                              <strong style={{ color: "#ffffff", fontSize: "0.85rem" }}>
                                {invoice.crypto_amount} {String(invoice.nowpayment_pay_currency || '').toUpperCase()}
                              </strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Network:</span>
                              <span style={{ color: "#10b981", fontSize: "0.75rem", fontWeight: 700 }}>{coinDetails.network}</span>
                            </div>
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                              <span style={{ color: "#64748b", fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>Deposit Wallet Address:</span>
                              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <span style={{ color: "#94a3b8", fontSize: "0.7rem", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                  {invoice.nowpayment_pay_address}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(String(invoice.nowpayment_pay_address));
                                    alert("Deposit wallet address copied!");
                                  }}
                                  style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#ffffff", padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer" }}
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <a 
                        href={invoice.nowpayment_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: "block", 
                          color: "#64748b", 
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textDecoration: "underline",
                          marginBottom: "1.5rem"
                        }}
                      >
                        Open Official Escrow Page
                      </a>

                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", color: "#64748b", fontSize: "0.75rem" }}>
                        <div style={{ width: "6px", height: "6px", backgroundColor: "#eab308", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></div>
                        <span>Listening for blockchain confirmations...</span>
                      </div>
                    </div>
                  )}
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
