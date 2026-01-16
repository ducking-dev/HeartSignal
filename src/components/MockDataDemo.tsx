'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSessionStore } from '@/store/useSessionStore';
import { 
  loadMockSessionData, 
  loadMockSessionDataInstant,
  mockTranscriptSegments,
  mockEmotionAnalysis,
  mockMatchScore,
  mockFeedback
} from '@/lib/mock-data';
import { Play, RotateCcw, Zap, FileText, Heart, TrendingUp, Mic } from 'lucide-react';

/**
 * Mock Data 테스트용 데모 컴포넌트
 * 
 * HeartSignal의 mock data를 시각적으로 확인하고 테스트할 수 있는 컴포넌트
 * 개발 및 프레젠테이션 용도로 사용
 */
export const MockDataDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'emotion' | 'score' | 'feedback'>('transcript');
  
  const sessionStore = useSessionStore();
  const { phase, segments, emotion, match, feedback, duration } = sessionStore;

  const handleLoadMockData = async (instant: boolean = false) => {
    setIsLoading(true);
    
    if (instant) {
      loadMockSessionDataInstant(sessionStore);
      setIsLoading(false);
      // 데이터 로드 후 자동으로 결과 탭으로 이동
      setTimeout(() => setActiveTab('score'), 300);
    } else {
      loadMockSessionData(sessionStore);
      // 로딩 시뮬레이션
      setTimeout(() => {
        setIsLoading(false);
        // 데이터 로드 후 자동으로 결과 탭으로 이동
        setActiveTab('score');
      }, 1500);
    }
  };

  const handleReset = () => {
    sessionStore.reset();
    setActiveTab('transcript');
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'idle': return 'bg-gray-100 text-gray-600';
      case 'processing': return 'bg-yellow-100 text-yellow-600';
      case 'done': return 'bg-green-100 text-green-600';
      case 'error': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-pink-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl font-bold text-gray-900">HeartSignal Mock Data Demo</h1>
        </div>
        <p className="text-gray-600">
          대한민국 20대 남녀의 소개팅 후 첫 통화 시나리오를 기반으로 한 실제적인 테스트 데이터
        </p>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className={getPhaseColor(phase)}>
              {phase === 'idle' && '대기 중'}
              {phase === 'processing' && '분석 중...'}
              {phase === 'done' && '분석 완료'}
              {phase === 'error' && '오류 발생'}
            </Badge>
            {duration > 0 && (
              <span className="text-sm text-gray-500">
                통화 시간: {Math.floor(duration / 60)}분 {duration % 60}초
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleLoadMockData(false)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isLoading ? '로딩 중...' : '시뮬레이션 로드'}
            </Button>
            <Button
              onClick={() => handleLoadMockData(true)}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              즉시 로드
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              리셋
            </Button>
          </div>
        </div>

        {/* 시나리오 정보 */}
        <div className="bg-pink-50 rounded-lg p-4">
          <h3 className="font-semibold text-pink-900 mb-2">📞 통화 시나리오</h3>
          <div className="text-sm text-pink-700 space-y-1">
            <p><strong>참여자:</strong> 민수(25, 남) & 지영(24, 여)</p>
            <p><strong>상황:</strong> 지난주 소개팅 후 첫 통화</p>
            <p><strong>분위기:</strong> 서로 탐색하는 단계, 약간의 긴장감과 호기심 공존</p>
            <p><strong>결과:</strong> 다음 주말 한강공원 데이트 약속까지 성사 ✨</p>
          </div>
        </div>
      </Card>

      {/* Data Visualization */}
      {phase !== 'idle' && (
        <Card className="p-6">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            {[
              { id: 'transcript', label: '대화 내용', icon: FileText },
              { id: 'emotion', label: '감정 분석', icon: Heart },
              { id: 'score', label: '매칭 점수', icon: TrendingUp },
              { id: 'feedback', label: 'AI 피드백', icon: Zap }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {/* 대화 내용 */}
            {activeTab === 'transcript' && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {segments.length > 0 ? (
                  segments.map((segment, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        segment.speaker === 'me' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          segment.speaker === 'me'
                            ? 'bg-pink-50 border border-pink-100'
                            : 'bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${
                            segment.speaker === 'me' ? 'text-pink-600' : 'text-gray-600'
                          }`}>
                            {segment.speaker === 'me' ? '지영' : '민수'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(segment.t0)}
                          </span>
                        </div>
                        <p className="text-sm">{segment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    대화 내용을 로드하려면 위의 버튼을 클릭하세요.
                  </p>
                )}
              </div>
            )}

            {/* 감정 분석 */}
            {activeTab === 'emotion' && emotion && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">감정 지표</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">감정 극성 (Valence)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-pink-500 rounded-full"
                            style={{ width: `${((emotion.valence + 1) / 2) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {emotion.valence > 0 ? '긍정적' : '부정적'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">감정 강도 (Arousal)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-purple-500 rounded-full"
                            style={{ width: `${emotion.arousal * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {emotion.arousal > 0.5 ? '높음' : '낮음'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">세부 감정</h4>
                  <div className="space-y-2">
                    {emotion.emotions.map((emo, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm capitalize">
                          {emo.label === 'joy' && '기쁨'}
                          {emo.label === 'surprise' && '놀라움'}
                          {emo.label === 'fear' && '두려움'}
                          {emo.label === 'anger' && '화남'}
                          {emo.label === 'sadness' && '슬픔'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${emo.score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">
                            {Math.round(emo.score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {emotion.evidence && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold mb-3">감정 분석 근거</h4>
                    <ul className="space-y-1">
                      {emotion.evidence.map((evidence, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          {evidence}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 매칭 점수 */}
            {activeTab === 'score' && match && (
              <div className="space-y-8">
                {/* 메인 점수 */}
                <div className="text-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8">
                  <div className="mb-4">
                    <div className={`text-7xl font-bold ${getScoreColor(match.score)} mb-2 animate-pulse`}>
                      {match.score}
                    </div>
                    <p className="text-xl text-gray-700 font-medium">매칭 점수</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {match.score >= 80 && "🔥 완벽한 케미! 다음 만남이 기대돼요"}
                      {match.score >= 60 && match.score < 80 && "💖 좋은 시작이에요! 더 깊이 알아가보세요"}
                      {match.score >= 40 && match.score < 60 && "🌱 서로를 알아가는 중이에요"}
                      {match.score < 40 && "🤔 조금 더 자연스럽게 대화해보세요"}
                    </p>
                  </div>
                </div>
                
                {/* 세부 점수 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-700">텍스트 분석</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(match.breakdown.text)}`}>
                        {match.breakdown.text}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${match.breakdown.text}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">대화 내용과 감정 표현</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Mic className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-gray-700">음성 분석</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(match.breakdown.voice)}`}>
                        {match.breakdown.voice}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${match.breakdown.voice}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">목소리 톤과 감정 변화</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-700">대화 균형</span>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(match.breakdown.balance)}`}>
                        {match.breakdown.balance}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${match.breakdown.balance}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">서로 말할 기회의 균형</p>
                  </div>
                </div>

                {/* 결과 메시지 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">분석 결과</h4>
                      <p className="text-green-700 leading-relaxed">
                        🎉 훌륭한 첫 통화였어요! 서로에 대한 관심과 배려가 잘 드러났고, 
                        자연스러운 대화 흐름으로 좋은 인상을 남겼습니다. 
                        다음 만남에서도 이런 편안한 분위기를 유지해보세요!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI 피드백 */}
            {activeTab === 'feedback' && feedback && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">💖 AI 분석 요약</h4>
                  <p className="text-gray-700 leading-relaxed">{feedback.summary}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">🚀 개선 팁</h4>
                  <div className="space-y-3">
                    {feedback.tips.map((tip, index) => (
                      <div key={index} className="flex gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-blue-800 text-sm leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

    </div>
  );
};
