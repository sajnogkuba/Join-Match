export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          purple: {
            500: '#A252DB',
            600: '#9539D8',
            700: '#871ADB',
            800: '#7815C1',
            900: '#6812A6',
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        boxShadow: {
          'card': '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
        transitionDuration: {
          '400': '400ms',
        },
      },
    },
    plugins: [],
  }