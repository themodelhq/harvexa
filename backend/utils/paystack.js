const axios = require('axios');

const PAYSTACK_BASE = 'https://api.paystack.co';

function isConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function client() {
  return axios.create({
    baseURL: PAYSTACK_BASE,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
}

/**
 * Starts a Paystack transaction. Returns { authorization_url, reference }
 * that the frontend redirects the user to for card entry.
 */
async function initializeTransaction({ email, amountKobo, metadata, callbackUrl }) {
  const { data } = await client().post('/transaction/initialize', {
    email,
    amount: amountKobo,
    currency: 'NGN',
    callback_url: callbackUrl,
    metadata,
  });
  return data.data; // { authorization_url, access_code, reference }
}

/** Confirms a transaction's final status directly with Paystack. */
async function verifyTransaction(reference) {
  const { data } = await client().get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return data.data; // { status, amount, metadata, customer, ... }
}

module.exports = { isConfigured, initializeTransaction, verifyTransaction };
