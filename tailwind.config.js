/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'container-bg': 'rgba(15, 23, 42, 0.7)',
        'input-bg': 'rgba(30, 41, 59, 0.7)',
        'primary-text': '#E0E0E0',
        'secondary-text': '#B0B0B0',
        'border-color': 'rgba(51, 65, 85, 0.7)',
        'accent': '#00A8FF',
        'accent-hover': '#0087CC',
        'error-bg': 'rgba(220, 38, 38, 0.8)',
      },
    },
  },
  plugins: [],
}
