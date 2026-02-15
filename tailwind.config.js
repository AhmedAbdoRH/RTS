/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1c594e',    // اللون الرسمي (أخضر غامق)
        secondary: '#ffffff',   // أبيض نقي
        accent: '#ffd453',     // لون الكتابة الرئيسي (ذهبي/أصفر)
        'rayan-green': '#26bd7e', // اللون الفرعي للتدرج
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};