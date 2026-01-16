import type { Config } from 'tailwindcss';
import { designTokens } from './src/lib/design-tokens';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // HeartSignal 디자인 토큰 적용
      colors: {
        // 기존 shadcn-ui 컬러 유지
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        
        // HeartSignal 브랜드 컬러
        primary: designTokens.colors.primary,
        secondary: designTokens.colors.secondary,
        neutral: designTokens.colors.neutral,
        
        // Semantic 컬러
        success: designTokens.colors.semantic.success,
        warning: designTokens.colors.semantic.warning,
        danger: designTokens.colors.semantic.danger,
        info: designTokens.colors.semantic.info,
        
        // 기본 컬러
        white: designTokens.colors.white,
        black: designTokens.colors.black,
      },
      
      // 간격 시스템
      spacing: designTokens.spacing,
      
      // 타이포그래피
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      lineHeight: designTokens.typography.lineHeight,
      
      // 그림자
      boxShadow: designTokens.shadows,
      
      // 테두리 반지름
      borderRadius: {
        ...designTokens.borderRadius,
        // shadcn-ui 호환성 유지
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      // Z-index
      zIndex: designTokens.zIndex,
      
      // 애니메이션
      transitionDuration: designTokens.animation.duration,
      transitionTimingFunction: designTokens.animation.easing,
      
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // HeartSignal 커스텀 애니메이션
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-heart': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'pulse-heart': 'pulse-heart 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;
