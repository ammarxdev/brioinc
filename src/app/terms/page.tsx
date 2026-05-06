"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="landing-container">
      <div className="bg-container">
        <Image src="/finance-bg.png" alt="BG" fill style={{ objectFit: 'cover', transform: 'scale(1.05)' }} priority />
        <div className="bg-overlay"></div>
      </div>

      <Navbar />

      <div className="logo-container">
        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="logo-text">Brioinc</span>
      </div>

      <main className="content-page-main">
        <div className="content-glass-card">
          <h1>Terms of Service</h1>
          <p className="subtitle">Effective Date: May 5, 2026</p>

          <section className="story-section">
            <h2>Introduction</h2>
            <p>
              These Terms of Service govern your access to and use of Brioinc’s website and services. By creating an account or using
              the service, you agree to be bound by these Terms. If you do not agree, you must not use the service.
            </p>
          </section>

          <section className="story-section">
            <h2>1. Binance Wallet Authorization</h2>
            <p>
              By using Brioinc, you authorize us to facilitate the transfer of your deposited fiat funds into your specified Binance wallet. 
              You must ensure that your Binance wallet address is correct; Brioinc is not responsible for funds sent to incorrect addresses provided by the user.
            </p>
          </section>

          <section className="story-section">
            <h2>2. Compliance and Verification</h2>
            <p>
              Users must undergo KYC/AML verification to utilize our fiat-to-crypto bridge. This ensures the integrity of the financial system and complies with international regulations regarding digital asset transfers.
            </p>
          </section>

          <section className="story-section">
            <h2>Account Eligibility</h2>
            <p>
              You must be legally capable of entering into a binding agreement and comply with all applicable laws in your jurisdiction.
              We may refuse access, suspend, or terminate accounts that fail verification or are suspected of fraud, misuse, or unlawful activity.
            </p>
          </section>

          <section className="story-section">
            <h2>Fees and Pricing</h2>
            <p>
              Fees (if applicable) may be displayed before you confirm a transaction. Fees can vary depending on payment rails,
              settlement method, and compliance requirements. You are responsible for any bank fees, intermediary fees, or third-party charges.
            </p>
          </section>

          <section className="story-section">
            <h2>3. Transaction Finality</h2>
            <p>
              Once a conversion to Binance is initiated and confirmed on the blockchain or internal ledger, the transaction is final and cannot be reversed. Users should verify all details before confirming their conversion.
            </p>
          </section>

          <section className="story-section">
            <h2>Prohibited Use</h2>
            <p>
              You agree not to use the service for unlawful activity, money laundering, sanctions violations, fraud, or attempts to
              compromise the security of the platform. You may not reverse engineer, scrape, or interfere with service operation.
            </p>
          </section>

          <section className="story-section">
            <h2>Service Availability</h2>
            <p>
              We may modify, suspend, or discontinue any part of the service at any time, including for maintenance,
              security, compliance, or operational reasons.
            </p>
          </section>

          <section className="story-section">
            <h2>Disclaimers</h2>
            <p>
              The service is provided on an “as is” and “as available” basis. Brioinc does not guarantee uninterrupted availability,
              error-free operation, or that transfers will be completed within any specific timeframe.
            </p>
          </section>

          <section className="story-section">
            <h2>Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Brioinc will not be liable for indirect, incidental, special, consequential,
              or punitive damages, or any loss of profits, data, or goodwill arising from or related to your use of the service.
            </p>
          </section>

          <section className="story-section">
            <h2>Termination</h2>
            <p>
              We may suspend or terminate your access to the service at any time if we believe you have violated these Terms,
              failed verification, or created risk for Brioinc, our partners, or other users.
            </p>
          </section>

          <section className="story-section">
            <h2>Contact</h2>
            <p>
              For questions about these Terms, contact support@brioinc.net.
            </p>
          </section>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .landing-container { min-height: 100vh; width: 100%; position: relative; color: white; background: #000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .bg-container { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -2; }
        .bg-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 50%, #000 70%);
          box-shadow: inset 0 0 150px 50px #000;
          z-index: 1;
        }
        .logo-container { position: absolute; top: 40px; left: 40px; display: flex; align-items: center; gap: 12px; z-index: 10; }
        .logo-text { font-size: 1.75rem; font-weight: 600; letter-spacing: -0.04em; }
        .logo-icon { width: 32px; height: 32px; }

        .content-page-main { padding: 140px 20px 80px; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; }
        .content-glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 4rem; border-radius: 2.5rem; width: 100%; max-width: 900px; box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5); }
        
        h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: -0.04em; line-height: 1.1; }
        .subtitle { font-size: 1.1rem; color: #94a3b8; margin-bottom: 3.5rem; }
        
        .story-section { margin-bottom: 3rem; }
        h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #f8fafc; }
        p { font-size: 1.05rem; line-height: 1.6; color: #cbd5e1; }

        @media (max-width: 768px) {
          .content-glass-card { padding: 2.5rem 2rem; border-radius: 2rem; }
          .logo-container { top: 20px; left: 20px; }
          h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
