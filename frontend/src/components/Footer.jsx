import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-soil/80 py-8 text-center text-xs text-cream/30">
      <p>Harvexa © {new Date().getFullYear()} — scrape responsibly, respect robots.txt & site terms.</p>
    </footer>
  );
}
