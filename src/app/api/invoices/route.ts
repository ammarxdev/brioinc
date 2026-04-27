import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NOWPAYMENTS_API_KEY = process.env.NEXT_PUBLIC_NOWPAYMENTS_API_KEY || "YOUR_NOWPAYMENTS_KEY";
const EMAIL_USER = process.env.EMAIL_USER || "your-email@example.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "your-app-password";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { amount, description, clientEmail, invoiceNumber, userId } = await req.json();

    if (!userId || !amount || !clientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create NowPayments Invoice
    let paymentUrl = "https://nowpayments.io";
    let nowPaymentsId = "mock_id";

    try {
      const nowPaymentsResp = await axios.post(
        "https://api.nowpayments.io/v1/invoice",
        {
          price_amount: amount,
          price_currency: "usd",
          pay_currency: "usdttrc20",
          order_id: invoiceNumber,
          order_description: description,
          success_url: "https://yourdomain.com/dashboard",
          cancel_url: "https://yourdomain.com/dashboard",
        },
        {
          headers: {
            "x-api-key": NOWPAYMENTS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      paymentUrl = nowPaymentsResp.data.invoice_url;
      nowPaymentsId = nowPaymentsResp.data.id;
    } catch (npError: any) {
      console.warn("NowPayments API Error, using mock URL", npError.message);
    }

    // 2. Save Invoice to Supabase
    const { data: invoiceData, error: dbError } = await supabase
      .from("invoices")
      .insert([
        {
          user_id: userId,
          amount: amount,
          status: "unpaid",
          client_email: clientEmail,
          description: description,
          nowpayment_link: paymentUrl,
          nowpayment_id: nowPaymentsId,
          invoice_number: invoiceNumber,
        }
      ])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    // 3. Send Email to Client
    try {
      await transporter.sendMail({
        from: '"Brioinc Corp" <' + EMAIL_USER + '>',
        to: clientEmail,
        subject: `New Invoice from Brioinc (${invoiceNumber})`,
        html: `
          <h2>You have a new invoice from Brioinc!</h2>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Amount Due:</strong> $${amount} USD</p>
          <br/>
          <p>Please click the button below to complete your crypto payment securely via NowPayments:</p>
          <a href="${paymentUrl}" style="background-color: #0f172a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Pay Now</a>
        `,
      });
    } catch (emailError: any) {
      console.warn("Nodemailer failed to send email", emailError.message);
      // We don't fail the whole request if email fails, but in production we might want to
    }

    return NextResponse.json({ success: true, invoice: invoiceData });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
