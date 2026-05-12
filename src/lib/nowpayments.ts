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
  successUrl,
  cancelUrl,
  partiallyPaidUrl,
}: {
  amount: number;
  currency?: string;
  invoiceNumber: string;
  description: string;
  siteUrl: string;
  successUrl?: string;
  cancelUrl?: string;
  partiallyPaidUrl?: string;
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
      success_url: successUrl || `${siteUrl}/dashboard`,
      cancel_url: cancelUrl || `${siteUrl}/dashboard`,
      partially_paid_url: partiallyPaidUrl || successUrl || `${siteUrl}/dashboard`,
    };

    const response = await axios.post(`${NOWPAYMENTS_API_URL}/invoice`, payload, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
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

export async function createNowPaymentsPayment({
  amount,
  currency = 'USD',
  payCurrency,
  invoiceNumber,
  description,
  siteUrl,
}: {
  amount: number;
  currency?: string;
  payCurrency: string;
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
      pay_currency: payCurrency.toLowerCase(),
      order_id: invoiceNumber,
      order_description: description,
      ipn_callback_url: `${siteUrl}/api/webhooks/nowpayments`,
    };

    const response = await axios.post(`${NOWPAYMENTS_API_URL}/payment`, payload, {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      paymentId: response.data.payment_id,
      paymentStatus: response.data.payment_status,
      payAddress: response.data.pay_address,
      payinExtraId: response.data.payin_extra_id,
      payAmount: response.data.pay_amount,
      payCurrency: response.data.pay_currency,
      priceAmount: response.data.price_amount,
      priceCurrency: response.data.price_currency,
      orderId: response.data.order_id,
      invoiceId: response.data.invoice_id,
    };
  } catch (error: any) {


    return {
      success: false,
      error: error.response?.data || error.message,
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
    const sortObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map((v) => sortObject(v));
      return Object.keys(obj)
        .sort()
        .reduce((result: Record<string, any>, key) => {
          result[key] = obj[key] && typeof obj[key] === 'object' ? sortObject(obj[key]) : obj[key];
          return result;
        }, {});
    };

    const stringifiedBody = JSON.stringify(sortObject(body));

    const hmac = crypto.createHmac('sha512', ipnSecret);
    hmac.update(stringifiedBody);
    const calculatedSignature = hmac.digest('hex');

    // 5. Secure constant-time comparison to prevent timing attacks
    if (calculatedSignature.length !== receivedSignature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(calculatedSignature, 'hex'), Buffer.from(receivedSignature, 'hex'));
  } catch (error) {

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

    return {
      success: false,
      status: 'unknown',
    };
  }
}
