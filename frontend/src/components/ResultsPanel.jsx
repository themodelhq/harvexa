import React from 'react';
import { downloadExport } from '../api';

export default function ResultsPanel({ results, jobId, exportFormats = ['xlsx', 'csv'] }) {
  if (!results || !results.length) return null;

  const columns = Array.from(
    results.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set())
  ).slice(0, 6);

  async function handleExport(format) {
    try {
      await downloadExport(jobId, format, `harvexa_export.${format}`);
    } catch (err) {
      alert(err?.response?.data?.error || 'Export failed.');
    }
  }

  return (
    <div className="field-panel mt-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-soil px-5 py-4">
        <h3 className="font-display font-semibold">
          {results.length} result{results.length === 1 ? '' : 's'}
        </h3>
        <div className="flex gap-2">
          {exportFormats.map((fmt) => (
            <button key={fmt} onClick={() => handleExport(fmt)} className="btn-ghost !px-3 !py-1.5 text-xs uppercase">
              Export .{fmt}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-soil text-cream/50">
              {columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-5 py-3 font-mono text-xs uppercase tracking-wide">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.slice(0, 50).map((row, i) => (
              <tr key={i} className="border-b border-soil/60 hover:bg-soil/30">
                {columns.map((c) => (
                  <td key={c} className="max-w-xs truncate px-5 py-3 text-cream/80">
                    {typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {results.length > 50 && (
        <p className="border-t border-soil px-5 py-3 text-xs text-cream/40">
          Showing first 50 of {results.length} — export to see everything.
        </p>
      )}
    </div>
  );
}
