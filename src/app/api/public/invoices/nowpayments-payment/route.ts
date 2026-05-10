import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createNowPaymentsPayment } from '@/lib/nowpayments';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseSystem = createClient(supabaseUrl, supabaseServiceKey);

function getSiteUrl(req: Request) {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, payCurrency } = body || {};

    if (!invoiceId || !payCurrency) {
      return NextResponse.json({ error: 'Missing invoiceId or payCurrency' }, { status: 400 });
    }

    const { data: invoice, error: invoiceErr } = await supabaseSystem
      .from('invoices')
      .select('id, user_id, amount, currency, status, invoice_number, description, nowpayment_link, nowpayment_id, nowpayment_pay_address, nowpayment_pay_currency, crypto_amount')
      .eq('id', invoiceId)
      .maybeSingle();

    if (invoiceErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const currentStatus = String(invoice.status || '').toLowerCase();
    if (['paid', 'processing', 'completed'].includes(currentStatus)) {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 409 });
    }

    const siteUrl = getSiteUrl(req);

    const payment = await createNowPaymentsPayment({
      amount: Number(invoice.amount),
      currency: String(invoice.currency || 'USD'),
      payCurrency: String(payCurrency),
      invoiceNumber: String(invoice.invoice_number),
      description: String(invoice.description || `Invoice ${invoice.invoice_number}`),
      siteUrl,
    });

    if (!payment.success) {
      return NextResponse.json({ error: 'Failed to create crypto payment', details: payment.error }, { status: 502 });
    }

    await supabaseSystem
      .from('payments')
      .upsert(
        [
          {
            invoice_id: invoice.id,
            user_id: invoice.user_id,
            provider: 'nowpayments',
            status: 'payment_pending',
            provider_invoice_id: invoice.nowpayment_id,
            provider_payment_id: String(payment.paymentId),
            payment_url: invoice.nowpayment_link,
            price_amount: payment.priceAmount ?? invoice.amount,
            price_currency: payment.priceCurrency ?? invoice.currency,
            pay_amount: payment.payAmount ?? null,
            pay_currency: payment.payCurrency ?? null,
            pay_address: payment.payAddress ?? null,
            payload: payment,
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: 'invoice_id,provider',
        }
      );

    await supabaseSystem
      .from('invoices')
      .update({
        status: 'payment_pending',
        nowpayment_pay_address: payment.payAddress ?? null,
        nowpayment_pay_currency: payment.payCurrency ?? null,
        crypto_amount: payment.payAmount ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.paymentId,
      paymentStatus: payment.paymentStatus,
      payAddress: payment.payAddress,
      payAmount: payment.payAmount,
      payCurrency: payment.payCurrency,
      payinExtraId: payment.payinExtraId,
      invoiceUrl: invoice.nowpayment_link,
    });
  } catch (error: any) {
    console.error('Public NOWPayments payment creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
