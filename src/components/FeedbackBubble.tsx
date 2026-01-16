'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Feedback } from '@/store/useSessionStore';

interface FeedbackBubbleProps {
  feedback: Feedback;
  showTyping?: boolean;      // 타이핑 효과
}

export function FeedbackBubble({ 
  feedback, 
  showTyping = false // 기본값을 false로 변경하여 타이핑 효과 비활성화
}: FeedbackBubbleProps) {
  
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [displayedTips, setDisplayedTips] = useState<string[]>([]);
  const [isTypingComplete, setIsTypingComplete] = useState(!showTyping);

  // 간단한 타이핑 애니메이션 효과 (또는 즉시 표시)
  useEffect(() => {
    if (!showTyping) {
      // 타이핑 효과 없이 즉시 표시
      setDisplayedSummary(feedback.summary);
      setDisplayedTips(feedback.tips);
      setIsTypingComplete(true);
      return;
    }

    // 타이핑 효과가 활성화된 경우
    setDisplayedSummary('');
    setDisplayedTips([]);
    setIsTypingComplete(false);

    // 요약 타이핑 (단순화)
    let summaryIndex = 0;
    const summaryInterval = setInterval(() => {
      if (summaryIndex <= feedback.summary.length) {
        setDisplayedSummary(feedback.summary.slice(0, summaryIndex));
        summaryIndex++;
      } else {
        clearInterval(summaryInterval);
        
        // 팁을 순차적으로 추가
        let tipIndex = 0;
        const addNextTip = () => {
          if (tipIndex < feedback.tips.length) {
            setDisplayedTips(prev => [...prev, feedback.tips[tipIndex]]);
            tipIndex++;
            setTimeout(addNextTip, 800);
          } else {
            setIsTypingComplete(true);
          }
        };
        
        setTimeout(addNextTip, 500);
      }
    }, 20);

    return () => {
      clearInterval(summaryInterval);
    };
  }, [feedback.summary, feedback.tips, showTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto"
    >
      {/* 말풍선 컨테이너 */}
      <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 rounded-3xl p-6 shadow-sm">
        {/* 하트 아이콘 */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-[#E95877] rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            하트시그널의 조언
          </span>
        </div>

        {/* 요약 */}
        <div className="mb-6">
          <p className="text-base text-gray-800 leading-relaxed">
            {displayedSummary}
            {showTyping && displayedSummary.length < feedback.summary.length && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-0.5 h-5 bg-gray-400 ml-1"
              />
            )}
          </p>
        </div>

        {/* 실행 팁들 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm font-medium text-gray-700">다음번엔 이렇게 해보세요</span>
          </div>
          
          {displayedTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: showTyping ? index * 0.8 : 0 }}
              className="flex items-start space-x-3 p-3 bg-white/60 rounded-2xl"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-[#E95877] text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tip}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 로딩 표시 (타이핑 중일 때) */}
        {showTyping && !isTypingComplete && displayedSummary.length === feedback.summary.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center mt-4"
          >
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 bg-[#E95877] rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* 말풍선 꼬리 */}
        <div className="absolute -bottom-2 left-8 w-4 h-4 bg-gradient-to-br from-pink-50 to-purple-50 border-l border-b border-pink-100 rotate-45" />
      </div>
    </motion.div>
  );
}