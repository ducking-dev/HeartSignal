'use client';

/**
 * Container - 재사용 가능한 레이아웃 컨테이너
 * 다양한 크기와 패딩 옵션을 제공하는 SOLID 원칙 기반 컴포넌트
 */

import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  className?: string;
  children: ReactNode;
  as?: React.ElementType;
}

const containerSizes = {
  sm: 'max-w-2xl',      // 672px
  md: 'max-w-4xl',      // 896px  
  lg: 'max-w-6xl',      // 1152px
  xl: 'max-w-7xl',      // 1280px
  full: 'max-w-full',   // 100%
} as const;

export function Container({ 
  size = 'lg',
  padding = true,
  className,
  children,
  as: Component = 'div'
}: ContainerProps) {
  return (
    <Component
      className={cn(
        // 기본 컨테이너 스타일
        'mx-auto w-full',
        
        // 크기별 최대 너비
        containerSizes[size],
        
        // 패딩 적용
        padding && 'px-4 sm:px-6 lg:px-8',
        
        // 추가 클래스
        className
      )}
    >
      {children}
    </Component>
  );
}

