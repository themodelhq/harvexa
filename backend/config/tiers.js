// Central definition of what each subscription tier can do.
// Adjust limits here — everything else in the app reads from this file.
//
// priceNGNKobo is what's actually charged via Paystack (Paystack's core
// markets bill in the smallest currency unit — kobo for NGN, 100 kobo = ₦1).
// priceUSD is shown on the pricing page as a rough reference figure only.
// Edit priceNGNKobo to match what you actually want to charge.
const TIERS = {
  free: {
    label: 'Free',
    monthlyScrapeLimit: 25,
    maxUrlsPerBatch: 3,
    features: ['url', 'search'],
    exportFormats: ['xlsx', 'csv'],
    priceUSD: 0,
    priceNGNKobo: 0,
  },
  pro: {
    label: 'Pro',
    monthlyScrapeLimit: 1000,
    maxUrlsPerBatch: 50,
    features: ['url', 'search', 'linkedin', 'category', 'batch'],
    exportFormats: ['xlsx', 'csv', 'json'],
    priceUSD: 19,
    priceNGNKobo: 1500000, // ₦15,000/month
  },
  business: {
    label: 'Business',
    monthlyScrapeLimit: 10000,
    maxUrlsPerBatch: 250,
    features: ['url', 'search', 'linkedin', 'category', 'batch', 'api_access'],
    exportFormats: ['xlsx', 'csv', 'json'],
    priceUSD: 49,
    priceNGNKobo: 4000000, // ₦40,000/month
  },
};

function getTier(name) {
  return TIERS[name] || TIERS.free;
}

module.exports = { TIERS, getTier };
