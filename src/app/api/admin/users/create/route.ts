import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get admin session to verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role in DB
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', adminUser.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, password, name, status = 'pending' } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Create user in Auth
    const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (createUserError) {
      return NextResponse.json({ error: createUserError.message }, { status: 400 });
    }

    if (!authUser.user) {
        return NextResponse.json({ error: 'Failed to create user auth' }, { status: 500 });
    }

    // 2. Create user in public.users table
    const { error: dbError } = await supabaseAdmin.from('users').insert({
      id: authUser.user.id,
      email,
      name,
      role: 'user',
      status: status,
      is_verified: status === 'approved'
    });

    if (dbError) {
      // Cleanup auth user if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: authUser.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
