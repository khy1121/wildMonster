/** @type {import('tailwindcss').Config} */
module.exports = {
  // Include both 'content' and legacy 'purge' for compatibility
  content: [
    './index.html',
    './**/*.{ts,tsx,html}'
  ],
  purge: [
    './index.html',
    './**/*.{ts,tsx,html}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
