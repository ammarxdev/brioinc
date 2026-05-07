import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Use Service Role Key if available to ensure system logs bypass RLS, fallback to anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabaseSystem = createClient(supabaseUrl, supabaseServiceKey);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Logs an email action to the email_logs table for audit purposes.
 */
async function logEmailEvent(recipient: string, subject: string, action: string, status: 'sent' | 'failed', errorMessage?: string) {
  try {
    await supabaseSystem.from('email_logs').insert([
      {
        recipient,
        subject,
        action,
        status,
        error_message: errorMessage || null,
      }
    ]);
  } catch (err) {
    console.warn('System failed to log email event:', err);
  }
}

export const sendWelcomeEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"Brioinc" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to Brioinc - Your Institutional Gateway',
    html: `
      <div style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 24px;">Welcome to Brioinc</h1>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Hello ${name},<br/><br/>
            Your account has been successfully created and is currently undergoing institutional review. We will notify you as soon as your access to the fiat-to-binance bridge is activated.
          </p>
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; margin-bottom: 32px;">
            <p style="color: #ffffff; font-size: 14px; margin: 0;">Status: <strong>Pending Administrator Approval</strong></p>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            Best regards,<br/>
            <strong>The Brioinc Institutional Team</strong>
          </p>
        </div>
        <p style="color: #475569; font-size: 12px; margin-top: 32px;">© 2026 Brioinc. All rights reserved. Global Digital Asset Solutions.</p>
      </div>
    `,
  };

  try {
    const res = await transporter.sendMail(mailOptions);
    await logEmailEvent(to, mailOptions.subject, 'welcome_email', 'sent');
    return res;
  } catch (error: any) {
    await logEmailEvent(to, mailOptions.subject, 'welcome_email', 'failed', error.message);
    throw error;
  }
};

export const sendApprovalEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"Brioinc" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Brioinc Account Approved',
    html: `
      <div style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <div style="display: inline-block; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; margin-bottom: 24px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 24px;">Access Granted</h1>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Congratulations ${name}, your Brioinc account has been approved. You now have full access to our global fiat-to-digital asset conversion services.
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: #ffffff; color: #000000; font-weight: 700; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-size: 16px;">Log in to Dashboard</a>
          <p style="color: #64748b; font-size: 14px; margin-top: 40px;">
            Best regards,<br/>
            <strong>The Brioinc Institutional Team</strong>
          </p>
        </div>
      </div>
    `,
  };

  try {
    const res = await transporter.sendMail(mailOptions);
    await logEmailEvent(to, mailOptions.subject, 'approval_email', 'sent');
    return res;
  } catch (error: any) {
    await logEmailEvent(to, mailOptions.subject, 'approval_email', 'failed', error.message);
    throw error;
  }
};

export const sendRejectionEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: `"Brioinc" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Update on Your Brioinc Application',
    html: `
      <div style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 24px;">Application Status</h1>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Hello ${name},<br/><br/>
            Thank you for your interest in Brioinc. After reviewing your application, we are unable to approve your account at this time.
          </p>
          <p style="color: #64748b; font-size: 14px;">
            If you have any questions, please contact our institutional support desk.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const res = await transporter.sendMail(mailOptions);
    await logEmailEvent(to, mailOptions.subject, 'rejection_email', 'sent');
    return res;
  } catch (error: any) {
    await logEmailEvent(to, mailOptions.subject, 'rejection_email', 'failed', error.message);
    throw error;
  }
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"Brioinc Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} is your Brioinc verification code`,
    html: `
      <div style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px;">Verify your identity</h1>
          <p style="color: #94a3b8; font-size: 16px; margin-bottom: 32px;">Enter the following code to secure your account.</p>
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 32px; margin-bottom: 32px;">
            <span style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #ffffff;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
            This code will expire in 10 minutes.<br/>
            If you did not request this code, please ignore this email.
          </p>
        </div>
        <p style="color: #475569; font-size: 12px; margin-top: 32px;">© 2026 Brioinc. Secure Institutional Infrastructure.</p>
      </div>
    `,
  };

  try {
    const res = await transporter.sendMail(mailOptions);
    await logEmailEvent(to, mailOptions.subject, 'otp_email', 'sent');
    return res;
  } catch (error: any) {
    await logEmailEvent(to, mailOptions.subject, 'otp_email', 'failed', error.message);
    throw error;
  }
};

/**
 * Dispatches a beautifully detailed Invoice notification directly to the client.
 */
export const sendInvoiceCreatedEmail = async ({
  to,
  clientName,
  amount,
  currency,
  invoiceNumber,
  payLink,
  checkoutUrl,
}: {
  to: string;
  clientName: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  payLink: string;
  checkoutUrl?: string;
}) => {
  const mailOptions = {
    from: `"Brioinc Billing Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `New Invoice Issued: ${invoiceNumber} (${amount} ${currency.toUpperCase()})`,
    html: `
      <div style="background-color: #050505; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 50px 20px; text-align: left;">
        <div style="max-width: 600px; margin: 0 auto; background: #0c0d0e; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.8);">
          <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 24px; margin-bottom: 24px;">
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0;">Brioinc Corp</h1>
            <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Secure Global Payment Systems</p>
          </div>
          
          <h2 style="font-size: 18px; font-weight: 600; color: #f8fafc; margin-bottom: 16px;">Dear ${clientName},</h2>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            A new invoice has been generated for your account. Please click below to review your bill and pay securely via **Credit Card** or **Crypto Assets** through NOWPayments.
          </p>

          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="color: #64748b; padding-bottom: 8px;">Invoice Number:</td>
                <td style="color: #ffffff; font-weight: 600; text-align: right; padding-bottom: 8px;">${invoiceNumber}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding-bottom: 8px;">Total Due:</td>
                <td style="color: #4ade80; font-weight: 700; font-size: 18px; text-align: right; padding-bottom: 8px;">${amount} ${currency.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Due Date:</td>
                <td style="color: #ffffff; text-align: right;">Upon Receipt</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${payLink}" style="display: inline-block; background: #ffffff; color: #000000; font-weight: 700; padding: 16px 40px; border-radius: 100px; text-decoration: none; font-size: 16px; box-shadow: 0 4px 20px rgba(255,255,255,0.15); transition: transform 0.2s;">
              Review & Pay Invoice
            </a>
          </div>

          ${checkoutUrl ? `
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: -12px; margin-bottom: 24px;">
            Direct payment URL (NOWPayments): <a href="${checkoutUrl}" style="color: #4ade80; text-decoration: none;">${checkoutUrl}</a>
          </p>
          ` : ''}

          <p style="color: #475569; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
            This invoice is processed securely via Brioinc. If you have any inquiries, please contact our financial services desk at ${process.env.EMAIL_USER}.
          </p>
        </div>
        <p style="color: #2a313c; font-size: 11px; text-align: center; margin-top: 32px;">© 2026 Brioinc Financial Inc. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const res = await transporter.sendMail(mailOptions);
    await logEmailEvent(to, mailOptions.subject, 'invoice_created', 'sent');
    return res;
  } catch (error: any) {
    await logEmailEvent(to, mailOptions.subject, 'invoice_created', 'failed', error.message);
    throw error;
  }
};

/**
 * Notifies the User that their Client has successfully cleared their payment.
 */
export const sendPaymentSuccessfulEmail = async ({
  to,
  userName,
  clientName,
  amount,
  currency,
  invoiceNumber,
}: {
  to: string;
  userName: string;
  clientName: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
}) => {
  const mailOptions = {
    from: `"Brioinc Billing Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Payment Received! ${invoiceNumber} cleared by client`,
    html: `
      <div style="background-color: #050505; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: #0c0d0e; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 40px;">
          <div style="display: inline-block; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; margin-bottom: 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Invoice Paid Successfully</h1>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: left;">
            Hello ${userName},<br/><br/>
            Great news! Your client <strong>${clientName}</strong> has paid the invoice <strong>${invoiceNumber}</strong>. The amount of <strong>${amount} ${currency.toUpperCase()}</strong> has been captured in cryptocurrency in our administration vaults.
          </p>
          <div style="background: rgba(34,197,94,0.05); border: 1px solid rgba(34,197,94,0.1); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 14px; color: #86efac; display: block;">Settlement Status:</span>
            <strong style="font-size: 18px; color: #4ade80;">Processing Bank Settlement</strong>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: left; line-height: 1.5;">
            Our administrative team is actively reviewing the request and will release the corresponding fiat funds directly to your saved bank account via Binance Pay/Bank wire shortly.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const res = await transporter.sendMail(mailOptions);
    await logEmailEvent(to, mailOptions.subject, 'payment_success_notification', 'sent');
    return res;
  } catch (error: any) {
    await logEmailEvent(to, mailOptions.subject, 'payment_success_notification', 'failed', error.message);
    throw error;
  }
};

/**
 * Notifies the user that their bank settlement is fully processed and completed.
 */
export const sendSettlementCompletedEmail = async ({
  to,
  userName,
  amount,
  currency,
  invoiceNumber,
  referenceNumber,
}: {
  to: string;
  userName: string;
  amount: number;
  currency: string;
  invoiceNumber: string;
  referenceNumber: string;
}) => {
  const mailOptions = {
    from: `"Brioinc Settlement Desk" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Bank Settlement Dispatched: ${invoiceNumber}`,
    html: `
      <div style="background-color: #050505; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background: #0c0d0e; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 40px;">
          <div style="display: inline-block; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; margin-bottom: 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </div>
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Settlement Completed</h1>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; text-align: left;">
            Hello ${userName},<br/><br/>
            We have successfully processed and released your payout. The fiat equivalent of <strong>${amount} ${currency.toUpperCase()}</strong> has been wired/transferred to your specified bank account.
          </p>
          <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px;">
            <div style="margin-bottom: 8px;"><span style="color: #64748b;">Invoice Reference:</span> <strong style="color: #ffffff; float: right;">${invoiceNumber}</strong></div>
            <div><span style="color: #64748b;">Transfer Reference / Ref Hash:</span> <strong style="color: #4ade80; float: right; font-family: monospace;">${referenceNumber}</strong></div>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: left;">
            Depending on your geographic location and bank, funds should arrive in your account within 1 to 3 business days. Thank you for utilizing Brioinc gateway.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const res = await transporter.sendMail(mailOptions);
    await logEmailEvent(to, mailOptions.subject, 'settlement_completed', 'sent');
    return res;
  } catch (error: any) {
    await logEmailEvent(to, mailOptions.subject, 'settlement_completed', 'failed', error.message);
    throw error;
  }
};
