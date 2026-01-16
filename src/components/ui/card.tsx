'use client';

/**
 * Card - 재사용 가능한 카드 컴포넌트
 * 다양한 variant와 padding 옵션을 제공하는 SOLID 원칙 기반 컴포넌트
 */

import React, { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const cardVariants = {
  default: 'bg-white border border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-700',
  elevated: 'bg-white border border-neutral-200 shadow-lg dark:bg-neutral-900 dark:border-neutral-700',
  outlined: 'bg-transparent border-2 border-neutral-300 dark:border-neutral-600',
  ghost: 'bg-neutral-50/50 border-0 dark:bg-neutral-800/50',
} as const;

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // 기본 카드 스타일
          'rounded-xl transition-all duration-200',
          
          // Variant 스타일
          cardVariants[variant],
          
          // Padding 스타일
          cardPadding[padding],
          
          // 추가 클래스
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card 서브 컴포넌트들
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-neutral-600 dark:text-neutral-400', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pt-0', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };