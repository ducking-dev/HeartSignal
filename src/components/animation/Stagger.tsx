'use client';

/**
 * Stagger - 자식 요소들을 순차적으로 애니메이션하는 컴포넌트
 * 리스트나 그리드 아이템들의 시차 애니메이션을 쉽게 구현
 */

import React, { Children, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { designTokens } from '@/lib/design-tokens';

export interface StaggerProps {
  children: ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
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

export function Stagger({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  direction = 'up',
  distance = 20,
  duration = 0.5,
  className,
  once = true,
}: StaggerProps) {
  const offset = directionOffsets[direction];
  const customOffset = {
    x: offset.x !== 0 ? (offset.x > 0 ? distance : -distance) : 0,
    y: offset.y !== 0 ? (offset.y > 0 ? distance : -distance) : 0,
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: customOffset.x,
      y: customOffset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: designTokens.animation.easing.easeOut.replace('cubic-bezier(', '').replace(')', '').split(', ').map(Number) as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// 뷰포트 진입 시 스태거 애니메이션
export function StaggerOnView({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  direction = 'up',
  distance = 20,
  duration = 0.5,
  className,
  threshold = 0.1,
  once = true,
}: StaggerProps & {
  threshold?: number;
}) {
  const offset = directionOffsets[direction];
  const customOffset = {
    x: offset.x !== 0 ? (offset.x > 0 ? distance : -distance) : 0,
    y: offset.y !== 0 ? (offset.y > 0 ? distance : -distance) : 0,
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: customOffset.x,
      y: customOffset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: designTokens.animation.easing.easeOut.replace('cubic-bezier(', '').replace(')', '').split(', ').map(Number) as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      className={className}
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

