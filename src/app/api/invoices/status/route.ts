import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
