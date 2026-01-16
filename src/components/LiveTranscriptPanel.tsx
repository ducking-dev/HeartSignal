'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { User, UserCheck } from 'lucide-react';
import type { TranscriptSegment } from '@/store/useSessionStore';

interface LiveTranscriptPanelProps {
  segments: TranscriptSegment[];
  isRealtime: boolean;
}

export function LiveTranscriptPanel({ 
  segments, 
  isRealtime 
}: LiveTranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 세그먼트가 추가될 때마다 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  // 시간 포맷팅 (mm:ss)
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (segments.length === 0) {
    return (
      <div className="h-80 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            {isRealtime ? '대화를 시작하면 실시간으로 전사됩니다' : '전사된 내용이 여기에 표시됩니다'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="h-80 bg-white rounded-xl border border-gray-200 overflow-y-auto p-4 space-y-3"
    >
      <AnimatePresence>
        {segments.map((segment, index) => (
          <motion.div
            key={`${segment.t0}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex ${segment.speaker === 'me' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`
              max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative
              ${segment.speaker === 'me' 
                ? 'bg-pink-50 border border-pink-100 text-gray-800' 
                : 'bg-gray-100 border border-gray-200 text-gray-800'
              }
            `}>
              {/* 화자 표시 */}
              <div className="flex items-center space-x-2 mb-1">
                <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center
                  ${segment.speaker === 'me' ? 'bg-[#E95877]' : 'bg-gray-400'}
                `}>
                  {segment.speaker === 'me' ? (
                    <UserCheck className="w-3 h-3 text-white" />
                  ) : (
                    <User className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {segment.speaker === 'me' ? '나' : '상대방'}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(segment.t0)}
                </span>
              </div>

              {/* 전사 텍스트 */}
              <p className="text-sm leading-relaxed">
                {segment.text}
              </p>

              {/* 말풍선 꼬리 */}
              <div className={`
                absolute top-4 w-3 h-3 transform rotate-45
                ${segment.speaker === 'me' 
                  ? '-left-1.5 bg-pink-50 border-l border-b border-pink-100' 
                  : '-right-1.5 bg-gray-100 border-r border-t border-gray-200'
                }
              `} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 실시간 타이핑 인디케이터 */}
      {isRealtime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-2"
        >
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="flex space-x-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-gray-300 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-gray-300 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-gray-300 rounded-full"
              />
            </div>
            <span className="text-xs">대화를 듣고 있어요...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
