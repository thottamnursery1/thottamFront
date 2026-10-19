/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Full Tailwind color scales (needed by dashboard UI) ───────
        emerald:  colors.emerald,
        amber:    colors.amber,
        blue:     colors.blue,
        sky:      colors.sky,
        purple:   colors.purple,
        cyan:     colors.cyan,
        rose:     colors.rose,
        teal:     colors.teal,

        // ── Brand / project-specific tokens ───────────────────────────
        // NOTE: 'emerald' the single hex is renamed to 'brand-green'
        // to avoid colliding with the full emerald scale above.
        forest:      '#173F35',
        'brand-green': '#287A55',   // was: emerald: '#287A55'
        mint:        '#CDE8D5',
        ivory:       '#F8F6EF',
        sageglass:   '#E3EBDD',

        primary: {
          50:  '#F3F8F5',
          100: '#CDE8D5',
          200: '#A9D4BA',
          300: '#6FB592',
          400: '#3E946C',
          500: '#287A55',
          600: '#206548',
          700: '#173F35',
          800: '#12312A',
          900: '#0C221D',
          950: '#071511',
        },
        sage: {
          50:  '#F7F8F4',
          100: '#E3EBDD',
          200: '#D3DFCC',
          300: '#B7C9AE',
          400: '#8FA888',
          500: '#6E8B68',
          600: '#557052',
          700: '#3E5340',
          800: '#2C3B2E',
          900: '#1C261C',
        },
        terracotta: {
          50:  '#fbf4ef',
          100: '#f3e2d6',
          200: '#e6c4ae',
          300: '#d59a7c',
          400: '#C77B55',
          500: '#C77B55',
          600: '#b06845',
          700: '#8d5136',
          800: '#673c28',
          900: '#42261a',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },

        // ── Semantic tokens ────────────────────────────────────────────
        cream:  '#F8F6EF',
        ink:    '#173F35',
        muted:  '#5C6B63',
        line:   'rgba(23, 63, 53, 0.10)',

        // ── Sidebar tokens ────────────────────────────────────────────
        sidebar: {
          bg:     '#0F2820',
          border: 'rgba(255,255,255,0.07)',
          text:   'rgba(255,255,255,0.70)',
          muted:  'rgba(255,255,255,0.38)',
          active: 'rgba(255,255,255,0.10)',
          hover:  'rgba(255,255,255,0.06)',
          accent: '#3E946C',
        },
      },

      fontFamily: {
        sans:    ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      spacing: {
        18:                  '4.5rem',
        22:                  '5.5rem',
        sidebar:             '240px',
        'sidebar-collapsed': '68px',
      },

      width: {
        sidebar:             '240px',
        'sidebar-collapsed': '68px',
      },

      boxShadow: {
        card:        '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
        sidebar:     '4px 0 24px rgba(0,0,0,0.18)',
        popover:     '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
        'inner-sm':  'inset 0 1px 2px rgba(0,0,0,0.06)',
      },

      backgroundImage: {
        'hero-pattern':    "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%2328623D\" fill-opacity=\"0.04\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'sidebar-gradient': 'linear-gradient(180deg, #0F2820 0%, #0C221D 100%)',
        'card-gradient':    'linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(248,246,239,0.85) 100%)',
        'stat-primary':     'linear-gradient(135deg, #173F35 0%, #287A55 100%)',
        'stat-teal':        'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)',
        'stat-amber':       'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
        'stat-rose':        'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
      },

      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'fade-in-up':    'fadeInUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        shimmer:         'shimmer 1.5s infinite',
        float:           'float 3s ease-in-out infinite',
      },

      keyframes: {
        fadeIn:      { from: { opacity: 0 },                             to: { opacity: 1 } },
        fadeInUp:    { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: 0, transform: 'translateX(-12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },

      transitionProperty: {
        sidebar: 'width, transform',
      },

      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
};
