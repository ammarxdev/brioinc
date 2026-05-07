"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import "./overview.css";

export default function OverviewPage() {
  const { user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [cards, setCards] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch recent transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(4);

      // Fetch cards
      const { data: cardData } = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", user?.id)
        .limit(2);

      setRecentTransactions(txData || []);
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
        <a href="/dashboard/transactions" style={{ color: '#6b7280', textDecoration: 'none' }}>Transactions</a>
        <a href="/dashboard/cards" style={{ color: '#6b7280', textDecoration: 'none' }}>Cards</a>
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
            <a href="/signup/kyc">Verify ID &gt;</a>
          </div>
        </div>
      </div>

      <div className="secondary-grid">
        <div className="cards-section">
          <div className="section-header">
            <span className="section-title">Your Cards</span>
            <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>...</span>
          </div>
          
          {cards.length === 0 ? (
            <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
              No cards issued.
            </div>
          ) : (
            cards.map(card => (
              <div key={card.id} className="credit-card" style={{ marginBottom: '1rem' }}>
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
                  •••• •••• •••• {card.card_number?.slice(-4)}
                </div>
              </div>
            ))
          )}

          <div className="add-card">
            <div className="add-card-icon">+</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Issue Card</span>
          </div>
        </div>

        <div className="activity-section">
          <div className="section-header">
            <span className="section-title">Recent Activity</span>
            <a href="/dashboard/transactions" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>View All</a>
          </div>

          <div className="activity-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading...</div>
            ) : recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No recent activity.</div>
            ) : (
              recentTransactions.map(tx => (
                <div key={tx.id} className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: tx.amount > 0 ? '#dcfce7' : '#f1f5f9', color: tx.amount > 0 ? '#16a34a' : '#111827' }}>
                    {tx.amount > 0 ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                    )}
                  </div>
                  <div className="activity-details">
                    <div className="activity-name">{tx.description}</div>
                    <div className="activity-time">{new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="activity-amount-col">
                    <div className={`activity-amount ${tx.amount > 0 ? 'amount-positive' : ''}`}>
                      {tx.amount > 0 ? `+$${tx.amount.toLocaleString()}` : `-$${Math.abs(tx.amount).toLocaleString()}`}
                    </div>
                    <div className="activity-status status-completed">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                      {tx.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
