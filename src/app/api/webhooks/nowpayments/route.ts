import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyNowPaymentsSignature } from '@/lib/nowpayments';
import { sendPaymentSuccessfulEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseSystem = createClient(supabaseUrl, supabaseServiceKey);

function mapNowPaymentsStatusToInternal(status: string | null | undefined) {
  const s = String(status || '').toLowerCase();
  const successStatuses = ['finished'];
  const pendingStatuses = ['waiting', 'confirming', 'partially_paid', 'created'];
  const failedStatuses = ['failed'];
  const expiredStatuses = ['expired'];

  if (successStatuses.includes(s)) return { payment: 'paid', invoice: 'paid' };
  if (pendingStatuses.includes(s)) return { payment: 'payment_pending', invoice: 'payment_pending' };
  if (failedStatuses.includes(s)) return { payment: 'failed', invoice: 'failed' };
  if (expiredStatuses.includes(s)) return { payment: 'expired', invoice: 'expired' };
  return { payment: 'payment_pending', invoice: 'payment_pending' };
}

function resolveInvoiceStatus(current: string | null | undefined, incoming: string) {
  const c = String(current || '').toLowerCase();
  const i = String(incoming || '').toLowerCase();

  if (['completed'].includes(c)) return 'completed';
  if (['processing'].includes(c)) return 'processing';

  if (c === 'paid') {
    if (i === 'paid') return 'paid';
    return 'paid';
  }

  if (i === 'failed' || i === 'expired') {
    return i;
  }

  if (i === 'paid') return 'paid';
  if (i === 'payment_pending') return 'payment_pending';
  if (i === 'pending') return 'pending';

  return c || i;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    // Retrieve NowPayments IPN Signature
    const signature = req.headers.get('x-nowpayments-sig');

    // 1. Cryptographic Webhook Authentication
    const isSignatureValid = verifyNowPaymentsSignature(body, signature);
    
    // In production, we strictly require valid signatures. 
    // If not in production or we are mocking, we print a warning but allow it for developer testing.
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isSignatureValid && isProduction) {
      console.error('NOWPayments Webhook Signature Invalid');
      return NextResponse.json({ error: 'Signature Verification Failed' }, { status: 401 });
    } else if (!isSignatureValid) {
      console.warn('NOWPayments Webhook Signature Invalid - Proceeding in development mode.');
    }

    const paymentId = body.payment_id;
    const paymentStatus = body.payment_status;
    const orderId = body.order_id; // Maps to our invoice_number
    const eventId = `${String(paymentId)}:${String(paymentStatus)}:${String(body.actually_paid ?? body.pay_amount ?? '')}`;

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment_id' }, { status: 400 });
    }

    // 2. Webhook Event Log & Deduplication
    // Insert unique event_id into webhook_events. If it fails with constraint, we've already processed this exact status update.
    const { error: eventError } = await supabaseSystem
      .from('webhook_events')
      .insert([
        {
          event_id: eventId,
          payload: body,
          status: 'processed'
        }
      ]);

    if (eventError) {
      if (eventError.code === '23505') { // Postgres code for UNIQUE_VIOLATION
        console.log(`Webhook Event ${eventId} already processed. Ignoring replay.`);
        return NextResponse.json({ success: true, message: 'Duplicate event ignored' });
      }
      console.error('Failed to log webhook event:', eventError);
    }

    console.log(`Processing NowPayments Webhook for Invoice ${orderId}, status=${paymentStatus}`);

    const { payment: internalPaymentStatus, invoice: internalInvoiceStatus } = mapNowPaymentsStatusToInternal(paymentStatus);

    // 3. Find invoice
    const { data: invoiceData, error: fetchError } = await supabaseSystem
      .from('invoices')
      .select('*')
      .eq('invoice_number', orderId)
      .maybeSingle();

    if (fetchError || !invoiceData) {
      console.error(`Invoice not found for number: ${orderId}`);
      return NextResponse.json({ error: 'Associated invoice not found' }, { status: 404 });
    }

    // 4. Update payments record (upsert fallback)
    const txHash = body.txid || body.tx_hash || body.transaction_hash || null;
    const { data: paymentUpdateData, error: paymentUpdateErr } = await supabaseSystem
      .from('payments')
      .update({
        status: internalPaymentStatus,
        provider_invoice_id: body.invoice_id ? String(body.invoice_id) : invoiceData.nowpayment_id,
        provider_payment_id: paymentId ? String(paymentId) : null,
        payment_url: invoiceData.nowpayment_link,
        price_amount: body.price_amount ?? invoiceData.amount,
        price_currency: body.price_currency ?? invoiceData.currency,
        pay_amount: body.pay_amount ?? null,
        pay_currency: body.pay_currency ?? null,
        actually_paid: body.actually_paid ?? null,
        pay_address: body.pay_address ?? null,
        tx_hash: txHash,
        payload: body,
        updated_at: new Date().toISOString(),
      })
      .eq('invoice_id', invoiceData.id)
      .eq('provider', 'nowpayments')
      .select('id');

    if (paymentUpdateErr) {
      console.error('Failed to update payment record:', paymentUpdateErr);
    } else if (!paymentUpdateData || paymentUpdateData.length === 0) {
      const { error: insertPaymentErr } = await supabaseSystem
        .from('payments')
        .insert([
          {
            invoice_id: invoiceData.id,
            user_id: invoiceData.user_id,
            provider: 'nowpayments',
            status: internalPaymentStatus,
            provider_invoice_id: body.invoice_id ? String(body.invoice_id) : invoiceData.nowpayment_id,
            provider_payment_id: paymentId ? String(paymentId) : null,
            payment_url: invoiceData.nowpayment_link,
            price_amount: body.price_amount ?? invoiceData.amount,
            price_currency: body.price_currency ?? invoiceData.currency,
            pay_amount: body.pay_amount ?? null,
            pay_currency: body.pay_currency ?? null,
            actually_paid: body.actually_paid ?? null,
            pay_address: body.pay_address ?? null,
            tx_hash: txHash,
            payload: body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);

      if (insertPaymentErr) {
        console.error('Failed to insert missing payment record:', insertPaymentErr);
      }
    }

    // 5. Update invoice record
    const currentInvoiceStatus = String(invoiceData.status || '').toLowerCase();
    const nextInvoiceStatus = resolveInvoiceStatus(currentInvoiceStatus, internalInvoiceStatus);

    const wasAlreadyPaid = ['paid', 'processing', 'completed'].includes(currentInvoiceStatus);
    const shouldMarkPaidNow = nextInvoiceStatus === 'paid' && !wasAlreadyPaid;

    const { error: updateInvoiceErr } = await supabaseSystem
      .from('invoices')
      .update({
        status: nextInvoiceStatus,
        nowpayment_pay_address: body.pay_address ?? invoiceData.nowpayment_pay_address ?? null,
        nowpayment_pay_currency: body.pay_currency ?? invoiceData.nowpayment_pay_currency ?? null,
        crypto_amount: body.actually_paid ?? body.pay_amount ?? invoiceData.crypto_amount ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceData.id);

    if (updateInvoiceErr) {
      throw updateInvoiceErr;
    }

    if (shouldMarkPaidNow) {
      await supabaseSystem.from('admin_logs').insert([
        {
          admin_id: null,
          action: 'payment_received',
          details: `Invoice ${invoiceData.invoice_number} marked PAID via NOWPayments (payment_id=${paymentId})`,
          ip_address: req.headers.get('x-forwarded-for') || 'NOWPAYMENTS',
        }
      ]);

      const { data: userData, error: userError } = await supabaseSystem
        .from('users')
        .select('*')
        .eq('id', invoiceData.user_id)
        .maybeSingle();

      if (!userError && userData) {
        const currentBalance = userData.balance || 0;
        await supabaseSystem
          .from('users')
          .update({ balance: currentBalance + Number(invoiceData.amount) })
          .eq('id', userData.id);

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
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing exception:', error);
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}
