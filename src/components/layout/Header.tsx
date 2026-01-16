'use client';

/**
 * Header - 애플리케이션 헤더 컴포넌트
 * 로고, 내비게이션, 사용자 액션을 포함하는 재사용 가능한 헤더
 */

import React, { type ReactNode } from 'react';
import { Heart, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AnimatedButton } from '@/components/ui/enhanced/AnimatedButton';
import { Container } from './Container';
import { useUserStore } from '@/store/user/store';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showNavigation?: boolean;
  actions?: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function Header({
  title = 'HeartSignal',
  showLogo = true,
  showNavigation = false,
  actions,
  className,
  sticky = true,
}: HeaderProps) {
  const { isAuthenticated, profile } = useUserStore();
  
  return (
    <header
      className={cn(
        // 기본 헤더 스타일
        'border-b border-neutral-200 bg-white/80 backdrop-blur-sm',
        'dark:border-neutral-700 dark:bg-neutral-900/80',
        
        // 고정 헤더
        sticky && 'sticky top-0 z-50',
        
        // 높이 설정 (v1.md 기준 64px)
        'h-16',
        
        // 추가 클래스
        className
      )}
    >
      <Container className="h-full">
        <div className="flex h-full items-center justify-between">
          {/* 왼쪽: 로고 및 제목 */}
          <div className="flex items-center space-x-4">
            {showLogo && (
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {title}
                </span>
              </div>
            )}
            
            {/* 내비게이션 (선택적) */}
            {showNavigation && (
              <nav className="hidden md:flex items-center space-x-6">
                <a 
                  href="/" 
                  className="text-sm font-medium text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                >
                  홈
                </a>
                <a 
                  href="/analyze" 
                  className="text-sm font-medium text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                >
                  분석하기
                </a>
                <a 
                  href="/history" 
                  className="text-sm font-medium text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                >
                  히스토리
                </a>
              </nav>
            )}
          </div>
          
          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            {/* 커스텀 액션 */}
            {actions}
            
            {/* 마이페이지 버튼 */}
            {isAuthenticated && profile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/mypage'}
                className="h-8 w-8 p-0"
                aria-label="마이페이지"
                title={`${profile.name}님의 마이페이지`}
              >
                <User className="h-4 w-4" />
              </Button>
            )}
            
        {/* 테마 토글 - Hydration 안전한 컴포넌트 사용 */}
        <ThemeToggle />
            
            {/* 모바일 메뉴 (내비게이션이 있을 때만) */}
            {showNavigation && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 md:hidden"
                aria-label="메뉴 열기"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}

