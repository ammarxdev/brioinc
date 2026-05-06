"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
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
          <h1>Privacy Policy</h1>
          <p className="subtitle">Last Updated: May 5, 2026</p>

          <section className="story-section">
            <h2>Overview</h2>
            <p>
              This Privacy Policy explains how Brioinc collects, uses, discloses, and protects information when you access our
              website and services. Brioinc provides an institutional bridge for fiat-to-digital asset conversion workflows.
              By using Brioinc, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>

          <section className="story-section">
            <h2>Data Collection</h2>
            <p>
              We collect information necessary to facilitate your fiat-to-Binance conversions, including identity verification documents, bank details, and Binance wallet addresses. Your data is encrypted and stored in institutional-grade vaults.
            </p>
          </section>

          <section className="story-section">
            <h2>Information We Collect</h2>
            <p>
              Depending on how you use Brioinc, we may collect:
              Account details (name, email, phone), identity and verification data (KYC/AML documents and checks),
              transaction information (amounts, timestamps, status), payment and banking details required for settlement,
              and technical data such as device identifiers, approximate location, IP address, and log data.
            </p>
          </section>

          <section className="story-section">
            <h2>How We Use Your Information</h2>
            <p>
              We use collected information to operate and improve the service, verify identity and prevent fraud,
              process transactions and provide customer support, enforce our Terms of Service, comply with legal obligations,
              and communicate important service notifications.
            </p>
          </section>

          <section className="story-section">
            <h2>Third-Party Sharing</h2>
            <p>
              We only share your information with trusted financial partners and Binance to complete your transactions. We do not sell your personal data to advertisers or third-party marketers.
            </p>
          </section>

          <section className="story-section">
            <h2>Legal Basis</h2>
            <p>
              Where required by law, Brioinc processes personal data based on one or more of the following legal bases:
              performance of a contract, legitimate interests such as security and fraud prevention, compliance with legal obligations,
              and your consent where applicable.
            </p>
          </section>

          <section className="story-section">
            <h2>Compliance</h2>
            <p>
              Your data is handled in strict accordance with global privacy standards (GDPR, CCPA) to ensure that your financial journey remains private and secure.
            </p>
          </section>

          <section className="story-section">
            <h2>Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to provide our services, comply with regulatory and
              recordkeeping obligations, resolve disputes, and enforce agreements. Retention periods may vary depending on
              the type of data and jurisdiction.
            </p>
          </section>

          <section className="story-section">
            <h2>Security</h2>
            <p>
              We implement administrative, technical, and physical safeguards designed to protect personal data.
              No method of transmission or storage is completely secure, and we cannot guarantee absolute security.
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section className="story-section">
            <h2>Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data,
              object to certain processing, and request data portability. You may also have the right to withdraw consent where processing is
              based on consent.
            </p>
          </section>

          <section className="story-section">
            <h2>Contact</h2>
            <p>
              If you have questions about this Privacy Policy or would like to exercise your rights, you can contact our support team at
              support@brioinc.net.
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
        h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.1; }
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
