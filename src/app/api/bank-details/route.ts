import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encrypt } from '@/lib/encryption';

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

    const body = await req.json();
    const { bankName, accountName, accountNumber, country, isDefault } = body;

    if (!bankName || !accountName || !accountNumber || !country) {
      return NextResponse.json({ error: 'Missing required bank profile fields' }, { status: 400 });
    }

    const encryptedAccountNumber = encrypt(String(accountNumber));

    if (isDefault === true) {
      await supabaseSystem
        .from('bank_details')
        .update({ is_default: false })
        .eq('user_id', requestUser.id);
    }

    const { data, error } = await supabaseSystem
      .from('bank_details')
      .insert([
        {
          user_id: requestUser.id,
          bank_name: bankName,
          account_name: accountName,
          account_number_encrypted: encryptedAccountNumber,
          country,
          is_default: isDefault === true,
        }
      ])
      .select('id, bank_name, account_name, country, is_default, created_at')
      .single();

    if (error || !data) {
      throw error;
    }

    return NextResponse.json({ success: true, bankDetail: data });
  } catch (error: any) {

    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
