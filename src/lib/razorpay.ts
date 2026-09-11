import Razorpay from 'razorpay';

let client: Razorpay | null = null;

/**
 * Lazily-constructed Razorpay client. Lazy so that the app doesn't crash on
 * import in environments where the keys haven't been set yet (e.g. before
 * the admin has added RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to .env).
 */
export function getRazorpayClient() {
  if (client) return client;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.'
    );
  }

  client = new Razorpay({ key_id, key_secret });
  return client;
}

export const SUBSCRIPTION_AMOUNT_PAISE = 39900; // ₹399.00
export const SUBSCRIPTION_PERIOD_DAYS = 30;
