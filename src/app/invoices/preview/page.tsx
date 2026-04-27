import "../invoices.css";

export default function InvoicePreviewPage() {
  return (
    <div className="invoice-content">
      <div className="invoice-header">
        <div>
          <h1 className="invoice-header-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Invoice Preview
            <span className="status-badge-gray">Pending Payment</span>
          </h1>
        </div>
        <div className="invoice-actions">
          <button className="btn btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
          <button className="btn btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Share Link
          </button>
          <button className="btn btn-dark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send Reminder
          </button>
        </div>
      </div>

      <div className="invoice-paper">
        <div className="paper-header">
          <div className="paper-logo">
            <div className="paper-logo-icon">B</div>
            <div>
              <div className="company-title">Brioinc Finance Inc.</div>
              <div className="company-sub">Technology Solutions</div>
            </div>
          </div>
          <div className="invoice-title-large">INVOICE</div>
        </div>

        <div className="paper-details">
          <div className="address-block">
            1200 Innovation Drive, Suite 400<br />
            San Francisco, CA 94103<br />
            United States<br />
            <br />
            VAT: US123456789
          </div>
          <div className="meta-grid">
            <span className="meta-label">INVOICE NUMBER</span>
            <span className="meta-value">INV-2023-089</span>
            <span className="meta-label">DATE OF ISSUE</span>
            <span className="meta-value">Oct 12, 2023</span>
            <span className="meta-label">DUE DATE</span>
            <span className="meta-value">Nov 11, 2023</span>
          </div>
        </div>

        <div className="billed-to">
          <h3>BILLED TO</h3>
          <div className="address-block">
            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>Acme Corporation</span><br />
            Attn: Jane Doe, Accounts Payable<br />
            456 Corporate Blvd<br />
            New York, NY 10001<br />
            billing@acmecorp.com
          </div>
        </div>

        <table className="paper-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>DESCRIPTION</th>
              <th style={{ width: '15%' }}>QTY</th>
              <th style={{ width: '15%' }}>RATE</th>
              <th style={{ width: '20%' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="item-name">Enterprise Software License</div>
                <div className="item-desc">Annual subscription (Nov 2023 - Oct 2024)</div>
              </td>
              <td>1</td>
              <td>$12,500.00</td>
              <td style={{ fontWeight: 600, color: '#0f172a' }}>$12,500.00</td>
            </tr>
            <tr>
              <td>
                <div className="item-name">Implementation Services</div>
                <div className="item-desc">System integration and data migration</div>
              </td>
              <td>40 hrs</td>
              <td>$150.00</td>
              <td style={{ fontWeight: 600, color: '#0f172a' }}>$6,000.00</td>
            </tr>
            <tr>
              <td>
                <div className="item-name">Dedicated Support Tier</div>
                <div className="item-desc">Premium SLA package Q4</div>
              </td>
              <td>1</td>
              <td>$2,000.00</td>
              <td style={{ fontWeight: 600, color: '#0f172a' }}>$2,000.00</td>
            </tr>
          </tbody>
        </table>

        <div className="paper-summary">
          <div className="paper-summary-row">
            <span>Subtotal</span>
            <span>$20,500.00</span>
          </div>
          <div className="paper-summary-row">
            <span>Tax (8.5%)</span>
            <span>$1,742.50</span>
          </div>
          <div className="paper-summary-row">
            <span>Discount</span>
            <span>-$0.00</span>
          </div>
          <div className="paper-total">
            <span>Total Due</span>
            <span>$22,242.50</span>
          </div>
        </div>

        <div className="payment-instructions">
          <div className="instructions-text">
            <h4>PAYMENT TERMS & INSTRUCTIONS</h4>
            Payment is due within 30 days of the invoice date. Please include the invoice number (INV-2023-089) on your check or bank transfer. Late payments may be subject to a 1.5% monthly fee.
            <br /><br />
            <strong>Bank Details:</strong> Chase Bank, Routing: 122000248, Acct: 9876543210
          </div>
          <div className="secure-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Secure Institutional Processing
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
        Powered by Brioinc Finance Engine
      </div>
    </div>
  );
}
