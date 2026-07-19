const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getTier } = require('../config/tiers');
const { buildExcel, buildCsv } = require('../utils/exporter');

const router = express.Router();

router.get('/:jobId/:format', requireAuth, async (req, res) => {
  try {
    const { jobId, format } = req.params;
    const tier = getTier(req.user.tier);
    if (!tier.exportFormats.includes(format)) {
      return res.status(403).json({ error: `${format} export is not available on the ${tier.label} plan.` });
    }

    const { rows } = await pool.query('SELECT * FROM scrape_jobs WHERE id = $1 AND user_id = $2', [
      jobId,
      req.user.id,
    ]);
    if (!rows.length) return res.status(404).json({ error: 'Job not found.' });

    const job = rows[0];
    const results = job.results || [];
    const filenameBase = `harvexa_${job.job_type}_${jobId.slice(0, 8)}`;

    if (format === 'xlsx') {
      const buffer = await buildExcel(results, job.job_type);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
      return res.send(Buffer.from(buffer));
    }

    if (format === 'csv') {
      const csv = buildCsv(results);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
      return res.send(csv);
    }

    if (format === 'json') {
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.json"`);
      return res.json(results);
    }

    res.status(400).json({ error: 'Unsupported format. Use xlsx, csv, or json.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed.' });
  }
});

module.exports = router;
