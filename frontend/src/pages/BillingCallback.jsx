import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function BillingCallback() {
  const [params] = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('Confirming your payment with Paystack…');

  useEffect(() => {
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found in the URL.');
      return;
    }

    api
      .get(`/billing/verify/${encodeURIComponent(reference)}`)
      .then(async ({ data }) => {
        await refreshUser();
        setStatus('success');
        setMessage(`Payment confirmed — you're now on the ${data.user.tierLabel} plan.`);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.response?.data?.error || 'Could not verify this payment.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="field-panel w-full p-8">
        <h1 className="font-display text-2xl font-bold">
          {status === 'verifying' && 'Confirming payment…'}
          {status === 'success' && '✓ Payment successful'}
          {status === 'error' && 'Payment could not be confirmed'}
        </h1>
        <p className="mt-3 text-sm text-cream/60">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
          {status === 'error' && (
            <Link to="/pricing" className="btn-ghost">Back to pricing</Link>
          )}
        </div>
      </div>
    </div>
  );
}
