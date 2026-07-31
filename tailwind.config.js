/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'border-hairline': 'var(--border-hairline)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-faint': 'var(--text-faint)',
        accent: 'var(--accent)',
        'accent-on': 'var(--accent-on)',
        'accent-wash': 'var(--accent-wash)',
        'accent-ring': 'var(--accent-ring)',
        good: 'var(--good)',
        skip: 'var(--skip-fill)',
        overlay: 'var(--overlay)',
        tabbar: 'var(--tabbar-bg)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Instrument Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'large-title': [
          '2.125rem',
          { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' },
        ],
        title: ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        headline: ['1.0625rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1.0625rem', { lineHeight: '1.5' }],
        subhead: ['0.9375rem', { lineHeight: '1.45' }],
        caption: ['0.8125rem', { lineHeight: '1.4' }],
        'caption-2': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.01em' }],
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        9: 'var(--space-9)',
        nav: 'var(--nav-height)',
        rail: 'var(--rail-width)',
      },
      maxWidth: {
        content: 'var(--content-max-width)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        fab: 'var(--shadow-fab)',
        sheet: 'var(--shadow-sheet)',
      },
      transitionTimingFunction: {
        ios: 'var(--ease-ios)',
      },
    },
  },
  plugins: [],
}
