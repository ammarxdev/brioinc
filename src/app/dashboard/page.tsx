"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import "./overview.css";

export default function OverviewPage() {
  const { user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [cards, setCards] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch user profile for balance
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // Fetch recent transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);

      // Fetch recent invoices
      const { data: invData } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(4);

      // Fetch cards
      const { data: cardData } = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", user.id)
        .limit(2);

      setProfile(profileData);
      setRecentTransactions(txData || []);
      setRecentInvoices(invData || []);
      setCards(cardData || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);


  return (
    <div className="page-content">
      {/* Top Navbar Simulation for Tabs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <span style={{ fontWeight: 600, color: '#111827', borderBottom: '2px solid #111827', paddingBottom: '1rem', marginBottom: '-1rem' }}>Overview</span>
        <a href="/dashboard/transactions" style={{ color: '#6b7280', textDecoration: 'none' }}>Payments</a>

      </div>

      <div className="overview-grid">
        <div className="balance-card">
          <div className="balance-header">Total Balance</div>
          <div className="balance-sub">Across all linked accounts</div>
          
          <div className="balance-amount-row">
            <div className="balance-amount">
              ${loading ? "..." : (profile?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")}
            </div>
            <div className="balance-trend">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              +0.0%
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
          <div className="limits-header">Account Status</div>
          
          <div className="limit-row">
            <div className="limit-labels">
              <span>Verification Status</span>
              <span style={{ color: profile?.status === 'approved' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                {profile?.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <div className="limit-bar-bg">
              <div className="limit-bar-fill" style={{ width: profile?.status === 'approved' ? '100%' : '50%', backgroundColor: profile?.status === 'approved' ? '#10b981' : '#f59e0b' }}></div>
            </div>
          </div>

          <div className="limit-row">
            <div className="limit-labels">
              <span>Settlement Eligibility</span>
              <span>{profile?.is_verified ? 'Active' : 'Awaiting KYC'}</span>
            </div>
            <div className="limit-bar-bg">
              <div className="limit-bar-fill" style={{ width: profile?.is_verified ? '100%' : '10%' }}></div>
            </div>
          </div>

          <div className="limits-footer">
            <span style={{ color: '#94a3b8' }}>
              {profile?.status === 'approved' ? 'All features unlocked.' : 'Complete KYC to unlock all features.'}
            </span>
            {profile?.status !== 'approved' && <a href="/signup/kyc">Verify ID &gt;</a>}
          </div>
        </div>
      </div>

      <div className="secondary-grid">


        <div className="activity-section">
          <div className="section-header">
            <span className="section-title">Recent Activity</span>
            <a href="/dashboard/transactions" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>View All</a>
          </div>

          <div className="activity-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading...</div>
            ) : [...recentTransactions, ...recentInvoices].length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No recent activity.</div>
            ) : (
              [...recentTransactions, ...recentInvoices]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map(item => {
                  const isInvoice = !!item.invoice_number;
                  const amount = Number(item.amount);
                  
                  return (
                    <div key={item.id} className="activity-item">
                      <div className="activity-icon" style={{ 
                        backgroundColor: isInvoice ? 'rgba(255, 191, 0, 0.1)' : (amount > 0 ? '#dcfce7' : '#f1f5f9'), 
                        color: isInvoice ? '#b45309' : (amount > 0 ? '#16a34a' : '#111827') 
                      }}>
                        {isInvoice ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        ) : amount > 0 ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                        )}
                      </div>
                      <div className="activity-details">
                        <div className="activity-name">{isInvoice ? `Invoice: ${item.invoice_number}` : item.description}</div>
                        <div className="activity-time">
                          {new Date(item.created_at).toLocaleDateString()}
                          {isInvoice && item.bank_name && (
                             <span style={{ marginLeft: '4px', opacity: 0.6 }}> • {item.bank_name} ({item.bank_country})</span>
                          )}
                        </div>
                      </div>
                      <div className="activity-amount-col">
                        <div className={`activity-amount ${!isInvoice && amount > 0 ? 'amount-positive' : ''}`}>
                          {isInvoice ? '' : (amount > 0 ? '+' : '-')}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`activity-status status-${item.status === 'completed' || item.status === 'approved' ? 'completed' : 'pending'}`}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: item.status === 'completed' || item.status === 'approved' ? '#16a34a' : '#f59e0b' }}></div>
                          {item.status?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
