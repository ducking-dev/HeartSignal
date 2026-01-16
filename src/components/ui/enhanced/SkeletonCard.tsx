'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: number | string;
  height?: number | string;
  lines?: number; // 텍스트 스켈레톤용
  className?: string;
}

/**
 * 스켈레톤 UI 컴포넌트
 * v4.md 개선사항: 로딩 경험 개선
 */
export function Skeleton({ 
  variant = 'rectangular', 
  width, 
  height, 
  lines = 1,
  className 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted rounded";
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded';
      case 'card':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, getVariantClasses(), {
              'w-3/4': index === lines - 1, // 마지막 줄은 짧게
            })}
            style={index === lines - 1 ? { width: '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, getVariantClasses(), className)}
      style={style}
    />
  );
}

// 프리셋 스켈레톤 컴포넌트들
export function UserProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={16} />
          <div className="space-y-1">
            <Skeleton variant="text" width="50%" height={14} />
            <Skeleton variant="text" width="45%" height={14} />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" height={18} />
        <Skeleton variant="text" lines={3} />
      </div>

      <div className="space-y-2">
        <Skeleton variant="text" width="20%" height={18} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width={60} height={24} className="rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConversationCardSkeleton() {
  return (
    <div className="p-4 space-y-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-1">
          <Skeleton variant="text" width="40%" height={18} />
          <Skeleton variant="text" width="60%" height={14} />
        </div>
        <Skeleton width={60} height={24} className="rounded-full" />
      </div>
      
      <div className="space-y-2">
        <Skeleton variant="text" lines={2} />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width={80} height={20} className="rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center p-4 border rounded-lg space-y-2">
            <Skeleton variant="circular" width={32} height={32} className="mx-auto" />
            <Skeleton variant="text" width="60%" height={24} className="mx-auto" />
            <Skeleton variant="text" width="80%" height={14} className="mx-auto" />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton variant="text" width="30%" height={20} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Skeleton variant="text" width="40%" height={16} />
              <Skeleton variant="text" width="60%" height={14} />
            </div>
            <Skeleton width={60} height={32} className="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="h-64 p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="70%" height={14} />
      </div>
      <div className="flex-1 flex items-end justify-between gap-2 h-48">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton 
            key={i} 
            width="12%" 
            height={`${Math.random() * 60 + 40}%`}
            className="rounded-t"
          />
        ))}
      </div>
    </div>
  );
}
