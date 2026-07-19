import React from 'react';

export default function UsageMeter({ user }) {
  if (!user) return null;
  const pct = Math.min(100, Math.round((user.scrapeCount / user.monthlyScrapeLimit) * 100));

  return (
    <div className="field-panel p-5">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-display font-semibold text-cream/90">Monthly scrape quota</span>
        <span className="font-mono text-accent2">
          {user.scrapeCount} / {user.monthlyScrapeLimit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-soil">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent2 to-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-cream/40">
        Resets on the 1st of each month · {user.tierLabel} plan
      </p>
    </div>
  );
}
