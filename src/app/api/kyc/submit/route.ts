import { NextResponse } from "next/server";
import { createSupabaseServiceServerClient } from "@/lib/supabase/server";
import { getRequestUser } from "@/lib/requestUser";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

function isValidObjectPath(path: string, userId: string) {
  const normalized = path.trim();
  if (!normalized) return false;
  if (normalized.includes("..")) return false;
  return normalized.startsWith(`${userId}/`);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit({ key: `kyc-submit:${ip}`, limit: 5, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const requestUser = await getRequestUser(req);
    if (!requestUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cnicFrontPath, cnicBackPath } = await req.json();

    const frontPath = String(cnicFrontPath || "");
    const backPath = String(cnicBackPath || "");

    if (!isValidObjectPath(frontPath, requestUser.id) || !isValidObjectPath(backPath, requestUser.id)) {
      return NextResponse.json({ error: "Invalid document path" }, { status: 400 });
    }

    const supabase = createSupabaseServiceServerClient();

    const { error: clearCurrentErr } = await supabase
      .from("kyc_submissions")
      .update({ is_current: false, updated_at: new Date().toISOString() })
      .eq("user_id", requestUser.id)
      .eq("is_current", true);

    if (clearCurrentErr) {
      return NextResponse.json({ error: "Failed to submit KYC" }, { status: 500 });
    }

    const { data: submission, error: insertErr } = await supabase
      .from("kyc_submissions")
      .insert({
        user_id: requestUser.id,
        status: "pending",
        cnic_front_path: frontPath,
        cnic_back_path: backPath,
        is_current: true,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: "Failed to submit KYC" }, { status: 500 });
    }

    const { error: userUpdateErr } = await supabase
      .from("users")
      .update({
        status: "pending",
        is_verified: false,
        kyc_rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestUser.id);

    if (userUpdateErr) {
      return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
