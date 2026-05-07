import { NextResponse } from "next/server";
import { createSupabaseServiceServerClient } from "@/lib/supabase/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit({ key: `check-email:${ip}`, limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const rawEmail = String(body?.email || "");
    const email = rawEmail.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = createSupabaseServiceServerClient();
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: "Failed to check email" }, { status: 500 });
    }

    return NextResponse.json({ exists: (data || []).length > 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
