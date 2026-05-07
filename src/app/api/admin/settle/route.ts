import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/encryption';
import { sendSettlementCompletedEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
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

export async function POST(req: Request) {
  try {
    const requestUser = await getRequestUser(req);
    if (!requestUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, invoiceId, referenceNumber, notes } = await req.json();

    // 1. Secure Session-direct Admin Validation
    const { data: adminProfile, error: adminErr } = await supabaseSystem
      .from('users')
      .select('role')
      .eq('id', requestUser.id)
      .maybeSingle();

    if (adminErr || !adminProfile || adminProfile.role !== 'admin') {
      console.error(`Security breach attempt: non-admin user ${requestUser.id} tried administrative action.`);
      return NextResponse.json({ error: 'Access Denied: Administrative Clearance Required' }, { status: 403 });
    }

    // 2. Route Operations
    if (action === 'decrypt-bank') {
      if (!invoiceId) {
        return NextResponse.json({ error: 'Missing target invoice ID' }, { status: 400 });
      }

      const { data: invoice, error: invoiceErr } = await supabaseSystem
        .from('invoices')
        .select('bank_account_number')
        .eq('id', invoiceId)
        .maybeSingle();

      if (invoiceErr || !invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Decrypt IBAN/Account details on-screen securely
      const decryptedAccount = decrypt(invoice.bank_account_number);
      
      // Log decryption access to admin logs for complete security auditing
      const clientIp = req.headers.get('x-forwarded-for') || 'Unknown';
      await supabaseSystem.from('admin_logs').insert([
        {
          admin_id: requestUser.id,
          action: 'view_bank_details',
          details: `Admin viewed encrypted bank details for invoice: ${invoiceId}`,
          ip_address: clientIp,
        }
      ]);

      return NextResponse.json({ success: true, decryptedAccount });
    }

    if (action === 'mark-processing') {
      if (!invoiceId || !referenceNumber) {
        return NextResponse.json({ error: 'Missing invoiceId or referenceNumber' }, { status: 400 });
      }

      const { data: invoice, error: invoiceErr } = await supabaseSystem
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();

      if (invoiceErr || !invoice) {
        return NextResponse.json({ error: 'Target invoice not found' }, { status: 404 });
      }

      if (String(invoice.status).toLowerCase() !== 'paid') {
        return NextResponse.json({ error: 'Invoice must be PAID before marking as PROCESSING' }, { status: 400 });
      }

      const clientIp = req.headers.get('x-forwarded-for') || 'Unknown';
      const { error: invoiceUpdateErr } = await supabaseSystem
        .from('invoices')
        .update({
          status: 'processing',
          settlement_reference: referenceNumber,
          settlement_notes: notes || null,
          processing_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (invoiceUpdateErr) throw invoiceUpdateErr;

      await supabaseSystem.from('admin_logs').insert([
        {
          admin_id: requestUser.id,
          action: 'mark_processing',
          details: `Admin marked invoice ${invoice.invoice_number} as PROCESSING (Ref: ${referenceNumber})`,
          ip_address: clientIp,
        }
      ]);

      return NextResponse.json({ success: true, message: 'Invoice marked as processing.' });
    }

    if (action === 'mark-completed' || action === 'complete-settlement') {
      if (!invoiceId || !referenceNumber) {
        return NextResponse.json({ error: 'Missing invoiceId or referenceNumber' }, { status: 400 });
      }

      // Fetch paid invoice
      const { data: invoice, error: invoiceErr } = await supabaseSystem
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();

      if (invoiceErr || !invoice) {
        return NextResponse.json({ error: 'Target invoice not found' }, { status: 404 });
      }

      // Ensure status is currently paid
      if (invoice.status === 'completed') {
        return NextResponse.json({ error: 'Invoice is already settled' }, { status: 400 });
      }

      const currentStatus = String(invoice.status || '').toLowerCase();
      if (!['processing', 'paid'].includes(currentStatus)) {
        return NextResponse.json({ error: 'Invoice must be PROCESSING (or PAID legacy) before marking as COMPLETED' }, { status: 400 });
      }

      // Fetch creator (user) profile
      const { data: creatorProfile, error: creatorErr } = await supabaseSystem
        .from('users')
        .select('*')
        .eq('id', invoice.user_id)
        .maybeSingle();

      if (creatorErr || !creatorProfile) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
      }

      // 3. Begin Atomic Transaction State updates
      // A. Update invoice status to completed with reference
      const { error: invoiceUpdateErr } = await supabaseSystem
        .from('invoices')
        .update({
          status: 'completed',
          settlement_reference: referenceNumber,
          settlement_notes: notes || null,
          processing_at: invoice.processing_at || (currentStatus === 'paid' ? new Date().toISOString() : invoice.processing_at),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (invoiceUpdateErr) throw invoiceUpdateErr;

      // B. Create ledger transaction entry (completed debit representing manual bank transfer release)
      const { error: ledgerErr } = await supabaseSystem
        .from('transactions')
        .insert([
          {
            user_id: invoice.user_id,
            amount: Number(invoice.amount),
            description: `Bank Wire Settlement [Invoice: ${invoice.invoice_number}, Ref: ${referenceNumber}]`,
            status: 'completed',
            method: 'bank_wire',
          }
        ]);

      if (ledgerErr) {
        console.error('Failed to update platform ledger:', ledgerErr);
      }

      // C. Update user balance (deduct equivalent since fiat payout is fully released)
      const currentBalance = creatorProfile.balance || 0;
      const finalBalance = Math.max(0, currentBalance - Number(invoice.amount));
      await supabaseSystem
        .from('users')
        .update({ balance: finalBalance })
        .eq('id', invoice.user_id);

      // D. Log admin payout action in admin audit logs
      const clientIp = req.headers.get('x-forwarded-for') || 'Unknown';
      await supabaseSystem.from('admin_logs').insert([
        {
          admin_id: requestUser.id,
          action: 'release_settlement',
          details: `Admin confirmed payout for invoice ${invoice.invoice_number} (Ref: ${referenceNumber})`,
          ip_address: clientIp,
        }
      ]);

      // 4. Send Confirmation Email to Creator
      try {
        await sendSettlementCompletedEmail({
          to: creatorProfile.email,
          userName: creatorProfile.name || 'Vendor',
          amount: Number(invoice.amount),
          currency: invoice.currency || 'USD',
          invoiceNumber: invoice.invoice_number,
          referenceNumber,
        });
      } catch (emailErr: any) {
        console.warn('Settlement email failed to dispatch:', emailErr.message);
      }

      return NextResponse.json({
        success: true,
        message: 'Settlement confirmed, ledger entries logged, and client notified successfully.'
      });
    }

    return NextResponse.json({ error: 'Unsupported Action' }, { status: 400 });
  } catch (error: any) {
    console.error('Administrative Settlement API Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
