const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function firstMeta($, names) {
  for (const name of names) {
    const val =
      $(`meta[property="${name}"]`).attr('content') ||
      $(`meta[name="${name}"]`).attr('content');
    if (val) return clean(val);
  }
  return '';
}

function guessPrice($) {
  const priceSelectors = [
    '[itemprop="price"]',
    '.price',
    '[class*="price"]',
    '[data-price]',
    'span:contains("$")',
  ];
  for (const sel of priceSelectors) {
    const el = $(sel).first();
    if (el && el.length) {
      const txt = clean(el.attr('content') || el.text());
      const match = txt.match(/[\$£€₦]?\s?[\d.,]{2,}/);
      if (match) return clean(match[0]);
    }
  }
  return '';
}

/**
 * Scrapes a single URL and extracts a normalized record: title, description,
 * price (best-effort), main image, canonical url, and all outbound links.
 */
async function scrapeUrl(targetUrl) {
  const { data, status } = await axios.get(targetUrl, {
    headers: HEADERS,
    timeout: 20000,
    maxRedirects: 5,
    validateStatus: () => true,
  });

  if (status >= 400) {
    return { url: targetUrl, error: `Request failed with status ${status}` };
  }

  const $ = cheerio.load(data);

  const title =
    firstMeta($, ['og:title', 'twitter:title']) || clean($('title').first().text()) || clean($('h1').first().text());

  const description =
    firstMeta($, ['og:description', 'twitter:description', 'description']) ||
    clean($('p').first().text()).slice(0, 400);

  const image = firstMeta($, ['og:image', 'twitter:image']);
  const price = guessPrice($);
  const siteName = firstMeta($, ['og:site_name']) || new URL(targetUrl).hostname;

  const links = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('http')) links.add(href);
  });

  return {
    url: targetUrl,
    site: siteName,
    title,
    description,
    price,
    image,
    linkCount: links.size,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Category / listing page scraper: finds all product-like outbound links on
 * a page (heuristic: same-host links containing common product path tokens),
 * then scrapes each one, up to `limit`.
 */
async function scrapeCategory(listingUrl, limit = 15) {
  const { data } = await axios.get(listingUrl, { headers: HEADERS, timeout: 20000 });
  const $ = cheerio.load(data);
  const host = new URL(listingUrl).hostname;

  const candidates = new Set();
  $('a[href]').each((_, el) => {
    let href = $(el).attr('href');
    if (!href) return;
    try {
      const abs = new URL(href, listingUrl).href;
      if (new URL(abs).hostname === host) candidates.add(abs);
    } catch (_) {
      /* ignore malformed */
    }
  });

  const urls = Array.from(candidates).slice(0, limit);
  const results = [];
  for (const u of urls) {
    try {
      results.push(await scrapeUrl(u));
    } catch (err) {
      results.push({ url: u, error: err.message });
    }
  }
  return results;
}

module.exports = { scrapeUrl, scrapeCategory };
