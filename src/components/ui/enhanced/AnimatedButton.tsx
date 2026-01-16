'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends Omit<ButtonProps, 'asChild'> {
  animation?: 'hover' | 'tap' | 'pulse' | 'bounce' | 'shake' | 'none';
  hoverScale?: number;
  tapScale?: number;
  duration?: number;
}

/**
 * 애니메이션 버튼 컴포넌트
 * v4.md 개선사항: 마이크로 인터랙션 추가
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    animation = 'hover',
    hoverScale = 1.02,
    tapScale = 0.98,
    duration = 0.2,
    className,
    children,
    ...props 
  }, ref) => {
    // 애니메이션 변형 정의
    const getAnimationVariants = () => {
      const baseVariants = {
        initial: { scale: 1 },
        hover: { scale: hoverScale },
        tap: { scale: tapScale }
      };

      switch (animation) {
        case 'pulse':
          return {
            ...baseVariants,
            pulse: {
              scale: [1, 1.05, 1],
              transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          };
        
        case 'bounce':
          return {
            ...baseVariants,
            hover: {
              y: -2,
              scale: hoverScale,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }
          };
        
        case 'shake':
          return {
            ...baseVariants,
            shake: {
              x: [-2, 2, -2, 2, 0],
              transition: { duration: 0.5 }
            }
          };
        
        case 'none':
          return { initial: { scale: 1 } };
        
        default:
          return baseVariants;
      }
    };

    const variants = getAnimationVariants();

    // 애니메이션 상태 결정
    const getAnimationState = () => {
      if (animation === 'pulse') return 'pulse';
      return 'initial';
    };

    if (animation === 'none') {
      return (
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      );
    }

    return (
      <motion.div
        variants={variants}
        initial="initial"
        animate={getAnimationState()}
        whileHover="hover"
        whileTap="tap"
        transition={{ duration, ease: "easeOut" }}
      >
        <Button 
          ref={ref} 
          className={cn("relative overflow-hidden", className)} 
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

// 특수 버튼 변형들
export const PulseButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'animation'>>(
  (props, ref) => <AnimatedButton ref={ref} animation="pulse" {...props} />
);

export const BounceButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'animation'>>(
  (props, ref) => <AnimatedButton ref={ref} animation="bounce" {...props} />
);

export const ShakeButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'animation'>>(
  (props, ref) => <AnimatedButton ref={ref} animation="shake" {...props} />
);

PulseButton.displayName = "PulseButton";
BounceButton.displayName = "BounceButton";
ShakeButton.displayName = "ShakeButton";

// 리플 효과가 있는 버튼
export const RippleButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ onClick, children, className, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const id = Date.now();

      setRipples(prev => [...prev, { x, y, id }]);

      // 애니메이션 완료 후 리플 제거
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== id));
      }, 600);

      onClick?.(event);
    };

    return (
      <AnimatedButton
        ref={ref}
        onClick={handleClick}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {children}
        {ripples.map(ripple => (
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
      </AnimatedButton>
    );
  }
);

RippleButton.displayName = "RippleButton";
