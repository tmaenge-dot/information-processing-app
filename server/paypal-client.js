import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PayPal HTTP client setup
 * Returns PayPal SDK environment (Sandbox or Live)
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured. Check your .env file.');
  }

  if (mode === 'live') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  }
}

/**
 * Returns PayPal HTTP client instance with environment
 */
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

export default client;
