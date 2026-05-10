import { NextResponse } from "next/server";
import { createSupabaseServiceServerClient } from "@/lib/supabase/server";
import { getRequestUser } from "@/lib/requestUser";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit({ key: `admin-invoices-list:${ip}`, limit: 60, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing from your .env file. Please add it and restart your dev server.",
      },
      { status: 500 }
    );
  }

  try {
    const requestUser = await getRequestUser(req);
    if (!requestUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServiceServerClient();

    const { data: adminProfile, error: adminErr } = await supabase
      .from("users")
      .select("role")
      .eq("id", requestUser.id)
      .maybeSingle();

    if (adminErr || adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }

    return NextResponse.json({ invoices: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
