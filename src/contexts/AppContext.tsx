'use client';

/**
 * AppContext - 애플리케이션 전역 상태 및 의존성 관리
 * SOLID 원칙의 Dependency Inversion을 적용한 컨텍스트
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { lightTheme, darkTheme, getSystemTheme, type Theme } from '@/lib/theme';
import type { LLMAdapter } from '@/domain/adapters/llm.openai';
import type { WebSpeechSTTAdapter } from '@/domain/adapters/stt.webspeech';

interface AppContextValue {
  // 테마 관리
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isInitialized: boolean;
  
  // 의존성 주입된 어댑터들
  llmAdapter: LLMAdapter | null;
  sttAdapter: WebSpeechSTTAdapter | null;
  
  // 어댑터 설정
  setLLMAdapter: (adapter: LLMAdapter) => void;
  setSTTAdapter: (adapter: WebSpeechSTTAdapter) => void;
  
  // 앱 상태
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

export function AppProvider({ children, initialTheme }: AppProviderProps) {
  // 테마 상태 관리 - 서버와 클라이언트 일관된 초기값 사용
  const [theme, setTheme] = useState<Theme>(() => {
    return initialTheme || lightTheme;
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 어댑터 상태 관리
  const [llmAdapter, setLLMAdapter] = useState<LLMAdapter | null>(null);
  const [sttAdapter, setSTTAdapter] = useState<WebSpeechSTTAdapter | null>(null);
  
  // 앱 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 클라이언트 초기화 로직 분리
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 실제 사용자 테마 설정 적용
    const savedTheme = localStorage.getItem('heartsignal-theme');
    if (savedTheme === 'dark') {
      setTheme(darkTheme);
    } else if (savedTheme === 'light') {
      setTheme(lightTheme);
    } else {
      // 저장된 설정이 없으면 시스템 테마 사용
      setTheme(getSystemTheme() === 'dark' ? darkTheme : lightTheme);
    }
    
    setIsInitialized(true);
  }, []);

  // 테마 변경 시 localStorage 저장 및 CSS 변수 적용
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;
    
    localStorage.setItem('heartsignal-theme', theme.name);
    
    // HTML 요소에 Tailwind 다크모드 클래스 적용 (v4.md 개선사항)
    const html = document.documentElement;
    if (theme.name === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // 기존 커스텀 CSS 변수도 유지 (브랜드 컬러용)
    const cssVars = generateCSSVariables(theme);
    Object.entries(cssVars).forEach(([property, value]) => {
      html.style.setProperty(property, value);
    });
    
    // body에 테마 클래스 적용 (기존 시스템과 호환성 유지)
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .concat(` theme-${theme.name}`)
      .trim();
      
  }, [theme, isInitialized]);
  
  // 시스템 테마 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('heartsignal-theme');
      if (!savedTheme) {
        setTheme(e.matches ? darkTheme : lightTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = () => {
    setTheme(current => current.name === 'light' ? darkTheme : lightTheme);
  };
  
  const contextValue: AppContextValue = {
    theme,
    setTheme,
    toggleTheme,
    isInitialized,
    llmAdapter,
    sttAdapter,
    setLLMAdapter,
    setSTTAdapter,
    isLoading,
    error,
    setError,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// 커스텀 훅
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// 테마만 필요한 경우를 위한 별도 훅
export function useTheme() {
  const { theme, setTheme, toggleTheme } = useApp();
  return { theme, setTheme, toggleTheme };
}

// CSS 변수 생성 함수 (theme.ts에서 가져와야 하지만 순환 참조 방지를 위해 여기에 구현)
function generateCSSVariables(theme: Theme): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  // Primary colors
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    cssVars[`--color-primary-${key}`] = value;
  });
  
  // Secondary colors
  Object.entries(theme.colors.secondary).forEach(([key, value]) => {
    cssVars[`--color-secondary-${key}`] = value;
  });
  
  // Semantic colors
  Object.entries(theme.colors.semantic).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value;
  });
  
  // Neutral colors
  Object.entries(theme.colors.neutral).forEach(([key, value]) => {
    cssVars[`--color-neutral-${key}`] = value;
  });
  
  // Special colors
  cssVars['--color-white'] = theme.colors.white;
  cssVars['--color-black'] = theme.colors.black;
  
  return cssVars;
}

