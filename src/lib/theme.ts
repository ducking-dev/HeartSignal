/**
 * HeartSignal 테마 시스템
 * Light/Dark 테마 지원 및 테마 관리 유틸리티
 */

import { designTokens, type DesignTokens } from './design-tokens';

export interface Theme {
  colors: DesignTokens['colors'];
  spacing: DesignTokens['spacing'];
  typography: DesignTokens['typography'];
  animation: DesignTokens['animation'];
  shadows: DesignTokens['shadows'];
  borderRadius: DesignTokens['borderRadius'];
  zIndex: DesignTokens['zIndex'];
  name: 'light' | 'dark';
}

// Light Theme (기본 테마)
export const lightTheme: Theme = {
  ...designTokens,
  name: 'light',
};

// Dark Theme
export const darkTheme: Theme = {
  ...designTokens,
  name: 'dark',
  colors: {
    ...designTokens.colors,
    // Dark theme color overrides
    primary: {
      ...designTokens.colors.primary,
      50: '#831843',
      100: '#9D174D', 
      200: '#BE185D',
      300: '#D946A0',
      400: '#E95877',
      500: '#F472B6', // Lighter in dark mode
      600: '#F9A8D4',
      700: '#FBCFE8',
      800: '#FCE7F3',
      900: '#FDF2F8',
    },
    neutral: {
      ...designTokens.colors.neutral,
      50: '#111827',
      100: '#1F2937',
      200: '#374151',
      300: '#4B5563',
      400: '#6B7280',
      500: '#9CA3AF',
      600: '#D1D5DB',
      700: '#E5E7EB',
      800: '#F3F4F6',
      900: '#F9FAFB',
    },
  },
  shadows: {
    ...designTokens.shadows,
    sm: '0 1px 2px 0 rgb(255 255 255 / 0.05)',
    md: '0 4px 6px -1px rgb(255 255 255 / 0.1)',
    lg: '0 10px 15px -3px rgb(255 255 255 / 0.1)',
    xl: '0 20px 25px -5px rgb(255 255 255 / 0.1)',
  },
};

// 테마 유틸리티 함수
export const getThemeColor = (
  theme: Theme,
  colorPath: string
): string => {
  const pathArray = colorPath.split('.');
  let result: any = theme.colors;
  
  for (const key of pathArray) {
    result = result?.[key];
    if (result === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return theme.colors.neutral[500];
    }
  }
  
  return result;
};

// CSS 변수 생성 유틸리티
export const generateCSSVariables = (theme: Theme): Record<string, string> => {
  const cssVars: Record<string, string> = {};
  
  // Colors
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    cssVars[`--color-primary-${key}`] = value;
  });
  
  Object.entries(theme.colors.secondary).forEach(([key, value]) => {
    cssVars[`--color-secondary-${key}`] = value;
  });
  
  Object.entries(theme.colors.semantic).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value;
  });
  
  Object.entries(theme.colors.neutral).forEach(([key, value]) => {
    cssVars[`--color-neutral-${key}`] = value;
  });
  
  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });
  
  // Typography
  cssVars['--font-sans'] = theme.typography.fontFamily.sans.join(', ');
  cssVars['--font-mono'] = theme.typography.fontFamily.mono.join(', ');
  
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });
  
  // Animation
  Object.entries(theme.animation.duration).forEach(([key, value]) => {
    cssVars[`--duration-${key}`] = value;
  });
  
  Object.entries(theme.animation.easing).forEach(([key, value]) => {
    cssVars[`--easing-${key}`] = value;
  });
  
  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    cssVars[`--shadow-${key}`] = value;
  });
  
  // Border Radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value;
  });
  
  return cssVars;
};

// 테마별 클래스명 생성
export const getThemeClassName = (theme: Theme): string => {
  return `theme-${theme.name}`;
};

// 시스템 다크모드 감지
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};

// 테마 전환 애니메이션
export const themeTransition = {
  duration: designTokens.animation.duration.normal,
  easing: designTokens.animation.easing.easeInOut,
};

