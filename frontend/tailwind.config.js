/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Classes injected dynamically via classList.add() in Events.jsx (deep-link highlight effect).
  // Tailwind's scanner cannot detect these at build time, so they must be safelisted explicitly.
  safelist: [
    'ring-4',
    'ring-[#00d084]',
    'ring-offset-2',
    'ring-offset-[#0b0f14]',
    'transition-all',
    'duration-500',
  ],

  theme: {
    extend: {
      colors: {
        'aws-navy': '#161d26',
        'sbg-green': '#00e582',
        deep:    '#161d26',
        'deep-2': '#131922',
        'deep-3': '#1d2632',
        orange: {
          DEFAULT: '#ff9900',
          light:   '#ffb84d',
          dim:     '#cc7a00',
        },
        glass: 'rgba(255,255,255,0.05)',
        'glass-border': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green':  '0 0 30px rgba(0,229,130,0.35)',
        'glow-sm':     '0 0 20px rgba(0,229,130,0.25)',
        'card-glass':  '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-up':      'fadeUp 0.7s ease-out forwards',
        'fade-in':      'fadeIn 0.5s ease-out forwards',
        'pulse-slow':   'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':        'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
