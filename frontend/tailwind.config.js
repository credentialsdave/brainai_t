// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./src/**/*.{js,jsx,ts,tsx}"],  // Ensures Tailwind scans all components
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'segoe': ['Segoe UI', 'sans-serif'],
      },
      colors: {
        'dark-bg': '#242525',
        'login-bg': '#141718',
        'text-gray': '#ACADB9',
        'link-gray': '#AFAFAF',
      }
    },
  },
  plugins: [],
}