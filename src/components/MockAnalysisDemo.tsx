'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Loader2 } from 'lucide-react';

/**
 * Mock 분석 데모 컴포넌트 - 클라이언트 사이드에서만 렌더링
 */
export default function MockAnalysisDemo() {
  const [isLoading, setIsLoading] = useState(true);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisSteps = [
    '음성 톤 분석',
    '감정/사회적용 분석',
    '집중/피드백 분석'
  ];

  useEffect(() => {
    // 3초 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // 분석 단계 애니메이션
    const stepTimer = setInterval(() => {
      setAnalysisStep(prev => (prev + 1) % analysisSteps.length);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(stepTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-12 bg-white/80 backdrop-blur-sm border-pink-200 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Heart className="w-12 h-12 text-pink-500" />
              <div className="absolute inset-0 animate-ping">
                <Heart className="w-12 h-12 text-pink-300" />
              </div>
            </div>
            <span className="ml-3 text-2xl font-semibold text-gray-800">Heart Signal</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">감정/사회적용</h2>
          
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">전사</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <span className="text-gray-600">집중/피드백</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-xl text-gray-700 mb-4">말의 맥락과 감정을 분석하고 있어요...</p>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
              <span className="text-pink-600 font-medium">{analysisSteps[analysisStep]}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">음성 톤 분석</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">톤 변화 감지 중...</span>
                </div>
              </div>
            </div>
            
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Transcript</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">나</div>
                  <span className="text-sm text-gray-700">안녕하세요! 오늘 날씨가 정말 좋네요.</span>
                  <span className="text-xs text-gray-400">방금</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">나</div>
                  <span className="text-sm text-gray-700">저도요! 이런 날은 정말 산책하고 싶어요.</span>
                  <span className="text-xs text-gray-400">방금</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">나</div>
                  <span className="text-sm text-gray-700">저도요! 이런 날엔 뭘 좋아해요?</span>
                  <span className="text-xs text-gray-400">방금</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <Heart className="w-8 h-8 text-pink-500 mr-2" />
          <span className="text-2xl font-semibold text-gray-800">Heart Signal</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">감정 분석</h1>
      </div>

      <Card className="p-8 bg-white/80 backdrop-blur-sm border-pink-200 shadow-xl mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 감정 점수 게이지 */}
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="#fce7f3"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${78 * 2.83} ${(100 - 78) * 2.83}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-gray-800">78</span>
                <span className="text-sm text-gray-600">오늘의 대화 호감</span>
                <span className="text-xs text-gray-400 mt-1">level-1</span>
              </div>
            </div>
          </div>

          {/* 분석 결과 */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">감정 변화</span>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200">긍정</Badge>
                  <Badge variant="outline">안심</Badge>
                  <Badge variant="outline">평온</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                대체로 밝은 분위기의 편안한 대화였어요
              </p>
              <span className="text-xs text-gray-400">level-1</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">상호작용 클럽</span>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200">라포 형성</Badge>
                  <Badge variant="outline">집중 높음</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                두 사람이 서로 주고받는 대화가 좋은 흐름으로
                이어졌어요
              </p>
              <span className="text-xs text-gray-400">level-1</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 대화 분석 내용 */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-pink-200 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">오늘의 대화에서 좋았던 점은...</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-pink-600 text-sm font-bold">1</span>
            </div>
            <p className="text-gray-700">긍정적인 말투와 밝고 긍정하는 태도가 돋보였어요. 둘은 서로 알아가려고 노력했어요</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-pink-600 text-sm font-bold">2</span>
            </div>
            <p className="text-gray-700">공통의 관심사를 되짚어보시는 모습이 좋았어요</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-pink-600 text-sm font-bold">3</span>
            </div>
            <p className="text-gray-700">서로 보다 대화하는 것이 의미있었어요</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6">
            다음에 또 해봐요
          </Button>
        </div>
      </Card>

      {/* 하단 정보 */}
      <div className="text-center mt-8 text-sm text-gray-500">
        힘을 내다 · 하인만 미를로 · 세상을 보리반상
      </div>
    </div>
  );
}
