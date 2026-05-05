import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

  return transporter.sendMail(mailOptions);
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

  return transporter.sendMail(mailOptions);
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

  return transporter.sendMail(mailOptions);
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

  return transporter.sendMail(mailOptions);
};
