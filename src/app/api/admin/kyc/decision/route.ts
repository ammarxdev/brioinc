import { NextResponse } from "next/server";
import { createSupabaseServiceServerClient } from "@/lib/supabase/server";
import { getRequestUser } from "@/lib/requestUser";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

type Decision = "approve" | "reject";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit({ key: `admin-kyc-decision:${ip}`, limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    let requestUser = await getRequestUser(req);
    if (!requestUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const submissionId = String(body?.submissionId || "");
    const decision = String(body?.decision || "") as Decision;
    const reason = body?.reason ? String(body.reason) : null;

    if (!submissionId) return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    if (decision !== "approve" && decision !== "reject") {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }
    if (decision === "reject" && (!reason || reason.trim().length < 3)) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    const supabase = createSupabaseServiceServerClient();

    const { data: adminProfile, error: adminErr } = await supabase
      .from("users")
      .select("role")
      .eq("id", requestUser.id)
      .maybeSingle();

    if (adminErr || adminProfile?.role !== "admin") {
      return NextResponse.json({ error: adminErr?.message || "Forbidden" }, { status: 403 });
    }

    const { data: submission, error: submissionErr } = await supabase
      .from("kyc_submissions")
      .select("id,user_id,status,is_current,users:users!kyc_submissions_user_id_fkey(id,email,name,first_name,last_name)")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionErr || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (!submission.is_current) {
      return NextResponse.json({ error: "Submission is no longer current" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const targetStatus = decision === "approve" ? "approved" : "rejected";

    const { error: updateSubmissionErr } = await supabase
      .from("kyc_submissions")
      .update({
        status: targetStatus,
        reviewed_at: now,
        reviewed_by: requestUser.id,
        rejection_reason: decision === "reject" ? reason : null,
        updated_at: now,
      })
      .eq("id", submissionId);

    if (updateSubmissionErr) {
      return NextResponse.json(
        { error: updateSubmissionErr?.message || "Failed to update submission" },
        { status: 500 }
      );
    }

    const { error: updateUserErr } = await supabase
      .from("users")
      .update({
        status: targetStatus,
        is_verified: decision === "approve",
        kyc_rejection_reason: decision === "reject" ? reason : null,
        updated_at: now,
      })
      .eq("id", submission.user_id);

    if (updateUserErr) {
      return NextResponse.json(
        { error: updateUserErr?.message || "Failed to update user" },
        { status: 500 }
      );
    }

    const details =
      decision === "approve"
        ? `KYC approved for user_id=${submission.user_id} submission_id=${submissionId}`
        : `KYC rejected for user_id=${submission.user_id} submission_id=${submissionId} reason=${reason}`;

    await supabase.from("admin_logs").insert([
      {
        admin_id: requestUser.id,
        action: decision === "approve" ? "kyc_approve" : "kyc_reject",
        details,
        ip_address: ip,
      },
    ]);

    try {
      const userRow = Array.isArray(submission.users) ? submission.users[0] : submission.users;
      const userEmail = userRow?.email;
      const userName = userRow?.name || `${userRow?.first_name || ""} ${userRow?.last_name || ""}`.trim() || "User";
      if (userEmail) {
        if (decision === "approve") {
          await sendApprovalEmail(userEmail, userName);
        } else {
          await sendRejectionEmail(userEmail, userName);
        }
      }
    } catch {
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
