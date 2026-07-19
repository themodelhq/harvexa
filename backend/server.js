require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { initDb } = require('./db');
const { router: authRouter } = require('./routes/auth');
const scrapeRouter = require('./routes/scrape');
const exportRouter = require('./routes/export');
const billingRouter = require('./routes/billing');
const { handlePaystackWebhook } = require('./routes/billingWebhook');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true,
  })
);

// Must be registered BEFORE express.json(): Paystack's webhook signature is
// computed over the raw request bytes, so this route needs the unparsed
// body rather than the JSON-parsed object the rest of the API uses.
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handlePaystackWebhook);

app.use(express.json({ limit: '2mb' }));

// Global rate limit as a safety net on top of per-tier quotas.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'harvexa-api' }));

app.use('/api/auth', authRouter);
app.use('/api/scrape', scrapeRouter);
app.use('/api/export', exportRouter);
app.use('/api/billing', billingRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`[harvexa-api] listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
