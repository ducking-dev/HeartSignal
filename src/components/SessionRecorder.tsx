'use client';

import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SessionPhase } from '@/store/useSessionStore';
import { tokens } from '@/lib/tokens';

interface SessionRecorderProps {
  phase: SessionPhase;
  duration: number;          // 녹음 시간 (초)
  currentRMS: number;        // 0-1 레벨미터용
  onStart: () => void;
  onStop: () => void;
  onReset?: () => void;      // 리셋 함수
  error?: string | null;     // 에러 메시지
}

export function SessionRecorder({
  phase,
  duration,
  currentRMS,
  onStart,
  onStop,
  onReset,
  error
}: SessionRecorderProps) {
  const isRecording = phase === 'recording';
  const isProcessing = phase === 'processing';
  const hasError = phase === 'error';
  
  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 레벨미터 바 개수 (6개)
  const levelBars = Array.from({ length: 6 }, (_, i) => {
    const threshold = (i + 1) / 6;
    const isActive = currentRMS > threshold;
    return { index: i, isActive };
  });

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* 메인 녹음 버튼 */}
      <div className="relative">
        <motion.div
          animate={isRecording ? {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <Button
            onClick={isRecording ? onStop : onStart}
            disabled={isProcessing}
            size="lg"
            className={`
              w-32 h-32 rounded-full transition-all duration-300 text-white font-semibold text-lg
              ${hasError 
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-300' 
                : isRecording 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
                : 'bg-[#E95877] hover:bg-[#F26B88] shadow-lg shadow-pink-200'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Square className="w-8 h-8" />
              </motion.div>
            ) : isRecording ? (
              <Square className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
        </motion.div>

        {/* 펄스 링 애니메이션 (녹음 중일 때) */}
        {isRecording && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </div>

      {/* 타이머 */}
      <div className="text-center">
        <div className="text-2xl font-mono font-semibold text-gray-700">
          {formatTime(duration)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {hasError ? '오류 발생' : isRecording ? '녹음 중...' : isProcessing ? '분석 중...' : '녹음 준비'}
        </div>
      </div>

      {/* 레벨미터 */}
      {isRecording && (
        <div className="flex items-center space-x-1">
          {levelBars.map(({ index, isActive }) => (
            <motion.div
              key={index}
              className={`
                w-2 rounded-full transition-all duration-100
                ${isActive ? 'bg-[#7B6EF6]' : 'bg-gray-200'}
              `}
              style={{ 
                height: `${12 + index * 4}px` // 12px부터 32px까지
              }}
              animate={isActive ? {
                scaleY: [1, 1.2, 1]
              } : {}}
              transition={{
                duration: 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* 상태별 안내 메시지 */}
      <div className="text-center max-w-sm">
        {phase === 'idle' && (
          <p className="text-sm text-gray-600">
            마이크 버튼을 눌러 대화를 시작해보세요
          </p>
        )}
        {phase === 'recording' && (
          <p className="text-sm text-gray-600">
            자연스럽게 대화해보세요. 언제든 중지할 수 있어요
          </p>
        )}
        {phase === 'processing' && (
          <p className="text-sm text-gray-600">
            대화 내용을 분석하고 있어요. 잠시만 기다려주세요
          </p>
        )}
        {phase === 'error' && error && (
          <div className="text-center space-y-3">
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              <strong>오류:</strong> {error}
            </p>
            {onReset && (
              <Button 
                onClick={onReset}
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                다시 시도
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
