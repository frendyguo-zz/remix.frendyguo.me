module.exports = {
  content: ["./app/**/*.{ts,tsx,js,jsx}"],
  darkMode: 'class',
  theme: {
    screens: {
      'tablet': '768px',
      'laptop': '1024px',
      'desktop': '1280px'
    },
    opacity: {
      relax: '0.87'
    },
    textOpacity: {
      relax: '0.87'
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      dark: '#1d1f3a',
      black: '#000000',
      neutral: {
        500: '#0f172a',
        400: '#1e293b',
        300: '#475569',
        200: '#e2e8f0',
        100: '#f1f5f9',
        50: '#f8fafc'
      },
      blue: {
        500: '#1e3a8a',
        400: '#1d4ed8',
        300: '#3b82f6',
        200: '#bfdbfe',
        100: '#dbeafe'
      },
      indigo: {
        500: '#4c1d95',
        400: '#6d28d9',
        300: '#8b5cf6',
        200: '#c4b5fd',
        100: '#ede9fe'
      },
      orange: {
        500: '#f97316'
      },
      fuchsia: {
        400: '#e879f9'
      }
    },
    extend: {
      fontFamily: {
        'default': ['-apple-system', 'Segoe UI', 'Helvetica Neue', 'Helvetica', 'Roboto', 'Arial', 'sans-serif', 'system-ui', 'Apple Color Emoji', 'Segoe UI Emoji'],
        'sans-serif': ['Nunito Sans', 'sans-serif'],
        'alegreya': ['Alegreya Sans SC', 'sans-serif']
      }
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography')
  ]
}
