"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RefundsPage() {
  return (
    <div className="landing-container">
      <div className="bg-container">
        <Image src="/finance_crypto_bg_1777990108170.png" alt="BG" fill style={{ objectFit: 'cover', transform: 'scale(1.05)' }} priority />
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
          <h1>Return & Refund Policy</h1>
          <p className="subtitle">Last Updated: May 5, 2026</p>

          <section className="story-section">
            <h2>Digital Assets Finality</h2>
            <p>
              Due to the immutable nature of blockchain transactions, all fiat-to-Binance conversions are final. Once funds have been sent to your Binance wallet, they cannot be returned or refunded by Brioinc.
            </p>
          </section>

          <section className="story-section">
            <h2>Failed Transactions</h2>
            <p>
              If a fiat deposit fails to reach our system or is rejected during verification, a full refund to the original bank account will be initiated within 5-7 business days, minus any applicable banking fees.
            </p>
          </section>

          <section className="story-section">
            <h2>Dispute Resolution</h2>
            <p>
              If you believe there has been an error in your transaction processing before it reaches the Binance network, please contact our 24/7 institutional support desk immediately.
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
