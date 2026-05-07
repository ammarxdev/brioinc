"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeprecatedAdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Smoothly and securely route requests to the new custom Admin URL pathway
    router.replace("/admin");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#050505", color: "#94a3b8", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "24px", height: "24px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#ffffff", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem auto" }}></div>
        <p style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>Redirecting to secure admin terminal...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
