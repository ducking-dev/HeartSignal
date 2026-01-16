'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useState } from 'react';

interface ScoreGaugeProps {
  score: number;             // 0-100
  breakdown?: {              // 세부 점수 (툴팁)
    text: number;
    voice: number; 
    balance: number;
  };
  animated?: boolean;
}

export function ScoreGauge({ 
  score, 
  breakdown, 
  animated = true 
}: ScoreGaugeProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // 점수에 따른 색상 결정
  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: '#2FBF71', bg: 'bg-green-50' }; // success
    if (score >= 60) return { stroke: '#E95877', bg: 'bg-pink-50' };  // primary
    if (score >= 40) return { stroke: '#F59E0B', bg: 'bg-yellow-50' }; // warning
    return { stroke: '#E11D48', bg: 'bg-red-50' }; // danger
  };

  const { stroke: strokeColor, bg: bgColor } = getScoreColor(score);
  
  // 반원형 게이지 계산
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // 반원
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* SVG 게이지 */}
      <div className="relative">
        <svg 
          width={200} 
          height={120} 
          className="transform -rotate-90"
        >
          {/* 배경 아크 */}
          <path
            d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* 진행 아크 */}
          <motion.path
            d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? circumference : circumference - progress}
            initial={animated ? { strokeDashoffset: circumference } : false}
            animate={animated ? { strokeDashoffset: circumference - progress } : false}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              delay: 0.2
            }}
          />
        </svg>
        
        {/* 중앙 점수 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={animated ? { scale: 0, opacity: 0 } : false}
            animate={animated ? { scale: 1, opacity: 1 } : false}
            transition={{ 
              duration: 0.6, 
              delay: animated ? 1.0 : 0,
              type: "spring",
              stiffness: 200 
            }}
            className="text-center"
          >
            <div className="text-4xl font-bold font-mono text-gray-900">
              {score}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              매칭율
            </div>
          </motion.div>
        </div>
      </div>

      {/* 점수 해석 */}
      <div className={`px-4 py-2 rounded-full text-sm font-medium ${bgColor}`}>
        {score >= 80 && '훌륭한 대화였어요! 🎉'}
        {score >= 60 && score < 80 && '좋은 흐름이었어요! 😊'}
        {score >= 40 && score < 60 && '괜찮은 시작이에요 👍'}
        {score < 40 && '다음번엔 더 좋아질 거예요 💪'}
      </div>

      {/* 세부 점수 (breakdown이 있을 때) */}
      {breakdown && (
        <div className="relative">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>세부 점수 보기</span>
          </button>
          
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-48 z-10"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">텍스트 분석</span>
                  <span className="text-sm font-medium">{breakdown.text}점</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">음성 분석</span>
                  <span className="text-sm font-medium">{breakdown.voice}점</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">대화 균형</span>
                  <span className="text-sm font-medium">{breakdown.balance}점</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
