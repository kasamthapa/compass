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
        'chart-blue': 'var(--chart-blue)',
        seal: 'var(--seal)',
        'grid-empty': 'var(--grid-empty)',
        overlay: 'var(--overlay)',
        tabbar: 'var(--tabbar-bg)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Karla', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      // Retuned in Phase 6A-ii for Fraunces/Karla's different optical
      // sizing (the scale below was originally tuned for Space Grotesk/
      // Instrument Sans). See DECISIONS.md for the reasoning behind each
      // change.
      fontSize: {
        'large-title': [
          '2.125rem',
          // fontWeight was 700, but only Fraunces 500/600 are loaded —
          // the browser was silently fake-bolding 600 into 700. Letter-
          // spacing loosened toward neutral (a serif reads more elegant
          // with open tracking than a tight geometric sans needs); line-
          // height opened slightly for Fraunces' taller x-height/more
          // expressive ascenders and descenders.
          { lineHeight: '1.2', letterSpacing: '0em', fontWeight: '600' },
        ],
        title: ['1.375rem', { lineHeight: '1.3', letterSpacing: '0em', fontWeight: '600' }],
        headline: ['1.0625rem', { lineHeight: '1.42', fontWeight: '600' }],
        body: ['1.0625rem', { lineHeight: '1.5' }],
        // Karla's x-height runs slightly taller than Instrument Sans' at
        // the same point size — subhead/caption/caption-2 line-heights
        // opened a touch for comfortable reading at small sizes.
        subhead: ['0.9375rem', { lineHeight: '1.5' }],
        caption: ['0.8125rem', { lineHeight: '1.45' }],
        'caption-2': ['0.6875rem', { lineHeight: '1.35', letterSpacing: '0.01em' }],
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
        'content-wide': 'var(--content-max-width-wide)',
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
        elevated: 'var(--shadow-elevated)',
      },
      transitionTimingFunction: {
        ios: 'var(--ease-ios)',
      },
    },
  },
  plugins: [],
}
