import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createNowPaymentsInvoice } from '@/lib/nowpayments';
import { encrypt } from '@/lib/encryption';
import { sendInvoiceCreatedEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Use Service Key to bypass potential user RLS restrictions during server-initiated writes
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseSystem = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

async function getRequestUser(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return null;

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

function generateInvoiceNumber() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${Date.now()}-${suffix}`;
}

function isEncryptedBankValue(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  return parts.every((p) => /^[0-9a-f]+$/i.test(p) && p.length > 0);
}

export async function POST(req: Request) {
  try {
    const requestUser = await getRequestUser(req);
    if (!requestUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      clientName,
      clientEmail,
      amount,
      currency = 'USD',
      description = 'Services Rendered',
      bankName,
      bankAccountNumber,
      bankCountry,
      notes = '',
    } = body;

    // Validate inputs
    if (!clientEmail || !amount || !bankName || !bankAccountNumber || !bankCountry) {
      return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
    }

    // 1. Encrypt Bank Details at application-level before DB insertion
    const encryptedBankAccount = isEncryptedBankValue(bankAccountNumber)
      ? bankAccountNumber
      : encrypt(bankAccountNumber);

    // 2. Formulate site URL for payment callbacks
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const siteUrl = `${proto}://${host}`;

    const invoiceNumber = generateInvoiceNumber();

    const { data: invoiceData, error: createInvoiceErr } = await supabaseSystem
      .from('invoices')
      .insert([
        {
          user_id: requestUser.id,
          amount: parseFloat(amount),
          currency: currency.toUpperCase(),
          status: 'pending',
          client_email: clientEmail,
          client_name: clientName || 'Client',
          description,
          invoice_number: invoiceNumber,
          bank_name: bankName,
          bank_account_number: encryptedBankAccount,
          bank_country: bankCountry,
          notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (createInvoiceErr || !invoiceData) {
      throw createInvoiceErr;
    }

    // 3. Request Dynamic NowPayments Invoice Link
    const paymentSetup = await createNowPaymentsInvoice({
      amount: parseFloat(amount),
      currency,
      invoiceNumber,
      description,
      siteUrl,
    });

    if (!paymentSetup.success && !paymentSetup.isMock) {
      await supabaseSystem
        .from('invoices')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', invoiceData.id);
      return NextResponse.json({ error: 'Failed to create payment checkout. Please try again.' }, { status: 502 });
    }

    const { error: paymentErr } = await supabaseSystem
      .from('payments')
      .insert([
        {
          invoice_id: invoiceData.id,
          user_id: invoiceData.user_id,
          provider: 'nowpayments',
          status: 'payment_pending',
          provider_invoice_id: paymentSetup.invoiceId,
          payment_url: paymentSetup.invoiceUrl,
          price_amount: parseFloat(amount),
          price_currency: currency.toUpperCase(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);

    if (paymentErr) {
      throw paymentErr;
    }

    const { data: updatedInvoice, error: invoiceUpdateErr } = await supabaseSystem
      .from('invoices')
      .update({
        status: 'payment_pending',
        nowpayment_link: paymentSetup.invoiceUrl,
        nowpayment_id: paymentSetup.invoiceId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceData.id)
      .select()
      .single();

    if (invoiceUpdateErr || !updatedInvoice) {
      throw invoiceUpdateErr;
    }

    // 5. Trigger Transactional Email notification to Client (Non-blocking background thread)
    const payPageUrl = `${siteUrl}/invoices/pay/${updatedInvoice.id}`;
    
    sendInvoiceCreatedEmail({
      to: clientEmail,
      clientName: clientName || 'Valued Partner',
      amount: parseFloat(amount),
      currency,
      invoiceNumber,
      payLink: payPageUrl,
      checkoutUrl: paymentSetup.invoiceUrl,
    }).catch((emailErr: any) => {
      console.warn('Invoice alert failed to send in background:', emailErr.message);
    });

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      payPageUrl,
    });
  } catch (error: any) {
    console.error('Invoice API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
