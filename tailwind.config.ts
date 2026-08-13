/**
 * Tailwind 只承载新组件会复用的设计原语；实际主题值仍由 tokens.css 控制，
 * 这样浅色、深色以及站点配置切换时不会产生两套互相漂移的颜色系统。
 */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        'cream-paper': '#FFFDF9',
        strawberry: '#FF9EBB',
        sunny: '#FDFD96',
        mint: '#A7E9AF',
        chocolate: '#4A3B32',
        'ink-navy': '#2B2D42',
        'energy-blue': '#7CB9E8',
        'girl-pink': '#FFB7B2',
        'spark-yellow': '#FDFD96',
        'mint-pop': '#B4F8C8',
        'soft-navy': '#22223B',
        'violet-gray': '#4A4E69',
      },
      borderRadius: {
        scrapbook: '2rem',
      },
      borderWidth: {
        3: '3px',
        5: '5px',
        6: '6px',
      },
      boxShadow: {
        acrylic:
          'inset 0 2px 4px rgb(255 255 255 / 0.72), 0 8px 32px rgb(31 38 135 / 0.09)',
        sticker: '0.4rem 0.5rem 0 rgb(124 185 232 / 0.14), 0 1rem 2rem rgb(74 78 105 / 0.1)',
        'pop-pink': '6px 6px 0 #FF9EBB',
        'pop-mint': '6px 6px 0 #A7E9AF',
        'pop-ink': '6px 6px 0 #4A3B32',
        chunky: '0 6px 0 #4A3B32',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-bold': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        'spring-bounce': {
          '0%': { opacity: '0', transform: 'translateY(2.5rem) rotate(-5deg) scale(0.9)' },
          '70%': { opacity: '1', transform: 'translateY(-0.3rem) rotate(0.7deg) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(0) scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0)' },
          '35%': { transform: 'rotate(-5deg)' },
          '70%': { transform: 'rotate(4deg)' },
        },
        'jelly-release': {
          '0%': { transform: 'scaleX(0.92) scaleY(0.88)' },
          '62%': { transform: 'scaleX(1.04) scaleY(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'spring-bounce': 'spring-bounce 720ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        wiggle: 'wiggle 520ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'jelly-release': 'jelly-release 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
} as const
