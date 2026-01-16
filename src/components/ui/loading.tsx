'use client';

/**
 * Loading Components - 다양한 로딩 상태를 위한 컴포넌트들
 * 일관된 로딩 UX 제공
 */

import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart, Mic, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// 기본 스피너
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary-500',
        sizeClasses[size],
        className
      )} 
    />
  );
}

// 하트 펄스 로더
interface HeartPulseProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HeartPulse({ size = 'md', className }: HeartPulseProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn('text-primary-500', className)}
    >
      <Heart className={cn('fill-current', sizeClasses[size])} />
    </motion.div>
  );
}

// 스켈레톤 로더
interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700',
        className
      )}
    >
      {children}
    </div>
  );
}

// 오디오 웨이브 로더
export function AudioWaveLoader() {
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary-500 rounded-full"
          animate={{
            height: [4, 16, 4],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// 진행률 바
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  progress, 
  className, 
  showPercentage = false 
}: ProgressBarProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <motion.div
          className="bg-primary-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <div className="text-center mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

// 로딩 오버레이
interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  loadingContent?: ReactNode;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  loadingContent,
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-10"
        >
          {loadingContent || <Spinner size="lg" />}
        </motion.div>
      )}
    </div>
  );
}

// 컨텍스트별 로딩 컴포넌트들
export function SessionLoadingCard() {
  return (
    <div className="p-6 text-center space-y-4">
      <HeartPulse size="lg" />
      <div>
        <h3 className="text-lg font-semibold mb-2">세션을 준비하고 있어요</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          마이크 권한을 확인하고 분석 엔진을 초기화하고 있습니다...
        </p>
      </div>
    </div>
  );
}

export function RecordingLoadingCard() {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="flex justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-center">
          <Mic className="w-5 h-5 mr-2" />
          녹음 중...
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          자연스럽게 대화해보세요. 실시간으로 분석하고 있어요.
        </p>
      </div>
    </div>
  );
}

export function AnalysisLoadingCard() {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="flex justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="text-secondary-500"
        >
          <BarChart3 className="w-12 h-12" />
        </motion.div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">AI가 분석하고 있어요</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          대화의 감정, 톤, 상호작용을 종합적으로 분석 중입니다...
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-neutral-500">
          <span>음성 분석</span>
          <span>완료</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-500">
          <span>감정 분석</span>
          <span>진행 중...</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-500">
          <span>대화 분석</span>
          <span>대기 중</span>
        </div>
      </div>
    </div>
  );
}

// 스켈레톤 레이아웃들
export function TranscriptSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="max-w-xs space-y-2">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-12 h-3" />
              <Skeleton className="w-8 h-3" />
            </div>
            <Skeleton className="w-full h-12 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScoreSkeleton() {
  return (
    <div className="text-center space-y-4">
      <Skeleton className="w-48 h-32 mx-auto rounded-xl" />
      <Skeleton className="w-32 h-6 mx-auto" />
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4 mx-auto" />
      </div>
    </div>
  );
}

export function FeedbackSkeleton() {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-3xl">
      <div className="flex items-center space-x-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-32 h-4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-40 h-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-2/3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

