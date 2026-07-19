import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-sm text-cream/50">25 free scrapes a month, no card required.</p>

      <form onSubmit={handleSubmit} className="field-panel mt-8 space-y-4 p-6">
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        <div>
          <label className="mb-1 block text-xs font-mono uppercase text-cream/40">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" placeholder="Optional" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-mono uppercase text-cream/40">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@company.com" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-mono uppercase text-cream/40">Password</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="At least 8 characters" />
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-cream/50">
        Already have an account? <Link to="/login" className="text-accent2 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
