/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // LinkedIn Pro Theme
        linkedin: {
          50: '#E7F3FF',
          100: '#D0E7FF',
          200: '#A8D4FF',
          300: '#7AB8FF',
          400: '#4D9DFF',
          500: '#0A66C2', // LinkedIn Blue
          600: '#004182',
          700: '#003366',
          800: '#002952',
          900: '#001F3F',
        },
        iris: {
          bg: '#F4F2EE', // LinkedIn background
          card: '#FFFFFF',
          border: '#E0E0E0',
          gold: '#F5B800',
          night: '#001F3F',
        }
      },
      backgroundColor: {
        'iris-bg': '#F4F2EE',
        'iris-card': '#FFFFFF',
      },
      borderColor: {
        'iris-border': '#E0E0E0',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'scale-102': 'scale-102 0.2s ease-in-out',
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'scale-102': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        },
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
