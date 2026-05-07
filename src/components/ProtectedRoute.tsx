"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children, requireAdmin = false, requireVerified = true }: { children: React.ReactNode, requireAdmin?: boolean, requireVerified?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const devBypassAuth =
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true" &&
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  useEffect(() => {
    if (devBypassAuth) return;
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (requireAdmin && user.role !== "admin") {
        router.push("/dashboard");
      } else if (requireVerified && !user.isVerified && pathname !== "/signup/kyc") {
        router.push("/signup/kyc");
      } else if (!requireVerified && user.isVerified && pathname === "/signup/kyc") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, requireAdmin, requireVerified, pathname]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (devBypassAuth) return <>{children}</>;

  if (!user) return null;
  if (requireAdmin && user.role !== "admin") return null;
  if (requireVerified && !user.isVerified && pathname !== "/signup/kyc") return null;

  return <>{children}</>;
}
