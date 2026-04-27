import "./overview.css";

export default function OverviewPage() {
  return (
    <div className="page-content">
      {/* Top Navbar Simulation for Tabs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <span style={{ fontWeight: 600, color: '#111827', borderBottom: '2px solid #111827', paddingBottom: '1rem', marginBottom: '-1rem' }}>Overview</span>
        <span style={{ color: '#6b7280' }}>Transactions</span>
        <span style={{ color: '#6b7280' }}>Cards</span>
      </div>

      <div className="overview-grid">
        <div className="balance-card">
          <div className="balance-header">Total Balance</div>
          <div className="balance-sub">Across all linked accounts</div>
          
          <div className="balance-amount-row">
            <div className="balance-amount">$124,592.00</div>
            <div className="balance-trend">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              +2.4%
            </div>
          </div>

          <div className="balance-actions">
            <button className="btn-action btn-action-dark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
              Transfer
            </button>
            <button className="btn-action btn-action-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
              Withdraw
            </button>
          </div>
        </div>

        <div className="limits-card">
          <div className="limits-header">Monthly Limits</div>
          
          <div className="limit-row">
            <div className="limit-labels">
              <span>Transfers</span>
              <span>$45k / $50k</span>
            </div>
            <div className="limit-bar-bg">
              <div className="limit-bar-fill" style={{ width: '90%' }}></div>
            </div>
          </div>

          <div className="limit-row">
            <div className="limit-labels">
              <span>Withdrawals</span>
              <span>$2k / $10k</span>
            </div>
            <div className="limit-bar-bg">
              <div className="limit-bar-fill" style={{ width: '20%' }}></div>
            </div>
          </div>

          <div className="limits-footer">
            <span style={{ color: '#94a3b8' }}>Need higher limits?</span>
            <a href="/dashboard/verification">Verify ID &gt;</a>
          </div>
        </div>
      </div>

      <div className="secondary-grid">
        <div className="cards-section">
          <div className="section-header">
            <span className="section-title">Your Cards</span>
            <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>...</span>
          </div>
          
          <div className="credit-card">
            <div className="card-top">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
              </svg>
              <div className="card-chip"></div>
            </div>
            <div className="card-number">
              •••• •••• •••• 4291
            </div>
          </div>

          <div className="add-card">
            <div className="add-card-icon">+</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Add ATM Card</span>
          </div>
        </div>

        <div className="activity-section">
          <div className="section-header">
            <span className="section-title">Recent Activity</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>View All</span>
          </div>

          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <div className="activity-details">
                <div className="activity-name">Apple Store</div>
                <div className="activity-time">Today, 2:45 PM</div>
              </div>
              <div className="activity-amount-col">
                <div className="activity-amount">-$1,299.00</div>
                <div className="activity-status status-processing">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#9ca3af' }}></div>
                  Processing
                </div>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
              <div className="activity-details">
                <div className="activity-name">Salary Deposit</div>
                <div className="activity-time">Yesterday, 9:00 AM</div>
              </div>
              <div className="activity-amount-col">
                <div className="activity-amount amount-positive">+$8,450.00</div>
                <div className="activity-status status-completed">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                  Completed
                </div>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                  <polyline points="17 2 12 7 7 2" />
                </svg>
              </div>
              <div className="activity-details">
                <div className="activity-name">Netflix Premium</div>
                <div className="activity-time">Oct 24, 2023</div>
              </div>
              <div className="activity-amount-col">
                <div className="activity-amount">-$22.99</div>
                <div className="activity-status status-completed">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                  Completed
                </div>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="activity-details">
                <div className="activity-name">Wire Transfer (Intl)</div>
                <div className="activity-time">Oct 22, 2023</div>
              </div>
              <div className="activity-amount-col">
                <div className="activity-amount">-$450.00</div>
                <div className="activity-status status-failed">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#dc2626' }}></div>
                  Failed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
