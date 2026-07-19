const { scrapeSearch } = require('./search');

/**
 * LinkedIn profiles/company pages sit behind a login wall and their ToS
 * prohibits automated scraping of member data. To stay on the right side
 * of that, this module does NOT log in, impersonate a user, or scrape
 * gated pages directly. Instead it surfaces the same publicly-indexed
 * snippets anyone can already see on a search engine results page
 * (name, headline, and public URL) via a `site:linkedin.com` search.
 *
 * For full profile data, users should use LinkedIn's own export tools or
 * the official LinkedIn API with proper authorization.
 */
async function scrapeLinkedIn(query, limit = 15) {
  const kind = /\/company\//i.test(query) || /company/i.test(query) ? 'company' : 'in';
  const searchQuery = `site:linkedin.com/${kind} ${query}`;
  const raw = await scrapeSearch(searchQuery, limit);

  return raw
    .filter((r) => r.url.includes('linkedin.com'))
    .map((r) => ({
      name: r.title.split(' | ')[0].split(' - ')[0].trim(),
      headline: r.snippet,
      profileUrl: r.url,
      source: 'public search index',
      scrapedAt: r.scrapedAt,
    }));
}

module.exports = { scrapeLinkedIn };
