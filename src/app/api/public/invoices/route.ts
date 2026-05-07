import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseSystem = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing invoice identification parameter' }, { status: 400 });
    }

    const { data: invoice, error: invoiceErr } = await supabaseSystem
      .from('invoices')
      .select('id, user_id, amount, currency, status, client_name, client_email, description, notes, invoice_number, nowpayment_link, nowpayment_id, nowpayment_pay_address, nowpayment_pay_currency, crypto_amount, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (invoiceErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const { data: vendor, error: vendorErr } = await supabaseSystem
      .from('users')
      .select('name, email')
      .eq('id', invoice.user_id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      invoice,
      vendor: vendorErr ? null : vendor,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
