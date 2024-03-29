/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx,md,mdx,njk,twig,vue,astro}'],
  theme: {
    fontSize: {
      xs: ['var(--step--2)', { lineHeight: '1rem' }],
      sm: ['var(--step--1)', { lineHeight: '1.25rem' }],
      base: ['var(--step-0)', { lineHeight: '1.5rem' }],
      lg: ['var(--step-1)', { lineHeight: '1.75rem' }],
      xl: ['var(--step-2)', { lineHeight: '1.75rem' }],
      '2xl': ['var(--step-3)', { lineHeight: '2rem' }],
      '3xl': ['var(--step-4)', { lineHeight: '2.25rem' }],
      '4xl': ['var(--step-5)', { lineHeight: '2.5rem' }],
      '5xl': ['var(--step-6)', { lineHeight: '1' }],
      '6xl': ['var(--step-7)', { lineHeight: '1' }],
      '7xl': ['var(--step-8)', { lineHeight: '1' }],
      '8xl': ['var(--step-9)', { lineHeight: '1' }],
      '9xl': ['var(--step-10)', { lineHeight: '1' }],
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            fontSize: 'var(--step-0)',
            // a: {
            //   '&:hover': {
            //     color: 'var(--colour-accent)',
            //   },
            // },
          },
        },
      },

      spacing: {
        '4xs': 'var(--space-4xs)',
        '3xs': 'var(--space-3xs)',
        '2xs': 'var(--space-2xs)',
        xs: 'var(--space-xs)',
        s: 'var(--space-s)',
        m: 'var(--space-m)',
        l: 'var(--space-l)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  // darkMode: ['class', '[data-mode="dark"]'],
};
