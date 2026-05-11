"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
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
  const fetchingRef = useRef<boolean>(false);

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes - this also fires INITIAL_SESSION event
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event, !!session);
      if (!mounted) return;
      
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string, email: string | undefined, userMetadata?: any) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
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
      fetchingRef.current = false;
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
