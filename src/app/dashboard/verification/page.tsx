"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export default function VerificationPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Account Status</h1>
      <p className="page-subtitle">
        {user?.status === 'pending' 
          ? "Your account is currently under review by our administration team."
          : user?.status === 'rejected'
          ? "Your account application has been declined. Please contact support for more details."
          : "Please complete the KYC process to unlock full account features."}
      </p>

      {/* Status Banner */}
      <div className={`alert-banner ${user?.status === 'rejected' ? 'rejected' : ''}`} style={{ 
        backgroundColor: user?.status === 'rejected' ? '#fee2e2' : '#f0f9ff',
        borderColor: user?.status === 'rejected' ? '#fecaca' : '#bae6fd'
      }}>
        <div className="alert-content">
          <div className="alert-icon-box" style={{ 
            backgroundColor: user?.status === 'rejected' ? '#ef4444' : '#0ea5e9'
          }}>
            {user?.status === 'rejected' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
          </div>
          <div className="alert-text">
            <h3 style={{ color: user?.status === 'rejected' ? '#991b1b' : '#0369a1' }}>
              {user?.status === 'pending' ? "Approval Pending" : user?.status === 'rejected' ? "Account Rejected" : "In Progress"}
            </h3>
            <p style={{ color: user?.status === 'rejected' ? '#b91c1c' : '#075985' }}>
              {user?.status === 'pending' 
                ? "Our security team is reviewing your details. This usually takes 24-48 hours." 
                : user?.status === 'rejected'
                ? "Your application did not meet our current requirements."
                : "Your documents are currently being reviewed."}
            </p>
          </div>
        </div>
        <div className="badge badge-outline" style={{ 
          borderColor: user?.status === 'rejected' ? '#ef4444' : '#0ea5e9',
          color: user?.status === 'rejected' ? '#ef4444' : '#0ea5e9'
        }}>
          <div className="badge-dot" style={{ backgroundColor: user?.status === 'rejected' ? '#ef4444' : '#0ea5e9' }}></div>
          {user?.status?.toUpperCase() || 'UNKNOWN'}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="grid-left">
          {/* Completion Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Profile Progress</span>
            </div>
            
            <div className="progress-meta">
              <span>{user?.status === 'approved' ? '4 of 4' : '3 of 4'} steps completed</span>
              <h2>{user?.status === 'approved' ? '100%' : '75%'}</h2>
            </div>
            
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: user?.status === 'approved' ? '100%' : '75%' }}></div>
            </div>

            <div className="steps-container">
              <div className="step-item">
                <div className="step-icon completed">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="step-label">Details</span>
              </div>
              <div className="step-item">
                <div className="step-icon completed">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="step-label">ID</span>
              </div>
              <div className="step-item">
                <div className="step-icon completed">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="step-label">Face</span>
              </div>
              <div className="step-item">
                <div className={`step-icon ${user?.status === 'approved' ? 'completed' : 'pending'}`}>
                  {user?.status === 'approved' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : "4"}
                </div>
                <span className="step-label" style={{ color: user?.status === 'approved' ? 'inherit' : '#9ca3af' }}>Admin Approval</span>
              </div>
            </div>
          </div>

          {/* Government ID */}
          <div className="card id-section">
            <div className="card-header">
              <span className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Government ID (CNIC)
              </span>
              <div className="badge badge-success">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Verified
              </div>
            </div>
            <p>Clear photos of original document</p>

            <div className="id-grid">
              <div className="id-placeholder">
                <div className="id-placeholder-content">
                  <div className="id-camera-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <span>Front Side</span>
                  <small>Uploaded file.jpg</small>
                </div>
              </div>
              <div className="id-placeholder back">
                <div className="id-placeholder-content">
                  <div className="id-camera-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <span>Back Side</span>
                  <small>Uploaded file_back.jpg</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid-right">
          {/* Liveness Check */}
          <div className="card card-dark liveness-content">
            <div className="card-header" style={{ width: '100%', marginBottom: '2rem' }}>
              <span className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3" />
                  <circle cx="12" cy="10" r="3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Liveness Check
              </span>
              <div className="badge badge-success-dark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Done
              </div>
            </div>

            <div className="liveness-avatar-container">
              <Image 
                src="/liveness-avatar.png" 
                alt="Liveness check avatar" 
                width={160} 
                height={160}
              />
            </div>
            
            <p>Face matched with ID document successfully.</p>
          </div>

          {/* Proof of Address */}
          <div className="card id-section" style={{ padding: '2rem 1.5rem' }}>
            <div className="alert-badge" style={{ backgroundColor: user?.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
              {user?.status === 'rejected' ? '!' : '!'}
            </div>
            <div className="card-header" style={{ marginBottom: '0.5rem' }}>
              <span className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Support Contact
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              {user?.status === 'rejected' 
                ? "Your application was rejected. Please contact support for clarification." 
                : "Need help? Our support team is available 24/7."}
            </p>

            <div className="drag-drop-area" style={{ borderStyle: 'solid', backgroundColor: '#f8fafc' }}>
              <p style={{ fontWeight: 600 }}>support@brioinc.net</p>
              <small>Click to copy email</small>
            </div>

            <button className="btn-upload" style={{ backgroundColor: user?.status === 'rejected' ? '#dc2626' : '#0f172a' }}>
              {user?.status === 'rejected' ? 'Appeal Rejection' : 'Contact Support'}
            </button>
          </div>
        </div>
      </div>

      <footer className="page-footer">
        <div className="footer-badge-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          End-to-end encrypted connection
        </div>
        
        <div className="footer-badges">
          <div className="footer-badge-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            ISO 27001
          </div>
          <div className="footer-badge-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Bank-Grade Security
          </div>
        </div>
      </footer>
    </div>
  );
}
