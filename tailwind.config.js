/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/client/index.html',
    './src/client/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a2e',
        smoke: '#fafafa',
        surface: '#ffffff',
        'surface-dark': '#16213e',
        accent: '#e94560',
        'accent-hover': '#d63d56',
        muted: '#64748b',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
