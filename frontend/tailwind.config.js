/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      extend: {
        animation: {
          'gradient-x': 'animatedGradient var(--speed, 8s) linear infinite',
        },
        keyframes: {
          animatedGradient: {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '100% 50%' },
          },
        },
        colors: {
          neon: {
            bg: '#0f0f0f',
            text: '#39ff14',
            accent: '#00ffff',
          },
          retro: {
            bg: '#fdf6e3',
            text: '#b58900',
            accent: '#d33682',
          },
        },
      },
    }
  },
  plugins: [require('tailwind-scrollbar'), require('tailwind-scrollbar-hide')],
};

