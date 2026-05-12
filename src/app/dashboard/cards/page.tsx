"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function CardsPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Corporate Cards</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Issue and manage instant virtual and physical cards for your team.
          </p>
        </div>
        
        <button className="btn-header btn-header-dark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Issue New Card
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {loading ? (
              <div className="card" style={{ flex: 1, height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading cards...</div>
            ) : cards.length === 0 ? (
              <div className="card" style={{ flex: 1, padding: '1.5rem', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No cards issued yet.</p>
                </div>
              </div>
            ) : (
              cards.map((card) => (
                <div key={card.id} className="card" style={{ flex: '1 1 300px', minWidth: '300px', padding: '1.5rem', background: card.type === 'virtual' ? 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', position: 'relative', overflow: 'hidden', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>Brioinc {card.type.charAt(0).toUpperCase() + card.type.slice(1)}</span>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  
                  <div style={{ fontSize: '1.25rem', letterSpacing: '0.15em', fontWeight: 500 }}>
                    ••••  ••••  ••••  {card.card_number?.slice(-4) || 'XXXX'}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.25rem' }}>Card Holder</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{card.card_holder?.toUpperCase() || 'VALUED CUSTOMER'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.25rem' }}>Expires</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{card.expiry_date || 'MM/YY'}</div>
                    </div>
                  </div>
                  
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>
              ))
            )}

            <div className="card" style={{ flex: '1 1 300px', minWidth: '300px', padding: '1.5rem', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', cursor: 'pointer' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Add Virtual Card</span>
              </div>
            </div>
          </div>

          <h2 className="section-title">Recent Card Activity</h2>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>AWS Cloud Services</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Subscription</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#6b7280' }}>Today, 2:45 PM</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>-$842.00</td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>Uber for Business</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Travel</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#6b7280' }}>Yesterday</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>-$24.50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Card Controls</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Card Status</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Temporarily freeze your card</div>
                </div>
                <div style={{ width: '40px', height: '20px', backgroundColor: '#10b981', borderRadius: '10px', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: '2px', top: '2px', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>International Payments</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Enable cross-border usage</div>
                </div>
                <div style={{ width: '40px', height: '20px', backgroundColor: '#10b981', borderRadius: '10px', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: '2px', top: '2px', width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%' }}></div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '1rem' }}>Monthly Spending Limit</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700 }}>$12,400</span>
                  <span style={{ color: '#6b7280' }}>of $25,000</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '48%', backgroundColor: '#0f172a' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
