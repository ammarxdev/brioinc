"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AuthUser {
  id: string;
  email: string | null;
  name?: string;
  status: "kyc_required" | "pending" | "approved" | "rejected";
  isVerified: boolean;
  role: "user" | "admin";
  kycRejectionReason?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for dev bypass
    const devBypassAuth =
      process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true" &&
      typeof window !== "undefined" &&
      ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

    if (devBypassAuth) {
      setUser({
        id: "d0000000-0000-0000-0000-000000000000",
        email: "admin@brioinc.net",
        name: "Development Admin",
        status: "approved",
        isVerified: true,
        role: "admin",
      });
      setLoading(false);
      return;
    }

    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string, email: string | undefined, userMetadata?: any) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile", error);
      }

      const metadataName = userMetadata?.name || null;

      if (data) {
        let currentName = data.name;
        if (!currentName && metadataName) {
          currentName = metadataName;
          await supabase
            .from("users")
            .update({ name: metadataName })
            .eq("id", userId);
        }

        setUser({
          id: userId,
          email: email || null,
          name: currentName,
          status: data.status,
          isVerified: data.is_verified,
          role: data.role || "user",
          kycRejectionReason: (data as any).kyc_rejection_reason ?? null,
        });
      } else {
        if (email) {
          const { error: insertError } = await supabase.from("users").insert({
            id: userId,
            email,
            name: metadataName,
            status: "kyc_required",
            is_verified: false,
            role: "user",
          });

          if (insertError) {
            console.error("Failed to create user profile row", insertError);
          }
        }

        setUser({
          id: userId,
          email: email || null,
          name: metadataName || undefined,
          status: "kyc_required",
          isVerified: false,
          role: "user",
          kycRejectionReason: null,
        });
      }
    } catch (err) {
      console.error("Error fetching user profile", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
