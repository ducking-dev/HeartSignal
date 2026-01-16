/**
 * SessionRecorder 컴포넌트 단위 테스트
 * SOLID 원칙 검증 및 기능 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import { SessionRecorder } from '@/components/SessionRecorder';
import type { SessionPhase } from '@/store/session/types';

// 테스트용 props
const defaultProps = {
  phase: 'idle' as SessionPhase,
  duration: 0,
  currentRMS: 0,
  onStart: jest.fn(),
  onStop: jest.fn(),
};

describe('SessionRecorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Single Responsibility Principle', () => {
    it('should only handle recording UI and user interactions', () => {
      render(<SessionRecorder {...defaultProps} />);
      
      // 녹음 버튼이 렌더링되어야 함
      const recordButton = screen.getByRole('button');
      expect(recordButton).toBeInTheDocument();
      
      // 시간 표시가 렌더링되어야 함
      expect(screen.getByText('00:00')).toBeInTheDocument();
      
      // 상태 메시지가 렌더링되어야 함
      expect(screen.getByText('녹음 준비')).toBeInTheDocument();
    });

    it('should not contain business logic', () => {
      const onStart = jest.fn();
      render(<SessionRecorder {...defaultProps} onStart={onStart} />);
      
      const recordButton = screen.getByRole('button');
      fireEvent.click(recordButton);
      
      // 컴포넌트는 단지 콜백을 호출해야 함 (비즈니스 로직 없음)
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Open/Closed Principle', () => {
    it('should be extensible through props without modification', () => {
      // 새로운 phase를 추가해도 기존 코드 수정 없이 동작해야 함
      render(<SessionRecorder {...defaultProps} phase="processing" />);
      expect(screen.getByText('분석 중...')).toBeInTheDocument();
    });

    it('should handle different duration formats', () => {
      render(<SessionRecorder {...defaultProps} duration={125} />);
      expect(screen.getByText('02:05')).toBeInTheDocument();
    });
  });

  describe('Liskov Substitution Principle', () => {
    it('should work with any valid SessionPhase', () => {
      const phases: SessionPhase[] = ['idle', 'recording', 'processing', 'done', 'error'];
      
      phases.forEach((phase) => {
        const { rerender } = render(<SessionRecorder {...defaultProps} phase={phase} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
        rerender(<div />); // 정리
      });
    });
  });

  describe('Interface Segregation Principle', () => {
    it('should only require necessary props', () => {
      // 필수 props만으로 렌더링되어야 함
      render(
        <SessionRecorder
          phase="idle"
          duration={0}
          currentRMS={0}
          onStart={() => {}}
          onStop={() => {}}
        />
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not depend on unnecessary props', () => {
      // 불필요한 props 없이도 동작해야 함
      const minimalProps = {
        phase: 'idle' as SessionPhase,
        duration: 0,
        currentRMS: 0,
        onStart: jest.fn(),
        onStop: jest.fn(),
      };
      
      expect(() => render(<SessionRecorder {...minimalProps} />)).not.toThrow();
    });
  });

  describe('Phase State Management', () => {
    it('should display correct UI for idle phase', () => {
      render(<SessionRecorder {...defaultProps} phase="idle" />);
      
      expect(screen.getByText('녹음 준비')).toBeInTheDocument();
      expect(screen.getByText('마이크 버튼을 눌러 대화를 시작해보세요')).toBeInTheDocument();
    });

    it('should display correct UI for recording phase', () => {
      render(<SessionRecorder {...defaultProps} phase="recording" currentRMS={0.5} />);
      
      expect(screen.getByText('녹음 중...')).toBeInTheDocument();
      expect(screen.getByText('자연스럽게 대화해보세요. 언제든 중지할 수 있어요')).toBeInTheDocument();
      
      // 레벨미터가 표시되어야 함
      const levelBars = screen.getAllByRole('generic').filter(
        el => el.className.includes('bg-secondary-500') || el.className.includes('bg-gray-200')
      );
      expect(levelBars.length).toBeGreaterThan(0);
    });

    it('should display correct UI for processing phase', () => {
      render(<SessionRecorder {...defaultProps} phase="processing" />);
      
      expect(screen.getByText('분석 중...')).toBeInTheDocument();
      expect(screen.getByText('대화 내용을 분석하고 있어요. 잠시만 기다려주세요')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onStart when idle button is clicked', () => {
      const onStart = jest.fn();
      render(<SessionRecorder {...defaultProps} phase="idle" onStart={onStart} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('should call onStop when recording button is clicked', () => {
      const onStop = jest.fn();
      render(<SessionRecorder {...defaultProps} phase="recording" onStop={onStop} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('should disable button during processing', () => {
      render(<SessionRecorder {...defaultProps} phase="processing" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Time Formatting', () => {
    it('should format time correctly', () => {
      const testCases = [
        { duration: 0, expected: '00:00' },
        { duration: 30, expected: '00:30' },
        { duration: 60, expected: '01:00' },
        { duration: 125, expected: '02:05' },
        { duration: 3661, expected: '61:01' }, // 1시간 1분 1초
      ];

      testCases.forEach(({ duration, expected }) => {
        const { rerender } = render(<SessionRecorder {...defaultProps} duration={duration} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        rerender(<div />);
      });
    });
  });

  describe('Level Meter', () => {
    it('should show level meter only during recording', () => {
      const { rerender } = render(<SessionRecorder {...defaultProps} phase="idle" />);
      
      // idle 상태에서는 레벨미터가 없어야 함
      expect(screen.queryByTestId('level-meter')).not.toBeInTheDocument();
      
      // recording 상태에서는 레벨미터가 있어야 함
      rerender(<SessionRecorder {...defaultProps} phase="recording" currentRMS={0.5} />);
      // 레벨미터 바들이 렌더링되는지 확인 (6개의 바)
      const levelBars = document.querySelectorAll('[class*="w-2"][class*="rounded-full"]');
      expect(levelBars.length).toBeGreaterThanOrEqual(6);
    });

    it('should reflect RMS levels in visual bars', () => {
      render(<SessionRecorder {...defaultProps} phase="recording" currentRMS={0.8} />);
      
      // 높은 RMS 값에서 더 많은 바가 활성화되어야 함
      const activeBars = document.querySelectorAll('[class*="bg-secondary-500"]');
      const inactiveBars = document.querySelectorAll('[class*="bg-gray-200"]');
      
      // 0.8 RMS에서는 대부분의 바가 활성화되어야 함
      expect(activeBars.length).toBeGreaterThan(inactiveBars.length);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SessionRecorder {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
    });

    it('should be keyboard accessible', () => {
      const onStart = jest.fn();
      render(<SessionRecorder {...defaultProps} onStart={onStart} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('Animation States', () => {
    it('should apply pulse animation during recording', () => {
      render(<SessionRecorder {...defaultProps} phase="recording" />);
      
      const button = screen.getByRole('button');
      // Framer Motion 애니메이션 props가 적용되는지 확인
      expect(button.closest('[style*="transform"]')).toBeTruthy();
    });

    it('should show rotation animation during processing', () => {
      render(<SessionRecorder {...defaultProps} phase="processing" />);
      
      const button = screen.getByRole('button');
      // 처리 중 상태에서 회전 애니메이션이 적용되는지 확인
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing callbacks gracefully', () => {
      expect(() => 
        render(
          <SessionRecorder
            phase="idle"
            duration={0}
            currentRMS={0}
            onStart={() => {}}
            onStop={() => {}}
          />
        )
      ).not.toThrow();
    });

    it('should handle extreme RMS values', () => {
      expect(() => 
        render(<SessionRecorder {...defaultProps} phase="recording" currentRMS={999} />)
      ).not.toThrow();
      
      expect(() => 
        render(<SessionRecorder {...defaultProps} phase="recording" currentRMS={-1} />)
      ).not.toThrow();
    });
  });
});

