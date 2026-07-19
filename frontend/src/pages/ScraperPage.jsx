import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import ResultsPanel from '../components/ResultsPanel.jsx';
import UsageMeter from '../components/UsageMeter.jsx';

const CONFIG = {
  url: {
    title: 'URL Scraper',
    tagline: 'Paste one link per line. Harvexa visits each page and extracts title, price, description, and images.',
    placeholder: 'https://example.com/product/123\nhttps://example.com/product/456',
    endpoint: '/scrape/url',
    multiline: true,
    buildBody: (text) => ({ urls: text.split('\n').map((l) => l.trim()).filter(Boolean) }),
  },
  search: {
    title: 'Search Results Scraper',
    tagline: 'Scrape organic search engine results for any query.',
    placeholder: 'e.g. best budget noise cancelling headphones 2026',
    endpoint: '/scrape/search',
    multiline: false,
    buildBody: (text) => ({ query: text.trim(), limit: 25 }),
  },
  linkedin: {
    title: 'LinkedIn Discovery',
    tagline:
      'Surfaces publicly-indexed profile & company snippets for a name, role, or company — pulled from public search results, never from behind LinkedIn\u2019s login wall.',
    placeholder: 'e.g. "Jane Doe" Product Manager Lagos',
    endpoint: '/scrape/linkedin',
    multiline: false,
    buildBody: (text) => ({ query: text.trim(), limit: 20 }),
  },
  category: {
    title: 'Category / Listing Scraper',
    tagline: 'Point at a category or listing page — Harvexa finds every product/article link on it and scrapes each one.',
    placeholder: 'https://example.com/category/laptops',
    endpoint: '/scrape/category',
    multiline: false,
    buildBody: (text) => ({ url: text.trim(), limit: 20 }),
  },
};

export default function ScraperPage({ mode }) {
  const cfg = CONFIG[mode];
  const { user, refreshUser } = useAuth();
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setError('');
    setBusy(true);
    setResults(null);
    try {
      const { data } = await api.post(cfg.endpoint, cfg.buildBody(text));
      setResults(data.results);
      // fetch latest job id so we can export
      const jobsRes = await api.get('/scrape/jobs');
      if (jobsRes.data.jobs.length) setJobId(jobsRes.data.jobs[0].id);
      refreshUser();
    } catch (err) {
      setError(err?.response?.data?.error || 'Scrape failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold">{cfg.title}</h1>
      <p className="mt-2 max-w-2xl text-cream/50">{cfg.tagline}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <form onSubmit={handleSubmit} className="field-panel md:col-span-2 space-y-4 p-6">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
          {cfg.multiline ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={cfg.placeholder}
              rows={6}
              className="input-field"
            />
          ) : (
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={cfg.placeholder}
              className="input-field"
            />
          )}
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Harvesting…' : 'Run scrape'}
          </button>
        </form>
        <UsageMeter user={user} />
      </div>

      <ResultsPanel results={results} jobId={jobId} exportFormats={user?.exportFormats || ['xlsx', 'csv']} />
    </div>
  );
}
