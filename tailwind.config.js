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
        linkedin: {
          50: '#EDF3F8',
          100: '#DCE6F1',
          200: '#A8C5DC',
          300: '#70B5F9',
          400: '#378FE9',
          500: '#0A66C2',
          600: '#004182',
          700: '#09326C',
          800: '#062950',
          900: '#031D38',
        }
      },
      backgroundColor: {
        'iris-bg': '#F3F2EF',
        'iris-card': '#FFFFFF',
        'iris-dark': '#1B1F23',
      },
      boxShadow: {
        'subtle': '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.08)',
        'linkedin': '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.08)',
      },
      animation: {
        'scale-102': 'scale-102 0.2s ease-in-out',
      },
      keyframes: {
        'scale-102': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
