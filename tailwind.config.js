/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D71920',
          50: '#FEF2F2',
          100: '#FDE8E9',
          200: '#F8B4B7',
          300: '#F28186',
          400: '#E4484E',
          500: '#D71920',
          600: '#BA141A',
          700: '#930E14',
          800: '#6C0A0E',
          900: '#450609',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F7F7F8',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#202124',
          muted: '#6B7280',
        },
        accent: {
          gold: '#F59E0B',
          amber: '#D97706',
        },
        success: {
          DEFAULT: '#16803D',
          light: '#DCFCE7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'floating': '0 10px 25px -5px rgba(215, 25, 32, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
