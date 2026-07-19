const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
};

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

/**
 * Scrapes search results from DuckDuckGo's HTML endpoint (no JS, no API key
 * required, and it's explicitly designed to be scraped/linked to). Returns
 * title, url, and snippet for each organic result.
 */
async function scrapeSearch(query, limit = 20) {
  const { data } = await axios.get('https://html.duckduckgo.com/html/', {
    params: { q: query },
    headers: HEADERS,
    timeout: 20000,
  });

  const $ = cheerio.load(data);
  const results = [];

  $('.result').each((_, el) => {
    if (results.length >= limit) return;
    const titleEl = $(el).find('.result__title a').first();
    const title = clean(titleEl.text());
    let url = titleEl.attr('href') || '';
    const snippet = clean($(el).find('.result__snippet').text());

    // DuckDuckGo wraps result links in a redirect; unwrap the real target.
    const uddgMatch = url.match(/uddg=([^&]+)/);
    if (uddgMatch) url = decodeURIComponent(uddgMatch[1]);

    if (title && url) {
      results.push({ title, url, snippet, scrapedAt: new Date().toISOString() });
    }
  });

  return results;
}

module.exports = { scrapeSearch };
