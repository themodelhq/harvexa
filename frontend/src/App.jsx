import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ScraperPage from './pages/ScraperPage.jsx';
import History from './pages/History.jsx';
import Pricing from './pages/Pricing.jsx';
import BillingCallback from './pages/BillingCallback.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/billing/callback" element={<ProtectedRoute><BillingCallback /></ProtectedRoute>} />
          <Route path="/scrape/url" element={<ProtectedRoute><ScraperPage mode="url" /></ProtectedRoute>} />
          <Route path="/scrape/search" element={<ProtectedRoute><ScraperPage mode="search" /></ProtectedRoute>} />
          <Route path="/scrape/linkedin" element={<ProtectedRoute><ScraperPage mode="linkedin" /></ProtectedRoute>} />
          <Route path="/scrape/category" element={<ProtectedRoute><ScraperPage mode="category" /></ProtectedRoute>} />

          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
