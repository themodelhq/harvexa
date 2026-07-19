/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#12130f',
        panel: '#1c2018',
        soil: '#262a1f',
        accent: '#e8a33d',
        accent2: '#8fae4f',
        cream: '#f3ead9',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(circle at 15% 10%, rgba(232,163,61,0.16), transparent 40%), radial-gradient(circle at 85% 0%, rgba(143,174,79,0.14), transparent 45%)',
        rows:
          'repeating-linear-gradient(180deg, rgba(243,234,217,0.035) 0px, rgba(243,234,217,0.035) 1px, transparent 1px, transparent 34px)',
      },
    },
  },
  plugins: [],
};
