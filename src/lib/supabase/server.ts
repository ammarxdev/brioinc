import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function createSupabaseAnonServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseServiceServerClient() {
  if (!supabaseServiceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to your environment variables and restart the server."
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
