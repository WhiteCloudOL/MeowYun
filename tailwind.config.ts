/** Tailwind 只映射 tokens.css；旧组件的工具类保持兼容，不维护另一套主题值。 */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        'cream-paper': 'var(--color-surface)',
        strawberry: 'var(--color-primary)',
        sunny: 'var(--color-accent-soft)',
        mint: 'var(--color-secondary)',
        chocolate: 'var(--color-text)',
        'ink-navy': 'var(--color-text)',
        'energy-blue': 'var(--color-blue)',
        'girl-pink': 'var(--color-primary)',
        'spark-yellow': 'var(--color-accent-soft)',
        'mint-pop': 'var(--color-secondary)',
        'soft-navy': 'var(--color-text)',
        'violet-gray': 'var(--color-text-secondary)',
      },
      borderRadius: { scrapbook: 'var(--radius-large)' },
      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
        'spring-bold': 'var(--ease-spring-bold)',
      },
    },
  },
} as const
