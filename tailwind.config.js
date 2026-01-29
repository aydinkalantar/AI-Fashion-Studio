/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // This enables the dark mode logic your app uses
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      }
    },
  },
  plugins: [],
}
