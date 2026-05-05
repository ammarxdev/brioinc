"use client";

import "./admin.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboardPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("status", "pending");
        
      if (error) throw error;
      setPendingUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (user: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: "approved",
          is_verified: true
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      // Send Approval Email
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', email: user.email, name: user.name || 'User' }),
      });

      fetchPendingUsers();
    } catch (err) {
      console.error("Failed to approve user");
    }
  };

  const handleReject = async (user: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!window.confirm("Are you sure you want to reject this user?")) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({
          status: "rejected",
          is_verified: false
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      // Send Rejection Email
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', email: user.email, name: user.name || 'User' }),
      });

      fetchPendingUsers();
    } catch (err) {
      console.error("Failed to reject user");
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
    <div className="page-content">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Real-time metrics and system health monitoring.
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-header btn-header-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Last 30 Days
          </button>
          <button className="btn-header btn-header-dark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="top-widgets-grid">
        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-title">Total Processing Volume</span>
            <div className="widget-icon" style={{ backgroundColor: '#dbeafe', color: '#1e3a8a' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
          </div>
          <div className="metric-value">$124.5M</div>
          <div className="metric-trend trend-up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            +14.2% from last month
          </div>

          <div className="chart-placeholder">
            <div className="chart-bar" style={{ height: '30%' }}></div>
            <div className="chart-bar" style={{ height: '45%' }}></div>
            <div className="chart-bar" style={{ height: '25%' }}></div>
            <div className="chart-bar dark" style={{ height: '60%' }}></div>
            <div className="chart-bar dark" style={{ height: '50%' }}></div>
            <div className="chart-bar dark" style={{ height: '80%' }}></div>
          </div>
        </div>

        <div className="right-widgets">
          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title">Active Users</span>
              <div className="widget-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '2rem' }}>84,291</div>
            <div className="metric-trend trend-up" style={{ fontSize: '0.75rem' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
              2.4% this week
            </div>
          </div>

          <div className="widget-card danger-widget">
            <div className="danger-bg-shape"></div>
            <div className="widget-header" style={{ position: 'relative', zIndex: 10 }}>
              <span className="widget-title">High Risk Alerts</span>
              <div className="widget-icon danger-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '2rem', position: 'relative', zIndex: 10 }}>12</div>
            <div style={{ fontSize: '0.8rem', position: 'relative', zIndex: 10 }}>Requires immediate review</div>
          </div>
        </div>
      </div>

      <div className="bottom-widgets-grid">
        <div className="widget-card">
          <div className="widget-header" style={{ marginBottom: 0 }}>
            <h2 className="section-title">Pending KYC & User Reviews</h2>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>View All</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Risk Score</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
                ) : pendingUsers.length === 0 ? (
                  <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>No pending users</td></tr>
                ) : (
                  pendingUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">{u.name?.substring(0, 2).toUpperCase() || 'U'}</div>
                          <div className="user-info">
                            <span className="user-name">{u.name || 'Unknown'}</span>
                            <span className="user-email">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="status-badge">
                          <div className="status-dot"></div>
                          PENDING
                        </div>
                      </td>
                      <td>
                        <div className="risk-score risk-low">
                          <div className="risk-bar-container">
                            <div className="risk-bar"></div>
                          </div>
                          <span className="risk-label" style={{ color: '#16a34a' }}>Low</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-cell" style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-review" onClick={() => handleApprove(u)} style={{ padding: '0.25rem 0.75rem' }}>Approve</button>
                          <button className="btn-review" onClick={() => handleReject(u)} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="widget-card">
          <div className="feed-header">
            <div className="live-dot"></div>
            Live Monitoring
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', color: '#6b7280' }}>
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </div>

          <div className="feed-list">
            <div className="feed-item">
              <div className="feed-item-header">
                <div className="feed-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                </div>
                <div className="feed-title">
                  Large Transfer Detected
                  <span className="feed-time">Just now</span>
                </div>
              </div>
              <div className="feed-desc">
                Cross-border transfer of $45,000 to new beneficiary.
              </div>
              <div className="feed-action">
                <span className="badge-cleared">Cleared</span>
              </div>
            </div>

            <div className="feed-item alert">
              <div className="feed-item-header">
                <div className="feed-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="feed-title" style={{ color: '#991b1b' }}>
                  Velocity Alert Triggered
                  <span className="feed-time">2m ago</span>
                </div>
              </div>
              <div className="feed-desc">
                User ID #8921 initiated 5 transfers in 10 minutes.
              </div>
              <div className="feed-action">
                <button className="btn-investigate">INVESTIGATE</button>
              </div>
            </div>
            
            <div className="feed-item">
              <div className="feed-item-header" style={{ marginBottom: 0 }}>
                <div className="feed-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
                <div className="feed-title">
                  New API Key
                  <span className="feed-time">15m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
