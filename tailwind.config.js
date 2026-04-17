/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        primary: 'var(--primary)',
        text: 'var(--text)',
        card: 'var(--card)',
        border: 'var(--border)',
      },
    },
  },
  plugins: [],
}
