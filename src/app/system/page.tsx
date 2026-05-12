"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import "./system.css";

export default function SystemDashboardPage() {
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const start = Date.now();
      try {
        // Try a simple health check query
        const { error } = await supabase.from("users").select("id").limit(1);
        
        const end = Date.now();
        setLatency(end - start);

        if (error) {

          setDbStatus("error");
        } else {
          setDbStatus("connected");
        }
      } catch (err) {

        setDbStatus("error");
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="system-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">Total Active Users</div>
          <div className="stat-value">142,500</div>
          <div className="stat-trend">↗ +12%</div>
          <svg className="stat-icon-bg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        </div>

        <div className="stat-card">
          <div className="stat-header">Total Transaction Volume (24h)</div>
          <div className="stat-value">$84.2M</div>
          <div className="stat-trend">↗ +4.3%</div>
          <svg className="stat-icon-bg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 4H3c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h18c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H3V6h18v12zm-9-9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
          </svg>
        </div>

        <div className={`stat-card ${dbStatus === 'error' ? 'stat-card-danger' : 'stat-card-dark'}`}>
          <div className="stat-dark-header">
            <span>Database Status</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ width: 30, height: 12, backgroundColor: dbStatus === 'connected' ? '#059669' : '#334155', borderRadius: 2 }}></div>
              <div style={{ width: 30, height: 12, backgroundColor: dbStatus === 'error' ? '#dc2626' : '#334155', borderRadius: 2 }}></div>
            </div>
          </div>
          <div className="system-status">
            <div className={`status-dot-large ${dbStatus}`}></div>
            {dbStatus === "checking" ? "Checking..." : dbStatus === "connected" ? "Operational" : "Disconnected"}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
            {dbStatus === "connected" ? `Supabase connection verified. Latency: ${latency}ms` : dbStatus === "error" ? "Failed to connect to Supabase. Check .env keys." : "Establishing secure link..."}
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="queue-card">
          <div className="queue-header">
            <div>
              <div className="queue-title">KYC Verification Queue</div>
              <div className="queue-sub">Action required on flagged accounts.</div>
            </div>
            <button className="btn-view-all">View All</button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ paddingBottom: '1rem' }}>User ID / Name</th>
                <th style={{ paddingBottom: '1rem' }}>Status</th>
                <th style={{ paddingBottom: '1rem' }}>Risk Score</th>
                <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, backgroundColor: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>JL</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Jonathan Lee</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>USR-8821-A</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: 6, height: 6, backgroundColor: '#b91c1c', borderRadius: '50%' }}></span>
                    Flagged
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 50, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2 }}>
                      <div style={{ width: '85%', height: '100%', backgroundColor: '#dc2626', borderRadius: 2 }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}>85</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ border: 'none', backgroundColor: 'transparent', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Review</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="logs-card">
          <div className="logs-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            System Logs
          </div>

          <div className="log-item">
            <div className="log-icon error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="log-content">
              <h4>Database Check</h4>
              <p>{dbStatus === 'connected' ? 'Connection to Supabase project ejbjtmxalzenqwlnubfa established.' : dbStatus === 'error' ? 'Connection failed. Verify Supabase project status.' : 'Verifying link...'}</p>
              <span className="log-time">Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
