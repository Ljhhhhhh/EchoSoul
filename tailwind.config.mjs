import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{vue,js,ts,jsx,tsx}'],
  prefix: '',
  theme: {
    extend: {
      colors: {
        // EchoSoul 色彩系统
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          DEFAULT: 'var(--color-primary-500)'
        },
        secondary: {
          50: 'var(--color-secondary-50)',
          100: 'var(--color-secondary-100)',
          200: 'var(--color-secondary-200)',
          300: 'var(--color-secondary-300)',
          400: 'var(--color-secondary-400)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
          700: 'var(--color-secondary-700)',
          800: 'var(--color-secondary-800)',
          900: 'var(--color-secondary-900)',
          DEFAULT: 'var(--color-secondary-700)'
        },
        neutral: {
          0: 'var(--color-neutral-0)',
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)'
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)'
      },
      fontFamily: {
        sans: 'var(--font-family-sans)',
        mono: 'var(--font-family-mono)'
      },
      fontSize: {
        'display-large': ['var(--font-size-display-large)', 'var(--line-height-display-large)'],
        'display-medium': ['var(--font-size-display-medium)', 'var(--line-height-display-medium)'],
        'display-small': ['var(--font-size-display-small)', 'var(--line-height-display-small)'],
        'headline-large': ['var(--font-size-headline-large)', 'var(--line-height-headline-large)'],
        'headline-medium': [
          'var(--font-size-headline-medium)',
          'var(--line-height-headline-medium)'
        ],
        'headline-small': ['var(--font-size-headline-small)', 'var(--line-height-headline-small)'],
        'title-large': ['var(--font-size-title-large)', 'var(--line-height-title-large)'],
        'title-medium': ['var(--font-size-title-medium)', 'var(--line-height-title-medium)'],
        'title-small': ['var(--font-size-title-small)', 'var(--line-height-title-small)'],
        'body-large': ['var(--font-size-body-large)', 'var(--line-height-body-large)'],
        'body-medium': ['var(--font-size-body-medium)', 'var(--line-height-body-medium)'],
        'body-small': ['var(--font-size-body-small)', 'var(--line-height-body-small)'],
        'label-large': ['var(--font-size-label-large)', 'var(--line-height-label-large)'],
        'label-medium': ['var(--font-size-label-medium)', 'var(--line-height-label-medium)'],
        'label-small': ['var(--font-size-label-small)', 'var(--line-height-label-small)']
      }
    }
  },
  plugins: [animate]
}
