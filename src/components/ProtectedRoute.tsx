"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children, requireAdmin = false, requireVerified = true }: { children: React.ReactNode, requireAdmin?: boolean, requireVerified?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowUnauthedKyc = !requireVerified && pathname === "/signup/kyc";

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (!allowUnauthedKyc) {
          router.push("/");
        }
      } else if (requireAdmin && user.role !== "admin") {
        router.push("/dashboard");
      } else if (requireVerified && user.status !== "approved" && pathname !== "/signup/kyc") {
        router.push("/signup/kyc");
      } else if (!requireVerified && user.status === "approved" && pathname === "/signup/kyc") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, requireAdmin, requireVerified, pathname, allowUnauthedKyc]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user && allowUnauthedKyc) return <>{children}</>;
  if (!user) return null;
  if (requireAdmin && user.role !== "admin") return null;
  if (requireVerified && user.status !== "approved" && pathname !== "/signup/kyc") return null;

  return <>{children}</>;
}
