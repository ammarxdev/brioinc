import axios from 'axios';
import crypto from 'crypto';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

/**
 * Creates a dynamic NowPayments checkout invoice.
 * Supports credit cards, general cryptos, and Binance Pay natively.
 */
export async function createNowPaymentsInvoice({
  amount,
  currency = 'USD',
  invoiceNumber,
  description,
  siteUrl,
}: {
  amount: number;
  currency?: string;
  invoiceNumber: string;
  description: string;
  siteUrl: string;
}) {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error('NOWPAYMENTS_API_KEY is not configured');
    }

    const payload = {
      price_amount: amount,
      price_currency: currency.toLowerCase(),
      order_id: invoiceNumber,
      order_description: description,
      ipn_callback_url: `${siteUrl}/api/webhooks/nowpayments`,
      success_url: `${siteUrl}/dashboard`,
      cancel_url: `${siteUrl}/dashboard`,
    };

    const response = await axios.post(`${NOWPAYMENTS_API_URL}/invoice`, payload, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      invoiceUrl: response.data.invoice_url,
      invoiceId: response.data.id,
      amount: response.data.price_amount,
      currency: response.data.price_currency,
      createdAt: response.data.created_at,
    };
  } catch (error: any) {
    console.error('NowPayments API createInvoice Error:', error.response?.data || error.message);
    
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }

    const mockId = 'mock_np_' + Math.floor(Math.random() * 1000000);
    return {
      success: false,
      isMock: true,
      invoiceUrl: `https://nowpayments.io/payment?invoice_id=${mockId}`,
      invoiceId: mockId,
      amount,
      currency,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Verifies NOWPayments IPN webhook signature to prevent spoofing.
 */
export function verifyNowPaymentsSignature(
  body: any,
  receivedSignature: string | null,
  ipnSecret: string = NOWPAYMENTS_IPN_SECRET
): boolean {
  if (!receivedSignature || !body) return false;
  try {
    // 1. Sort the keys of the JSON body alphabetically
    const sortedKeys = Object.keys(body).sort();
    
    // 2. Build the alphabetically sorted object
    const sortedObj: Record<string, any> = {};
    sortedKeys.forEach((key) => {
      sortedObj[key] = body[key];
    });

    // 3. Stringify the sorted object (matching NowPayments encoding)
    const stringifiedBody = JSON.stringify(sortedObj);

    // 4. Calculate HMAC-SHA512 of stringified body using IPN Secret
    const hmac = crypto.createHmac('sha512', ipnSecret);
    hmac.update(stringifiedBody);
    const calculatedSignature = hmac.digest('hex');

    // 5. Secure constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Polls payment status of an invoice directly from NowPayments API.
 */
export async function getNowPaymentsInvoiceStatus(invoiceId: string) {
  try {
    const response = await axios.get(`${NOWPAYMENTS_API_URL}/invoice/${invoiceId}`, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
      },
    });
    
    return {
      success: true,
      status: response.data.invoice_status, // e.g. "created", "paid", "confirmed", "expired", "partially_paid"
      price_amount: response.data.price_amount,
      pay_amount: response.data.pay_amount,
      pay_currency: response.data.pay_currency,
    };
  } catch (error: any) {
    console.error(`Error checking NowPayments status for ${invoiceId}:`, error.message);
    return {
      success: false,
      status: 'unknown',
    };
  }
}
