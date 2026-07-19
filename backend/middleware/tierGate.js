const { pool } = require('../db');
const { getTier } = require('../config/tiers');

// Resets the monthly counter if we've rolled into a new month since last reset.
async function resetIfNewMonth(user) {
  const last = new Date(user.scrape_count_reset_at);
  const now = new Date();
  const rolledOver =
    last.getUTCFullYear() !== now.getUTCFullYear() || last.getUTCMonth() !== now.getUTCMonth();

  if (rolledOver) {
    await pool.query(
      'UPDATE users SET scrape_count = 0, scrape_count_reset_at = NOW() WHERE id = $1',
      [user.id]
    );
    user.scrape_count = 0;
  }
  return user;
}

// requireFeature('linkedin') -> 402/403 if the user's tier doesn't include it
function requireFeature(featureName) {
  return async (req, res, next) => {
    const tier = getTier(req.user.tier);
    if (!tier.features.includes(featureName)) {
      return res.status(403).json({
        error: `The "${featureName}" scraper is not available on the ${tier.label} plan.`,
        upgradeRequired: true,
      });
    }
    next();
  };
}

// Checks & increments the monthly scrape quota. `weight` = how many scrape
// "units" this request consumes (e.g. batch of 10 URLs = 10).
function enforceQuota(weightFn = () => 1) {
  return async (req, res, next) => {
    try {
      await resetIfNewMonth(req.user);
      const tier = getTier(req.user.tier);
      const weight = weightFn(req);

      if (req.user.scrape_count + weight > tier.monthlyScrapeLimit) {
        return res.status(429).json({
          error: `Monthly scrape limit reached (${tier.monthlyScrapeLimit} on ${tier.label} plan). Upgrade for more.`,
          upgradeRequired: true,
          used: req.user.scrape_count,
          limit: tier.monthlyScrapeLimit,
        });
      }

      if (weight > tier.maxUrlsPerBatch) {
        return res.status(400).json({
          error: `${tier.label} plan allows up to ${tier.maxUrlsPerBatch} items per request.`,
          upgradeRequired: true,
        });
      }

      req.scrapeWeight = weight;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireFeature, enforceQuota };
