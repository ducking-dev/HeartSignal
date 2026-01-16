'use client';

/**
 * FadeIn - 재사용 가능한 페이드인 애니메이션 컴포넌트
 * 다양한 방향과 타이밍 옵션을 제공하는 애니메이션 래퍼
 */

import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { designTokens } from '@/lib/design-tokens';

export interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
  once?: boolean;
}

const directionOffsets = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
  none: { x: 0, y: 0 },
} as const;

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  className,
  once = true,
  ...motionProps
}: FadeInProps) {
  const offset = directionOffsets[direction];
  const customOffset = {
    x: offset.x !== 0 ? (offset.x > 0 ? distance : -distance) : 0,
    y: offset.y !== 0 ? (offset.y > 0 ? distance : -distance) : 0,
  };
  
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: customOffset.x,
        y: customOffset.y,
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration,
        delay,
        ease: designTokens.animation.easing.easeOut.replace('cubic-bezier(', '').replace(')', '').split(', ').map(Number) as [number, number, number, number],
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

// 뷰포트 진입 시 애니메이션을 위한 컴포넌트
export function FadeInOnView({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 20,
  className,
  threshold = 0.1,
  once = true,
  ...motionProps
}: FadeInProps & {
  threshold?: number;
}) {
  const offset = directionOffsets[direction];
  const customOffset = {
    x: offset.x !== 0 ? (offset.x > 0 ? distance : -distance) : 0,
    y: offset.y !== 0 ? (offset.y > 0 ? distance : -distance) : 0,
  };
  
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: customOffset.x,
        y: customOffset.y,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: designTokens.animation.easing.easeOut.replace('cubic-bezier(', '').replace(')', '').split(', ').map(Number) as [number, number, number, number],
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

