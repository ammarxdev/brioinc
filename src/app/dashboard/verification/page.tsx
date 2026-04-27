import Image from "next/image";

export default function VerificationPage() {
  return (
    <div className="page-content">
      <h1 className="page-title">Identity Verification</h1>
      <p className="page-subtitle">
        Please complete the KYC process to unlock full account features and higher transaction limits.
      </p>

      {/* Alert Banner */}
      <div className="alert-banner">
        <div className="alert-content">
          <div className="alert-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="alert-text">
            <h3>Verification in Progress</h3>
            <p>Your documents are currently being reviewed by our security team.</p>
          </div>
        </div>
        <div className="badge badge-outline">
          <div className="badge-dot"></div>
          PENDING REVIEW
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="grid-left">
          {/* Completion Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Completion Status</span>
            </div>
            
            <div className="progress-meta">
              <span>3 of 4 steps completed</span>
              <h2>75%</h2>
            </div>
            
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '75%' }}></div>
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
                <div className="step-icon pending">4</div>
                <span className="step-label" style={{ color: '#9ca3af' }}>Address</span>
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
            <div className="alert-badge">!</div>
            <div className="card-header" style={{ marginBottom: '0.5rem' }}>
              <span className="card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Proof of Address
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>Utility bill or bank statement (Under 3 months old)</p>

            <div className="drag-drop-area">
              <div className="drag-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p>Click to upload or drag & drop</p>
              <small>PDF, JPG, PNG (Max 5MB)</small>
            </div>

            <button className="btn-upload" disabled>
              Submit Address Proof
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
