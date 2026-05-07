import { NextResponse } from "next/server";
import { createSupabaseServiceServerClient } from "@/lib/supabase/server";
import { getRequestUser } from "@/lib/requestUser";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit({ key: `admin-kyc-pending:${ip}`, limit: 60, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const requestUser = await getRequestUser(req);
    if (!requestUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      .from("kyc_submissions")
      .select("id,user_id,status,submitted_at,cnic_front_path,cnic_back_path,rejection_reason,users:users(id,name,email,first_name,last_name,phone,date_of_birth,address,status,is_verified,role)")
      .eq("is_current", true)
      .eq("status", "pending")
      .order("submitted_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch pending submissions" }, { status: 500 });
    }

    const rows = await Promise.all(
      (data || []).map(async (row: any) => {
        const [frontSigned, backSigned] = await Promise.all([
          supabase.storage.from("kyc").createSignedUrl(row.cnic_front_path, 600),
          supabase.storage.from("kyc").createSignedUrl(row.cnic_back_path, 600),
        ]);

        return {
          ...row,
          cnic_front_url: frontSigned.data?.signedUrl || null,
          cnic_back_url: backSigned.data?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ submissions: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
