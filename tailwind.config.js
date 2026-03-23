/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'surface-dark': 'var(--surface-dark)',
        'surface-card': 'var(--surface-card)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-light': 'var(--surface-light)',
        'primary': 'var(--primary)',
        'accent': 'var(--accent)',
        'success': 'var(--success)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'neutral': 'var(--neutral)',
        'danger': 'var(--danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        chip: '20px',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '160ms',
        slow: '220ms',
      },
      animation: {
        'slide-up': 'slideUp 220ms ease-out both',
        'fade-in': 'fadeIn 160ms ease-out both',
        'check-morph': 'checkMorph 120ms ease-out',
        'pulse-ring': 'pulseRing 160ms ease-out',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        checkMorph: {
          '0%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.08)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
