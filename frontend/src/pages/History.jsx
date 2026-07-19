import React, { useEffect, useState } from 'react';
import api, { downloadExport } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function History() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/scrape/jobs')
      .then(({ data }) => setJobs(data.jobs))
      .finally(() => setLoading(false));
  }, []);

  async function handleExport(jobId, format) {
    try {
      await downloadExport(jobId, format, `harvexa_${jobId.slice(0, 8)}.${format}`);
    } catch (err) {
      alert(err?.response?.data?.error || 'Export failed.');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold">Job history</h1>
      <p className="mt-2 text-cream/50">Every scrape you've run, ready to re-export any time.</p>

      {loading ? (
        <p className="mt-8 text-cream/40">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="field-panel mt-8 p-6 text-sm text-cream/40">No jobs yet.</p>
      ) : (
        <div className="field-panel mt-8 divide-y divide-soil">
          {jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <span className="font-mono text-xs uppercase text-accent2">{j.job_type}</span>
                <p className="mt-0.5 max-w-md truncate text-sm text-cream/80">{j.query}</p>
                <p className="text-xs text-cream/30">
                  {new Date(j.created_at).toLocaleString()} · {j.result_count} results
                </p>
              </div>
              <div className="flex gap-2">
                {(user?.exportFormats || ['xlsx', 'csv']).map((fmt) => (
                  <button key={fmt} onClick={() => handleExport(j.id, fmt)} className="btn-ghost !px-3 !py-1.5 text-xs uppercase">
                    .{fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
