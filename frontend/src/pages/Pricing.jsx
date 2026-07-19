import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '₦0',
    blurb: 'Try the harvest before committing.',
    features: ['25 scrapes / month', 'URL & search scraping', 'Excel + CSV export', 'Up to 3 URLs per batch'],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₦15,000',
    blurb: 'For recruiters, marketers, and researchers.',
    features: [
      '1,000 scrapes / month',
      'All scraper modes incl. LinkedIn & category',
      'Excel, CSV & JSON export',
      'Up to 50 URLs per batch',
    ],
    highlight: true,
  },
  {
    key: 'business',
    name: 'Business',
    price: '₦40,000',
    blurb: 'For teams running scrapes at scale.',
    features: ['10,000 scrapes / month', 'Everything in Pro', 'API access', 'Up to 250 URLs per batch'],
  },
];

export default function Pricing() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [busyPlan, setBusyPlan] = useState(null);
  const [message, setMessage] = useState('');
  const [paystackConfigured, setPaystackConfigured] = useState(null);

  useEffect(() => {
    api.get('/billing/plans').then(({ data }) => setPaystackConfigured(data.paystackConfigured)).catch(() => {});
  }, []);

  async function handleChoose(planKey) {
    if (!user) return navigate('/register');
    if (planKey === user.tier) return;
    setBusyPlan(planKey);
    setMessage('');
    try {
      const { data } = await api.post('/billing/initialize', { tier: planKey });

      if (data.requiresPayment) {
        // Real Paystack checkout — send the browser to Paystack's own
        // hosted payment page. Card details never touch our servers.
        window.location.href = data.authorizationUrl;
        return;
      }

      // Free tier switch, or demo mode with no Paystack key configured yet.
      await refreshUser();
      setMessage(
        data.demoMode
          ? `Demo mode: switched to ${planKey} instantly (no PAYSTACK_SECRET_KEY set on the backend yet).`
          : `You're now on the ${planKey} plan.`
      );
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Could not change plan.');
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">Simple, scrape-based pricing</h1>
        <p className="mt-3 text-cream/50">Pay for what you harvest. Cancel any time.</p>
        {paystackConfigured === false && (
          <p className="mx-auto mt-4 max-w-lg rounded-lg bg-accent/10 px-4 py-2 text-xs text-accent">
            Payments are running in demo mode — set <code className="font-mono">PAYSTACK_SECRET_KEY</code> on
            the backend to accept real payments via Paystack.
          </p>
        )}
      </div>

      {message && (
        <p className="mx-auto mt-6 max-w-md rounded-lg bg-accent2/10 px-4 py-2 text-center text-sm text-accent2">
          {message}
        </p>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`field-panel p-6 ${p.highlight ? 'border-accent ring-1 ring-accent/40' : ''}`}
          >
            {p.highlight && (
              <span className="mb-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-mono text-base">
                Most popular
              </span>
            )}
            <h3 className="font-display text-xl font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-cream/50">{p.blurb}</p>
            <p className="mt-4 font-display text-3xl font-bold">
              {p.price}
              <span className="text-base font-normal text-cream/40">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-cream/70">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-accent2">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleChoose(p.key)}
              disabled={busyPlan === p.key || user?.tier === p.key}
              className={`mt-6 w-full ${p.highlight ? 'btn-primary' : 'btn-ghost'}`}
            >
              {user?.tier === p.key
                ? 'Current plan'
                : busyPlan === p.key
                ? 'Redirecting to Paystack…'
                : p.key === 'free'
                ? `Switch to ${p.name}`
                : `Pay with Paystack`}
            </button>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-cream/30">
        Paid plans are charged securely through Paystack's hosted checkout — Harvexa never sees
        or stores your card details.
      </p>
    </div>
  );
}
