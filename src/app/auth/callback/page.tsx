"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next");
        const type = url.searchParams.get("type") || "";

        const redirectTo =
          next ||
          (type === "recovery"
            ? "/reset-password"
            : type === "signup"
              ? "/signup/kyc"
              : "/dashboard");

        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash: tokenHash,
          });
          if (verifyError) throw verifyError;
        } else {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = hash.get("access_token");
          const refreshToken = hash.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setSessionError) throw setSessionError;
          }
        }

        if (mounted) {
          router.replace(redirectTo);
        }
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to complete authentication.");
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 24, color: "white" }}>
      {error ? error : "Signing you in..."}
    </div>
  );
}
