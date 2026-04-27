"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children, requireAdmin = false, requireVerified = true }: { children: React.ReactNode, requireAdmin?: boolean, requireVerified?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (requireAdmin && user.role !== "admin") {
        router.push("/dashboard");
      } else if (requireVerified && !user.isVerified && pathname !== "/dashboard/verification") {
        router.push("/dashboard/verification");
      } else if (!requireVerified && user.isVerified && pathname === "/dashboard/verification") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, requireAdmin, requireVerified, pathname]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user) return null;
  if (requireAdmin && user.role !== "admin") return null;
  if (requireVerified && !user.isVerified && pathname !== "/dashboard/verification") return null;

  return <>{children}</>;
}
