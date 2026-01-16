'use client';

/**
 * Micro Interactions - 세밀한 사용자 인터랙션을 위한 애니메이션 컴포넌트들
 * v1.md의 마이크로 인터랙션 가이드라인 구현
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/accessibility';
import { designTokens } from '@/lib/design-tokens';

// 호버 효과가 적용된 버튼
interface HoverButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  hoverScale?: number;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export function HoverButton({ 
  children, 
  variant = 'primary', 
  hoverScale = 1.05,
  className,
  onClick,
  disabled,
  type = 'button',
  'aria-label': ariaLabel,
}: HoverButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const baseClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${baseClasses[variant]}
        ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      whileHover={prefersReducedMotion || disabled ? {} : { 
        scale: hoverScale,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={prefersReducedMotion || disabled ? {} : { 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.button>
  );
}

// 클릭 시 리플 효과
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function RippleButton({ children, className, onClick, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!prefersReducedMotion) {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const newRipple = { x, y, id: Date.now() };
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    onClick?.(event);
  };

  return (
    <button
      className={`
        relative overflow-hidden px-4 py-2 rounded-lg font-medium
        bg-primary-500 text-white hover:bg-primary-600
        focus:outline-none focus:ring-2 focus:ring-primary-300
        transition-colors duration-200
        ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </button>
  );
}

// 드래그 가능한 카드
interface DraggableCardProps {
  children: React.ReactNode;
  className?: string;
  onDragEnd?: (info: any) => void;
}

export function DraggableCard({ children, className, onDragEnd }: DraggableCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={`cursor-grab active:cursor-grabbing ${className}`}
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.05, rotate: 5 }}
      onDragEnd={onDragEnd}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// 자기 부상 효과 카드
interface FloatingCardProps {
  children: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export function FloatingCard({ 
  children, 
  intensity = 'medium', 
  className 
}: FloatingCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const intensityMap = {
    subtle: { y: [-2, 2], duration: 4 },
    medium: { y: [-5, 5], duration: 3 },
    strong: { y: [-8, 8], duration: 2 },
  };
  
  const config = intensityMap[intensity];
  
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: config.y }}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// 마우스 따라가는 효과
interface MouseFollowerProps {
  children: React.ReactNode;
  className?: string;
}

export function MouseFollower({ children, className }: MouseFollowerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // 마우스 위치에 따른 회전
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      x.set(event.clientX - centerX);
      y.set(event.clientY - centerY);
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseleave', () => {
        x.set(0);
        y.set(0);
      });
      
      return () => {
        element.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [x, y, prefersReducedMotion]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={prefersReducedMotion ? {} : { 
        rotateX, 
        rotateY,
        transformStyle: "preserve-3d"
      }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}

// 성공/실패 피드백 애니메이션
interface FeedbackAnimationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}

export function FeedbackAnimation({ 
  type, 
  children, 
  trigger, 
  className 
}: FeedbackAnimationProps) {
  const controls = useAnimation();
  const prefersReducedMotion = usePrefersReducedMotion();
  
  const colorMap = {
    success: '#2FBF71',
    error: '#E11D48', 
    warning: '#F59E0B',
    info: '#3B82F6',
  };

  useEffect(() => {
    if (trigger && !prefersReducedMotion) {
      controls.start({
        scale: [1, 1.1, 1],
        backgroundColor: [colorMap[type], colorMap[type], 'transparent'],
        transition: { duration: 0.6, ease: "easeOut" }
      });
    }
  }, [trigger, type, controls, prefersReducedMotion, colorMap]);

  return (
    <motion.div
      className={className}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}

// 로딩 상태 모프 애니메이션
interface LoadingMorphProps {
  isLoading: boolean;
  loadingContent: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function LoadingMorph({ 
  isLoading, 
  loadingContent, 
  children, 
  className 
}: LoadingMorphProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <motion.div
      className={className}
      layout={!prefersReducedMotion}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div
        initial={false}
        animate={{ 
          opacity: isLoading ? 0 : 1,
          scale: isLoading ? 0.8 : 1
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
        {!isLoading && children}
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{ 
          opacity: isLoading ? 1 : 0,
          scale: isLoading ? 1 : 0.8
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        style={{ position: isLoading ? 'static' : 'absolute' }}
      >
        {isLoading && loadingContent}
      </motion.div>
    </motion.div>
  );
}

// 숫자 카운트 애니메이션
interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ 
  from, 
  to, 
  duration = 1, 
  className 
}: CounterProps) {
  const [count, setCount] = useState(from);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(to);
      return;
    }

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(from + (to - from) * easeOutQuart);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration, prefersReducedMotion]);

  return <span className={className}>{count}</span>;
}

// 진행률 링
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  className 
}: ProgressRingProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-neutral-200 dark:text-neutral-700"
        />
        {/* 진행률 원 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={prefersReducedMotion ? offset : circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-primary-500"
        />
      </svg>
      
      {/* 중앙 텍스트 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          <AnimatedCounter from={0} to={progress} />%
        </span>
      </div>
    </div>
  );
}

