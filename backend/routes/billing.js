const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { TIERS, getTier } = require('../config/tiers');
const { publicUser } = require('./auth');
const paystack = require('../utils/paystack');

const router = express.Router();

router.get('/plans', (req, res) => {
  res.json({ plans: TIERS, paystackConfigured: paystack.isConfigured() });
});

/**
 * Starts a real Paystack payment for a paid tier. Returns an
 * `authorization_url` the frontend redirects the browser to — that's
 * Paystack's own hosted checkout page (card entry never touches our
 * server). Downgrading to `free` never needs payment and is applied
 * immediately below instead.
 */
router.post('/initialize', requireAuth, async (req, res) => {
  try {
    const { tier } = req.body;
    if (!TIERS[tier]) return res.status(400).json({ error: 'Unknown plan.' });

    if (tier === 'free') {
      const { rows } = await pool.query('UPDATE users SET tier = $1 WHERE id = $2 RETURNING *', [
        'free',
        req.user.id,
      ]);
      return res.json({ requiresPayment: false, user: publicUser(rows[0]) });
    }

    const plan = getTier(tier);

    if (!paystack.isConfigured()) {
      // No PAYSTACK_SECRET_KEY set on the server — fall back to an instant
      // demo switch so the product stays testable without real keys. Real
      // money is never involved in this branch.
      const { rows } = await pool.query('UPDATE users SET tier = $1 WHERE id = $2 RETURNING *', [
        tier,
        req.user.id,
      ]);
      return res.json({
        requiresPayment: false,
        demoMode: true,
        user: publicUser(rows[0]),
        note: 'PAYSTACK_SECRET_KEY is not set, so this upgrade was applied instantly without payment. Set PAYSTACK_SECRET_KEY on the backend to charge real cards.',
      });
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const transaction = await paystack.initializeTransaction({
      email: req.user.email,
      amountKobo: plan.priceNGNKobo,
      metadata: { userId: req.user.id, tier },
      callbackUrl: `${frontendUrl}/billing/callback`,
    });

    res.json({
      requiresPayment: true,
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    });
  } catch (err) {
    console.error('Paystack initialize failed:', err?.response?.data || err.message);
    res.status(502).json({ error: 'Could not start payment with Paystack. Please try again.' });
  }
});

/**
 * Called by the frontend after Paystack redirects the user back to
 * /billing/callback?reference=... — confirms the charge directly with
 * Paystack's servers (never trusts the redirect alone) before upgrading.
 */
router.get('/verify/:reference', requireAuth, async (req, res) => {
  try {
    if (!paystack.isConfigured()) {
      return res.status(503).json({ error: 'Paystack is not configured on this server.' });
    }

    const transaction = await paystack.verifyTransaction(req.params.reference);

    if (transaction.status !== 'success') {
      return res.status(402).json({ error: `Payment ${transaction.status}.`, status: transaction.status });
    }

    const { userId, tier } = transaction.metadata || {};
    if (!userId || !TIERS[tier] || userId !== req.user.id) {
      return res.status(400).json({ error: 'Payment reference does not match this account.' });
    }

    const { rows } = await pool.query('UPDATE users SET tier = $1 WHERE id = $2 RETURNING *', [
      tier,
      req.user.id,
    ]);

    res.json({ success: true, user: publicUser(rows[0]) });
  } catch (err) {
    console.error('Paystack verify failed:', err?.response?.data || err.message);
    res.status(502).json({ error: 'Could not verify payment with Paystack.' });
  }
});

module.exports = router;
