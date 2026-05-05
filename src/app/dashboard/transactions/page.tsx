"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, filter, fetchTransactions]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (filter === "incoming") {
        query = query.gt("amount", 0);
      } else if (filter === "outgoing") {
        query = query.lt("amount", 0);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Detailed history of your institutional capital movement.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-header btn-header-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Statement
          </button>
          <button className="btn-header btn-header-dark">
            Download CSV
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '2rem' }}>
          <button 
            onClick={() => setFilter("all")} 
            style={{ background: 'none', border: 'none', color: filter === "all" ? '#111827' : '#6b7280', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', paddingBottom: '0.25rem', borderBottom: filter === "all" ? '2px solid #111827' : '2px solid transparent' }}
          >
            All Activity
          </button>
          <button 
            onClick={() => setFilter("incoming")} 
            style={{ background: 'none', border: 'none', color: filter === "incoming" ? '#111827' : '#6b7280', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', paddingBottom: '0.25rem', borderBottom: filter === "incoming" ? '2px solid #111827' : '2px solid transparent' }}
          >
            Incoming
          </button>
          <button 
            onClick={() => setFilter("outgoing")} 
            style={{ background: 'none', border: 'none', color: filter === "outgoing" ? '#111827' : '#6b7280', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', paddingBottom: '0.25rem', borderBottom: filter === "outgoing" ? '2px solid #111827' : '2px solid transparent' }}
          >
            Outgoing
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>ID</th>
                <th>Method</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading transactions...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No transactions found.</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: '#6b7280', fontSize: '0.875rem' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{tx.description}</div>
                    </td>
                    <td style={{ color: '#6b7280', fontSize: '0.75rem', fontFamily: 'monospace' }}>{tx.id.substring(0, 8)}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{tx.method}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: tx.amount > 0 ? '#16a34a' : '#111827' }}>
                      {tx.amount > 0 ? `+ $${tx.amount.toLocaleString()}` : `- $${Math.abs(tx.amount).toLocaleString()}`}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={`status-badge ${tx.status === 'pending' ? 'status-pending' : ''}`} style={{ display: 'inline-flex' }}>
                        <div className="status-dot"></div>
                        {tx.status.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
