'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/enhanced/AnimatedButton';
import { useTheme } from '@/contexts/AppContext';

/**
 * Hydration 안전한 테마 토글 컴포넌트
 * SSR/CSR 불일치 문제 해결
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 컴포넌트가 마운트된 후에만 테마 상태를 표시
  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트되기 전에는 기본 아이콘만 표시 (Hydration 문제 방지)
  if (!mounted) {
    return (
      <AnimatedButton
        variant="ghost"
        size="sm"
        animation="bounce"
        className="h-8 w-8 p-0"
        aria-label="테마 전환"
        disabled
      >
        <Sun className="h-4 w-4" />
      </AnimatedButton>
    );
  }

  return (
    <AnimatedButton
      variant="ghost"
      size="sm"
      animation="bounce"
      onClick={toggleTheme}
      className="h-8 w-8 p-0"
      aria-label={`${theme.name === 'light' ? '다크' : '라이트'} 모드로 전환`}
    >
      {theme.name === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </AnimatedButton>
  );
}