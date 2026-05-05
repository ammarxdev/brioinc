"use client";
import "../invoices.css";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

export default function NewInvoicePage() {
  const [clientEmail, setClientEmail] = useState("");
  const [description, setDescription] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();

  const handleSendInvoice = async () => {
    if (!clientEmail || !amount) {
      setError("Please fill out required fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      await axios.post('/api/invoices', {
        userId: user?.id,
        clientEmail,
        description: description || "Enterprise Software License",
        amount: parseFloat(amount),
        invoiceNumber: "INV-" + Math.floor(Math.random() * 10000)
      });
      
      setSuccess(true);
      // Reset form or redirect
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(err);
      setError(err.response?.data?.error || err.message || "Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-content">
      <div className="invoice-header">
        <div>
          <h1 className="invoice-header-title">New Invoice</h1>
          <div className="invoice-header-sub">Create and send a new invoice to your customer.</div>
        </div>
        <div className="invoice-actions">
          <button className="btn btn-outline">Save Draft</button>
          <a href="/invoices/preview" className="btn btn-dark" style={{ textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send Invoice
          </a>
        </div>
      </div>

      <div className="new-invoice-grid">
        <div>
          <div className="card">
            <div className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Customer Details
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input type="text" className="form-input" placeholder="e.g. Acme Corp" />
              </div>
              <div className="form-group">
                <label className="form-label">Client Email</label>
                <input type="email" className="form-input" placeholder="billing@acmecorp.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Invoice Details
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Invoice Number</label>
                <input type="text" className="form-input" defaultValue="INV-2024-001" />
              </div>
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <div className="input-with-icon">
                  <input type="text" className="form-input" placeholder="mm/dd/yyyy" />
                  <svg className="input-icon-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                  </svg>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <div className="input-with-icon">
                  <input type="text" className="form-input" placeholder="mm/dd/yyyy" />
                  <svg className="input-icon-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Line Items
            </div>
            
            <table className="items-table" style={{ marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Description</th>
                  <th style={{ width: '15%' }}>Quantity</th>
                  <th style={{ width: '15%' }}>Rate</th>
                  <th style={{ width: '20%' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ paddingRight: '1rem' }}>
                    <input type="text" className="item-desc-input" defaultValue="Enterprise Software License - Annual" />
                    <input type="text" className="item-desc-sub" placeholder="Additional details (optional)" />
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '1rem', paddingRight: '1rem' }}>
                    <input type="text" className="form-input" style={{ width: '100%' }} defaultValue="1" />
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '1rem', paddingRight: '1rem' }}>
                    <div className="input-with-icon" style={{ flexDirection: 'row-reverse' }}>
                      <input type="number" className="form-input" style={{ width: '100%', paddingLeft: '1.5rem' }} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="12500" />
                      <span style={{ position: 'absolute', left: '0.5rem', color: '#64748b' }}>$</span>
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 500 }}>$12,500.00</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <button className="btn-add-item">
              + Add Another Item
            </button>
          </div>

          <div className="card">
            <div className="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Notes & Terms
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{ flex: '0 0 200px' }}>
                <label className="form-label" style={{ marginTop: '0.5rem' }}>Message to Customer</label>
              </div>
              <div className="form-group">
                <textarea className="form-input" rows={3} defaultValue="Thank you for your business."></textarea>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{ flex: '0 0 200px' }}>
                <label className="form-label" style={{ marginTop: '0.5rem' }}>Terms and Conditions</label>
              </div>
              <div className="form-group">
                <textarea className="form-input" rows={3} defaultValue="Payment due within 30 days."></textarea>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-title">Invoice Summary</div>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>$12,500.00</span>
            </div>
            <div className="summary-row">
              <span>Tax (0%) <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', marginLeft: '0.5rem', cursor: 'pointer' }}>Add</span></span>
              <span>$0.00</span>
            </div>
            <div className="summary-row">
              <span>Discount <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', marginLeft: '0.5rem', cursor: 'pointer' }}>Add</span></span>
              <span>$0.00</span>
            </div>
            
            <div className="summary-row total">
              <span className="total-label">Total<br/>Due</span>
              <span className="total-value">$12,500.00</span>
            </div>

            <button className="btn btn-dark" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }} onClick={handleSendInvoice} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {loading ? "Sending..." : "Send Invoice"}
            </button>
          </div>

          <div className="card">
            <div className="card-title">Settings</div>
            
            <div className="setting-row">
              <div className="setting-text">
                <h4>Auto-reminders</h4>
                <p>Send automatic emails for overdue invoices.</p>
              </div>
              <div className="toggle-switch">
                <div className="toggle-knob"></div>
              </div>
            </div>
            
            <div className="setting-row">
              <div className="setting-text">
                <h4>Accept Online Payments</h4>
                <p>Credit card, ACH, Bank Transfer.</p>
              </div>
              <div className="toggle-switch">
                <div className="toggle-knob"></div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Currency</label>
              <div className="input-with-icon">
                <select className="form-input" style={{ width: '100%', appearance: 'none' }}>
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>GBP - British Pound</option>
                </select>
                <svg className="input-icon-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Customization</div>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem auto', display: 'block' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.25rem' }}>Add Company Logo</div>
              <div style={{ fontSize: '0.75rem' }}>Drag & drop or click to upload</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
