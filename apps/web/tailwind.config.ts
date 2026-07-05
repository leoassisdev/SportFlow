import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        ink: {
          50: '#F5F7FB',
          100: '#E7ECF5',
          200: '#CBD3E3',
          300: '#94A1BC',
          400: '#5C6A88',
          500: '#3B4661',
          600: '#252E48',
          700: '#1E2740',
          800: '#151B2F',
          900: '#0F1424',
          950: '#0A0E1A',
        },
        brand: {
          50: '#E6F6FF',
          100: '#B7E3FF',
          200: '#7ECDFF',
          300: '#40B4FF',
          400: '#1AA3FF',
          500: '#00A3FF',
          600: '#0088FF',
          700: '#0066CC',
          800: '#004E9C',
          900: '#003872',
          DEFAULT: '#00A3FF',
        },
        accent: {
          50: '#FFEBD9',
          100: '#FFD3AB',
          200: '#FFB170',
          300: '#FF8E36',
          400: '#FF7A18',
          500: '#FF6B00',
          600: '#E85A00',
          700: '#C44A00',
          DEFAULT: '#FF6B00',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['Barlow', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 32px rgba(0,163,255,0.35)',
        glowSm: '0 0 12px rgba(0,163,255,0.30)',
        glowAccent: '0 0 32px rgba(255,107,0,0.40)',
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(circle at 20% 20%, rgba(0,163,255,0.12), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,107,0,0.10), transparent 45%)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(255,107,0,0.6)' },
          '50%': { boxShadow: '0 0 24px rgba(255,107,0,0.6)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
