import React from 'react';
import { Link } from 'react-router-dom';

const MODES = [
  {
    title: 'URL Scraper',
    desc: 'Drop in one or a batch of links. Harvexa pulls title, price, description, images, and metadata from each.',
  },
  {
    title: 'Search Results',
    desc: 'Scrape organic search results for any query — titles, URLs, and snippets, ready to analyze.',
  },
  {
    title: 'LinkedIn Discovery',
    desc: 'Surface publicly-indexed profile and company snippets for a name, role, or company — no login walls crossed.',
  },
  {
    title: 'Category & Listing Pages',
    desc: 'Point at a listing page and Harvexa fans out to every product/article link it finds, scraping each one.',
  },
];

export default function Landing() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full border border-soil px-3 py-1 font-mono text-xs text-accent2">
            field-tested data harvesting
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-6xl">
            Point it anywhere.
            <br />
            <span className="text-accent">Reap the data.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-cream/60">
            Harvexa scrapes product pages, search results, listing pages, and public LinkedIn
            snippets — then threshes it all into a clean Excel file you can actually use.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">Start harvesting — it's free</Link>
            <Link to="/pricing" className="btn-ghost">See plans</Link>
          </div>
          <p className="mt-4 font-mono text-xs text-cream/30">
            No credit card required · 25 free scrapes every month
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-8 font-display text-2xl font-semibold">Four ways in, one format out</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {MODES.map((m) => (
            <div key={m.title} className="field-panel p-6">
              <h3 className="font-display text-lg font-semibold text-accent2">{m.title}</h3>
              <p className="mt-2 text-sm text-cream/60">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="field-panel flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold">Every harvest lands in Excel</h2>
            <p className="mt-2 max-w-md text-sm text-cream/60">
              One click turns any job — a batch of URLs, a search query, a listing page — into a
              downloadable .xlsx, .csv, or .json file.
            </p>
          </div>
          <Link to="/register" className="btn-primary whitespace-nowrap">Create free account</Link>
        </div>
      </section>
    </div>
  );
}
