// Central definition of what each subscription tier can do.
// Adjust limits here — everything else in the app reads from this file.
const TIERS = {
  free: {
    label: 'Free',
    monthlyScrapeLimit: 25,
    maxUrlsPerBatch: 3,
    features: ['url', 'search'],
    exportFormats: ['xlsx', 'csv'],
    priceUSD: 0,
  },
  pro: {
    label: 'Pro',
    monthlyScrapeLimit: 1000,
    maxUrlsPerBatch: 50,
    features: ['url', 'search', 'linkedin', 'category', 'batch'],
    exportFormats: ['xlsx', 'csv', 'json'],
    priceUSD: 19,
  },
  business: {
    label: 'Business',
    monthlyScrapeLimit: 10000,
    maxUrlsPerBatch: 250,
    features: ['url', 'search', 'linkedin', 'category', 'batch', 'api_access'],
    exportFormats: ['xlsx', 'csv', 'json'],
    priceUSD: 49,
  },
};

function getTier(name) {
  return TIERS[name] || TIERS.free;
}

module.exports = { TIERS, getTier };
