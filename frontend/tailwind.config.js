
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#60a5fa',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        'gradient-light': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      },
    },
  },
  plugins: [],
  important: true,
}; 