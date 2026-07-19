const crypto = require('crypto');
const { pool } = require('../db');
const { TIERS } = require('../config/tiers');

/**
 * Paystack calls this URL server-to-server on payment events — this is the
 * source of truth for upgrades, independent of whether the user's browser
 * ever makes it back to /billing/callback. Must be mounted with a *raw*
 * body parser (see server.js) since the signature is computed over the
 * exact request bytes.
 *
 * Configure this URL in the Paystack dashboard under
 * Settings -> API Keys & Webhooks -> Webhook URL, e.g.
 * https://harvexa-api.onrender.com/api/billing/webhook
 */
async function handlePaystackWebhook(req, res) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(503).end();

  const signature = req.headers['x-paystack-signature'];
  const expected = crypto.createHmac('sha512', secret).update(req.body).digest('hex');

  if (!signature || signature !== expected) {
    console.warn('[paystack webhook] signature mismatch');
    return res.status(401).end();
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch (err) {
    return res.status(400).end();
  }

  // Acknowledge immediately — Paystack retries on non-2xx, we don't want
  // a slow DB write to cause duplicate deliveries.
  res.status(200).end();

  if (event.event !== 'charge.success') return;

  try {
    const { userId, tier } = event.data?.metadata || {};
    if (!userId || !TIERS[tier]) return;

    await pool.query('UPDATE users SET tier = $1 WHERE id = $2', [tier, userId]);
    console.log(`[paystack webhook] upgraded user ${userId} to ${tier}`);
  } catch (err) {
    console.error('[paystack webhook] failed to apply upgrade:', err);
  }
}

module.exports = { handlePaystackWebhook };
