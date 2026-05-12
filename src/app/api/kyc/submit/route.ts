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

    const { cnicFrontPath, cnicBackPath, selfiePath } = await req.json();

    const frontPath = String(cnicFrontPath || "");
    const backPath = String(cnicBackPath || "");
    const sPath = String(selfiePath || "");

    if (!isValidObjectPath(frontPath, requestUser.id) || !isValidObjectPath(backPath, requestUser.id) || !isValidObjectPath(sPath, requestUser.id)) {
      return NextResponse.json({ error: "Invalid document path" }, { status: 400 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing from your .env file. Please add it and restart your dev server (npm run dev)." 
      }, { status: 500 });
    }

    const supabase = createSupabaseServiceServerClient();

    const { error: clearCurrentErr } = await supabase
      .from("kyc_submissions")
      .update({ is_current: false, updated_at: new Date().toISOString() })
      .eq("user_id", requestUser.id)
      .eq("is_current", true);

    if (clearCurrentErr) {
      console.error("clearCurrentErr:", clearCurrentErr);
      return NextResponse.json({ 
        error: `Failed to submit KYC (clear current): ${clearCurrentErr.message || JSON.stringify(clearCurrentErr)}` 
      }, { status: 500 });
    }

    const { data: submission, error: insertErr } = await supabase
      .from("kyc_submissions")
      .insert({
        user_id: requestUser.id,
        status: "pending",
        cnic_front_path: frontPath,
        cnic_back_path: backPath,
        selfie_path: sPath,
        is_current: true,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("insertErr:", insertErr);
      return NextResponse.json({ 
        error: `Failed to submit KYC (insert): ${insertErr.message || JSON.stringify(insertErr)}` 
      }, { status: 500 });
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
      console.error("userUpdateErr:", userUpdateErr);
      return NextResponse.json({ 
        error: `Failed to update user status to pending: ${userUpdateErr.message || JSON.stringify(userUpdateErr)}` 
      }, { status: 500 });
    }

    // Insert notification for user
    await supabase.from("notifications").insert({
      user_id: requestUser.id,
      title: "KYC Submitted",
      message: "Your identity documents have been submitted and are currently under review by our team.",
      type: "info"
    });

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error: any) {
    console.error("KYC submission route error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error during KYC submission" }, { status: 500 });
  }
}
