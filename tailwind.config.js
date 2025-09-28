/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sui-blue': '#4F46E5',
        'sui-dark-blue': '#1E40AF',
        'sui-light-blue': '#A0EFE5',
        'sui-very-light-blue': '#E0F7FA',
        'sui-white': '#FAFAFA',
        'sui-soft-white': '#F8F9FA',
        'quiz-green': '#10B981',
        'quiz-red': '#EF4444',
        'quiz-yellow': '#F59E0B',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}

