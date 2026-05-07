import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPaymentSuccessfulEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing invoice identification parameter' }, { status: 400 });
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('status, amount, currency, invoice_number, nowpayment_pay_address, nowpayment_pay_currency, crypto_amount')
      .eq('id', id)
      .maybeSingle();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: invoice.status,
      amount: invoice.amount,
      currency: invoice.currency,
      invoiceNumber: invoice.invoice_number,
      payAddress: invoice.nowpayment_pay_address,
      payCurrency: invoice.nowpayment_pay_currency,
      cryptoAmount: invoice.crypto_amount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server check failure' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status parameters' }, { status: 400 });
    }

    // 1. Fetch current invoice state
    const { data: invoiceData, error: invoiceErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (invoiceErr || !invoiceData) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Deduplicate: If already marked as paid/processing/completed, return success immediately
    if (['paid', 'processing', 'completed'].includes(invoiceData.status)) {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    // 2. Update invoice status to target status (e.g. 'paid')
    const { error: updateInvoiceErr } = await supabase
      .from('invoices')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateInvoiceErr) {
      return NextResponse.json({ error: 'Failed to update invoice status' }, { status: 500 });
    }

    // 3. Update the vendor's balance if status is marking as 'paid'
    if (status === 'paid') {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', invoiceData.user_id)
        .maybeSingle();

      if (!userError && userData) {
        const currentBalance = userData.balance || 0;
        await supabase
          .from('users')
          .update({ balance: currentBalance + Number(invoiceData.amount) })
          .eq('id', userData.id);

        // Send payment confirmation email asynchronously
        sendPaymentSuccessfulEmail({
          to: userData.email,
          userName: userData.name || 'Vendor',
          clientName: invoiceData.client_name || 'Client',
          amount: Number(invoiceData.amount),
          currency: invoiceData.currency || 'USD',
          invoiceNumber: invoiceData.invoice_number,
        }).catch((emailErr: any) => {
          console.warn('Payment success notification email failed asynchronously:', emailErr.message);
        });
      }

      // 4. Log the action to audit trail
      await supabase.from('admin_logs').insert([
        {
          admin_id: null,
          action: 'payment_received',
          details: `Invoice ${invoiceData.invoice_number} marked PAID via On-Site Checkout Gateway`,
          ip_address: req.headers.get('x-forwarded-for') || 'ON_SITE_CHECKOUT',
        }
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal payment processing failure' }, { status: 500 });
  }
}
