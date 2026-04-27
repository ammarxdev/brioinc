import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// NOTE: Use Service Role Key in production for backend updates bypassing RLS
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    // Note: Verify x-nowpayments-sig header in production
    const body = await req.json();
    
    const paymentStatus = body.payment_status;
    const orderId = body.order_id; // Maps to our invoiceNumber

    if (paymentStatus === "finished" || paymentStatus === "paid") {
      // 1. Find invoice
      const { data: invoiceData, error: fetchError } = await supabase
        .from("invoices")
        .select("*")
        .eq("invoice_number", orderId)
        .single();

      if (fetchError || !invoiceData) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      // 2. Update invoice status
      await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", invoiceData.id);

      // 3. Update user balance
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", invoiceData.user_id)
        .single();

      if (!userError && userData) {
        const currentBalance = userData.balance || 0;
        await supabase
          .from("users")
          .update({ balance: currentBalance + Number(invoiceData.amount) })
          .eq("id", invoiceData.user_id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: "Ignored status" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
