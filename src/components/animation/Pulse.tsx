'use client';

/**
 * Pulse - 펄스 애니메이션 컴포넌트
 * 다양한 강도와 속도의 펄스 효과를 제공하는 재사용 가능한 컴포넌트
 */

import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { designTokens } from '@/lib/design-tokens';

export interface PulseProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
  disabled?: boolean;
}

const intensityScales = {
  subtle: { min: 1, max: 1.02 },
  medium: { min: 1, max: 1.05 },
  strong: { min: 1, max: 1.1 },
} as const;

const speedDurations = {
  slow: 3,
  normal: 2,
  fast: 1,
} as const;

export function Pulse({
  children,
  intensity = 'medium',
  speed = 'normal',
  className,
  disabled = false,
  ...motionProps
}: PulseProps) {
  const scale = intensityScales[intensity];
  const duration = speedDurations[speed];

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{
        scale: [scale.min, scale.max, scale.min],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: designTokens.animation.easing.easeInOut.replace('cubic-bezier(', '').replace(')', '').split(', ').map(Number) as [number, number, number, number],
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

// 호버 시에만 펄스하는 컴포넌트
export function PulseOnHover({
  children,
  intensity = 'medium',
  speed = 'normal',
  className,
  ...motionProps
}: Omit<PulseProps, 'disabled'>) {
  const scale = intensityScales[intensity];
  const duration = speedDurations[speed];

  return (
    <motion.div
      whileHover={{
        scale: [scale.min, scale.max, scale.min],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: designTokens.animation.easing.easeInOut.replace('cubic-bezier(', '').replace(')', '').split(', ').map(Number) as [number, number, number, number],
      }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

// 클릭 시 펄스 효과
export function PulseOnClick({
  children,
  intensity = 'medium',
  className,
  onClick,
  ...motionProps
}: Omit<PulseProps, 'speed' | 'disabled'> & {
  onClick?: () => void;
}) {
  const scale = intensityScales[intensity];

  return (
    <motion.div
      whileTap={{
        scale: scale.max,
      }}
      transition={{
        duration: 0.1,
        ease: designTokens.animation.easing.easeOut.replace('cubic-bezier(', '').replace(')', '').split(', ').map(Number) as [number, number, number, number],
      }}
      className={className}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

