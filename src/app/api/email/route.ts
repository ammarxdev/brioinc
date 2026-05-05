import { NextResponse } from 'next/server';
import { sendWelcomeEmail, sendApprovalEmail, sendRejectionEmail, sendOtpEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { action, email, name, otp } = await req.json();

    if (!email || !action) {
      return NextResponse.json({ error: 'Missing email or action' }, { status: 400 });
    }

    console.log(`Email request: action=${action}, to=${email}`);

    switch (action) {
      case 'otp':
        if (!otp) return NextResponse.json({ error: 'Missing OTP code' }, { status: 400 });
        await sendOtpEmail(email, otp);
        break;
      case 'welcome':
        if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
        await sendWelcomeEmail(email, name);
        break;
      case 'approve':
        if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
        await sendApprovalEmail(email, name);
        break;
      case 'reject':
        if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
        await sendRejectionEmail(email, name);
        break;
      default:
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Email sent successfully for action: ${action}` 
    });
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred while sending the email' 
    }, { status: 500 });
  }
}
