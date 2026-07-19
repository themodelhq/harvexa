const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { TIERS, getTier } = require('../config/tiers');
const { publicUser } = require('./auth');

const router = express.Router();

router.get('/plans', (req, res) => {
  res.json({ plans: TIERS });
});

/**
 * In demo mode (default, no payment provider keys configured) this simply
 * switches the user's tier so the product is fully testable end-to-end.
 *
 * To go live: set STRIPE_SECRET_KEY (or PAYSTACK_SECRET_KEY) in the backend
 * env, then replace the body of this handler with a real Checkout Session /
 * transaction-initialize call and flip the tier inside your webhook handler
 * instead of here.
 */
router.post('/upgrade', requireAuth, async (req, res) => {
  const { tier } = req.body;
  if (!TIERS[tier]) return res.status(400).json({ error: 'Unknown plan.' });

  const demoMode = !process.env.STRIPE_SECRET_KEY && !process.env.PAYSTACK_SECRET_KEY;
  if (!demoMode) {
    return res.status(501).json({
      error:
        'Live billing is configured but the checkout handler is a stub. Wire up Stripe/Paystack checkout here.',
    });
  }

  const { rows } = await pool.query('UPDATE users SET tier = $1 WHERE id = $2 RETURNING *', [
    tier,
    req.user.id,
  ]);

  res.json({ demoMode: true, user: publicUser(rows[0]), plan: getTier(tier) });
});

module.exports = router;
