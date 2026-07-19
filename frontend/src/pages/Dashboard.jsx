import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UsageMeter from '../components/UsageMeter.jsx';
import api from '../api';

const MODES = [
  { to: '/scrape/url', title: 'URL Scraper', desc: 'Scrape one or many links at once', feature: 'url' },
  { to: '/scrape/search', title: 'Search Results', desc: 'Pull organic results for a query', feature: 'search' },
  { to: '/scrape/linkedin', title: 'LinkedIn Discovery', desc: 'Public profile & company snippets', feature: 'linkedin' },
  { to: '/scrape/category', title: 'Category Scraper', desc: 'Fan out across a listing page', feature: 'category' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get('/scrape/jobs').then(({ data }) => setJobs(data.jobs.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold">Hey{user?.fullName ? `, ${user.fullName}` : ''} 👋</h1>
      <p className="mt-1 text-cream/50">Pick a harvesting mode to get started.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
          {MODES.map((m) => {
            const locked = !user?.features?.includes(m.feature);
            return (
              <Link
                key={m.to}
                to={locked ? '/pricing' : m.to}
                className="field-panel group p-5 hover:border-accent2 transition"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold">{m.title}</h3>
                  {locked && <span className="rounded-full bg-soil px-2 py-0.5 text-[10px] font-mono text-accent">PRO</span>}
                </div>
                <p className="mt-1 text-sm text-cream/50">{m.desc}</p>
              </Link>
            );
          })}
        </div>
        <UsageMeter user={user} />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent jobs</h2>
          <Link to="/history" className="text-sm text-accent2 hover:underline">View all</Link>
        </div>
        {jobs.length === 0 ? (
          <p className="field-panel p-6 text-sm text-cream/40">
            Nothing harvested yet — run your first scrape to see it here.
          </p>
        ) : (
          <div className="field-panel divide-y divide-soil">
            {jobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <span className="font-mono uppercase text-accent2">{j.job_type}</span>
                  <span className="ml-3 text-cream/70">{j.query.slice(0, 60)}</span>
                </div>
                <span className="text-cream/40">{j.result_count} results</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
