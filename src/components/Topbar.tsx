"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isInvoice = pathname.includes('/invoices');
  const isPreview = pathname.includes('/preview');
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const notificationRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {

    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      // Subscribe to new notifications
      const channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchNotifications]);

  const markAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {

    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {

    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <header className="topbar">
      <div className="search-container">
        {isInvoice ? (
          <div className="breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Invoices</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="current" style={{ color: '#0f172a', fontWeight: 600 }}>{isPreview ? 'INV-2023-089' : 'New'}</span>
          </div>
        ) : (
          <>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" className="search-input" placeholder="Search..." />
          </>
        )}
      </div>

      <div className="topbar-actions">
        <div className="notification-wrapper" ref={notificationRef}>
          <div 
            className={`icon-btn ${showNotifications ? 'active' : ''}`} 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifications.some(n => !n.is_read) && <div className="notification-dot"></div>}
          </div>

          {showNotifications && (
            <div className="notification-panel">
              <div className="panel-header">
                <h3>Notifications</h3>
                <span className="mark-read" onClick={markAllAsRead}>Mark all as read</span>
              </div>
              <div className="panel-body">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="item-content">
                        <div className="item-header">
                          <span className="item-title">{n.title}</span>
                          <span className="item-time">{formatTime(n.created_at)}</span>
                        </div>
                        <p className="item-msg">{n.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-notifications">No new notifications</div>
                )}
              </div>
              <div className="panel-footer">
                View All Activity
              </div>
            </div>
          )}
        </div>

        <div className="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="profile-avatar" onClick={toggleTheme}></div>
      </div>

      <style jsx>{`
        .notification-wrapper {
          position: relative;
        }
        .notification-panel {
          position: absolute;
          top: calc(100% + 1rem);
          right: 0;
          width: 320px;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #f3f4f6;
          z-index: 1000;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .panel-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .panel-header h3 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #111827;
        }
        .mark-read {
          font-size: 0.75rem;
          color: #3b82f6;
          cursor: pointer;
          font-weight: 600;
        }
        .panel-body {
          max-height: 400px;
          overflow-y: auto;
        }
        .notification-item {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f9fafb;
          transition: background 0.2s;
          cursor: pointer;
        }
        .notification-item:hover {
          background: #f9fafb;
        }
        .notification-item.unread {
          background: #f0f7ff;
        }
        .notification-item.unread:hover {
          background: #e5f0ff;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .item-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #111827;
        }
        .item-time {
          font-size: 0.7rem;
          color: #94a3b8;
        }
        .item-msg {
          margin: 0;
          font-size: 0.8rem;
          color: #4b5563;
          line-height: 1.4;
        }
        .panel-footer {
          padding: 0.85rem;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          border-top: 1px solid #f3f4f6;
          background: #fafafa;
          cursor: pointer;
        }
        .empty-notifications {
          padding: 2rem;
          text-align: center;
          color: #94a3b8;
          font-size: 0.85rem;
        }
      `}</style>
    </header>
  );
}
