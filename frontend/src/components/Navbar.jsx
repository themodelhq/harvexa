import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-soil/80 bg-base/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-base">H</span>
          Harvexa
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-cream/70 md:flex">
          {user && (
            <>
              <Link to="/dashboard" className="hover:text-accent2">Dashboard</Link>
              <Link to="/scrape/url" className="hover:text-accent2">URL Scraper</Link>
              <Link to="/scrape/search" className="hover:text-accent2">Search</Link>
              <Link to="/scrape/linkedin" className="hover:text-accent2">LinkedIn</Link>
              <Link to="/history" className="hover:text-accent2">History</Link>
            </>
          )}
          <Link to="/pricing" className="hover:text-accent2">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden rounded-full border border-soil px-3 py-1 text-xs font-mono text-accent2 sm:inline">
                {user.tierLabel} plan
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn-ghost !px-4 !py-1.5 text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !px-4 !py-1.5 text-sm">Log in</Link>
              <Link to="/register" className="btn-primary !px-4 !py-1.5 text-sm">Start free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
