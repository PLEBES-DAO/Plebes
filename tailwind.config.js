module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      keyframes: {
        spinReel: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-100%)' },
        },
      },
      animation: {
        spinReel: 'spinReel 1s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-custom-groups'),
  ],
};
