const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireFeature, enforceQuota } = require('../middleware/tierGate');
const { scrapeUrl, scrapeCategory } = require('../scrapers/generic');
const { scrapeSearch } = require('../scrapers/search');
const { scrapeLinkedIn } = require('../scrapers/linkedin');

const router = express.Router();

async function saveJob(userId, jobType, query, results, weight) {
  await pool.query(
    `INSERT INTO scrape_jobs (user_id, job_type, query, result_count, results)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, jobType, query, results.length, JSON.stringify(results)]
  );
  await pool.query('UPDATE users SET scrape_count = scrape_count + $1 WHERE id = $2', [
    weight,
    userId,
  ]);
}

// ── Single / batch URL scraper ──────────────────────────────────────────
router.post(
  '/url',
  requireAuth,
  requireFeature('url'),
  enforceQuota((req) => (Array.isArray(req.body.urls) ? req.body.urls.length : 1)),
  async (req, res) => {
    try {
      const urls = Array.isArray(req.body.urls) ? req.body.urls : [req.body.url];
      const clean = urls.filter(Boolean).map((u) => u.trim());
      if (!clean.length) return res.status(400).json({ error: 'Provide at least one URL.' });

      const results = [];
      for (const u of clean) {
        try {
          results.push(await scrapeUrl(u));
        } catch (err) {
          results.push({ url: u, error: err.message });
        }
      }

      await saveJob(req.user.id, 'url', clean.join(', '), results, req.scrapeWeight);
      res.json({ results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Scrape failed.' });
    }
  }
);

// ── Search engine results scraper ───────────────────────────────────────
router.post(
  '/search',
  requireAuth,
  requireFeature('search'),
  enforceQuota(() => 1),
  async (req, res) => {
    try {
      const { query, limit } = req.body;
      if (!query) return res.status(400).json({ error: 'A search query is required.' });

      const results = await scrapeSearch(query, Math.min(limit || 20, 50));
      await saveJob(req.user.id, 'search', query, results, req.scrapeWeight);
      res.json({ results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Search scrape failed.' });
    }
  }
);

// ── LinkedIn public-index discovery ─────────────────────────────────────
router.post(
  '/linkedin',
  requireAuth,
  requireFeature('linkedin'),
  enforceQuota(() => 1),
  async (req, res) => {
    try {
      const { query, limit } = req.body;
      if (!query) return res.status(400).json({ error: 'A search query is required (name, role, or company).' });

      const results = await scrapeLinkedIn(query, Math.min(limit || 15, 30));
      await saveJob(req.user.id, 'linkedin', query, results, req.scrapeWeight);
      res.json({ results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'LinkedIn discovery failed.' });
    }
  }
);

// ── Category / listing page scraper ─────────────────────────────────────
router.post(
  '/category',
  requireAuth,
  requireFeature('category'),
  enforceQuota(() => 1),
  async (req, res) => {
    try {
      const { url, limit } = req.body;
      if (!url) return res.status(400).json({ error: 'A listing/category URL is required.' });

      const results = await scrapeCategory(url, Math.min(limit || 15, 50));
      await saveJob(req.user.id, 'category', url, results, req.scrapeWeight);
      res.json({ results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Category scrape failed.' });
    }
  }
);

// ── Job history ─────────────────────────────────────────────────────────
router.get('/jobs', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, job_type, query, status, result_count, created_at
     FROM scrape_jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [req.user.id]
  );
  res.json({ jobs: rows });
});

router.get('/jobs/:id', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM scrape_jobs WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Job not found.' });
  res.json({ job: rows[0] });
});

module.exports = router;
