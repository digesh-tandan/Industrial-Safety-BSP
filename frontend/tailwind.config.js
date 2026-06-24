/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        scada: {
          bg: 'var(--scada-bg)',
          panel: 'var(--scada-panel)',
          border: 'var(--scada-border)',
          text: 'var(--scada-text)',
          muted: 'var(--scada-muted)',
        },
        steel: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: 'var(--steel-700)',
          800: 'var(--steel-800)',
          900: 'var(--steel-900)',
          950: '#070a13',
        },
        neon: {
          cyan: '#06b6d4',    // System active / scanning
          emerald: '#10b981', // PPE Compliant green
          crimson: '#ef4444', // Violation alert red
          amber: '#f59e0b',   // Restricted warning amber
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-cyan': '0 0 10px rgba(6, 182, 212, 0.5)',
        'neon-red': '0 0 10px rgba(239, 68, 68, 0.5)',
        'neon-green': '0 0 10px rgba(16, 185, 129, 0.5)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
