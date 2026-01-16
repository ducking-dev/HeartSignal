'use client';

/**
 * HeartSignal 메인 페이지
 * Header + Main + Footer 레이아웃을 적용한 새로운 홈페이지
 */

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SessionRecorder } from '@/components/SessionRecorder';
import { LiveTranscriptPanel } from '@/components/LiveTranscriptPanel';
import { ScoreGauge } from '@/components/ScoreGauge';
import { FeedbackBubble } from '@/components/FeedbackBubble';
import { FadeIn, FadeInOnView } from '@/components/animation/FadeIn';
import { Stagger } from '@/components/animation/Stagger';
import { Heart, Mic, BarChart3, MessageSquare, Sparkles, Play } from 'lucide-react';
import { useAnalysisController } from '@/domain/controllers/useAnalysisController';
// Phase 2: 안전한 스토어와 Mock 로더 사용
// import { useUserStore } from '@/store/user/store';
// import { loadMockUserData } from '@/lib/user-mock-data';
import { useEnhancedUserStore } from '@/store/user/store-enhancer';
import { loadMockUserDataSafely } from '@/lib/user-mock-data-safe';
import { useSessionToHistorySync } from '@/hooks/useSessionToHistorySync';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// Phase 2: 개발 환경 모니터링
import { DuplicationMonitor } from '@/components/dev-tools/DuplicationMonitor';

export default function Home() {
  const controller = useAnalysisController();
  const router = useRouter();
  
  // Phase 2: Enhanced Store 사용
  const enhancedStore = useEnhancedUserStore();
  const { isAuthenticated } = enhancedStore;
  
  // v4.md 개선사항: 실제 세션 데이터와 사용자 히스토리 자동 연동
  const { saveCurrentSessionToHistory, canSaveSession } = useSessionToHistorySync();

  // Phase 2: 안전한 Mock 사용자 데이터 자동 로드
  useEffect(() => {
    if (!isAuthenticated) {
      const loaded = loadMockUserDataSafely(enhancedStore);
      if (loaded && process.env.NODE_ENV === 'development') {
        console.log('✅ Home: Mock 데이터 안전하게 로드됨');
      }
    }
  }, [isAuthenticated, enhancedStore]);

  const handleLoadMockData = () => {
    router.push('/mock-demo');
  };

  // v5.0 기능: 스크롤 네비게이션
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // v5.0 기능: 구독 처리
  const handleSubscribe = () => {
    alert('구독 기능은 곧 출시될 예정입니다! 🎉');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header showNavigation />
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          <Container>
            <FadeIn className="text-center space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-neutral-800/80 px-4 py-2 rounded-full border border-primary-200 dark:border-primary-700">
                <Heart className="h-4 w-4 text-primary-500" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  AI 기반 소개팅 분석 서비스
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100">
                감정은 <span className="text-primary-500">섬세하게</span>,<br />
                결과는 <span className="text-secondary-500">간단하게</span>
              </h1>
              
              <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                AI가 당신의 소개팅 대화를 실시간으로 분석하고, 
                더 나은 연결을 위한 구체적인 피드백을 제공합니다.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3" onClick={scrollToFeatures}>
                  <Play className="h-5 w-5 mr-2" />
                  지금 시작하기
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3" onClick={handleLoadMockData}>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Mock 데이터 로드
                </Button>
              </div>
            </FadeIn>
          </Container>
        </section>

        {/* Demo Section */}
        <section className="py-16 md:py-24">
          <Container>
            <FadeInOnView className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                실시간 대화 분석 체험
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                아래 버튼을 눌러 HeartSignal의 분석 기능을 직접 체험해보세요
              </p>
            </FadeInOnView>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* 왼쪽: 녹음 및 전사 */}
              <div className="space-y-6">
                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mic className="h-5 w-5 text-primary-500" />
                      <span>대화 녹음</span>
                    </CardTitle>
                    <CardDescription>
                      자연스럽게 대화해보세요. AI가 실시간으로 분석합니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SessionRecorder
                      phase={controller.phase}
                      duration={controller.duration}
                      currentRMS={0}
                      onStart={controller.startSession}
                      onStop={controller.stopAndAnalyze}
                      onReset={controller.resetSession}
                      error={controller.error}
                    />
                  </CardContent>
                </Card>

                <Card variant="elevated" padding="lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-secondary-500" />
                      <span>실시간 전사</span>
                    </CardTitle>
                    <CardDescription>
                      대화 내용이 실시간으로 텍스트로 변환됩니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LiveTranscriptPanel
                      segments={controller.segments}
                      isRealtime={controller.isRecording}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* 오른쪽: 분석 결과 */}
              <div className="space-y-6">
                {controller.match && (
                  <Card variant="elevated" padding="lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-primary-500" />
                        <span>매칭 점수</span>
                      </CardTitle>
                      <CardDescription>
                        대화의 전반적인 호감도와 매칭 가능성을 분석합니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScoreGauge
                        score={controller.match.score}
                        breakdown={controller.match.breakdown}
                        animated={true}
                      />
                    </CardContent>
                  </Card>
                )}

                {controller.feedback && (
                  <Card variant="ghost" padding="none">
                    <CardContent>
                      <FeedbackBubble
                        feedback={controller.feedback}
                        showTyping={false}
                      />
                    </CardContent>
                  </Card>
                )}

                {!controller.match && !controller.feedback && (
                  <Card variant="outlined" padding="lg">
                    <CardContent className="text-center py-12">
                      <Sparkles className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-600 dark:text-neutral-400">
                        대화를 시작하면 AI 분석 결과가 여기에 표시됩니다
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900/50">
          <Container>
            <FadeInOnView className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                HeartSignal의 특별한 기능들
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                AI 기술로 더 나은 소개팅 경험을 만들어드립니다
              </p>
            </FadeInOnView>

            <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Heart,
                  title: '감정 분석',
                  description: '대화 중 나타나는 감정 상태를 실시간으로 분석하여 상대방의 관심도를 파악합니다.',
                  badge: '실시간',
                },
                {
                  icon: MessageSquare,
                  title: '대화 균형 측정',
                  description: '대화의 균형도와 상호작용 품질을 측정하여 더 나은 소통을 도와드립니다.',
                  badge: '균형도',
                },
                {
                  icon: BarChart3,
                  title: '매칭 점수',
                  description: '종합적인 분석을 통해 0-100점 매칭 점수와 구체적인 개선 방향을 제시합니다.',
                  badge: '점수화',
                },
                {
                  icon: Sparkles,
                  title: '개인화된 피드백',
                  description: '당신만의 대화 스타일을 분석하여 맞춤형 개선 방안을 제공합니다.',
                  badge: '맞춤형',
                },
                {
                  icon: Mic,
                  title: '음성 분석',
                  description: '목소리 톤, 속도, 감정 등을 종합적으로 분석하여 더 깊이 있는 인사이트를 제공합니다.',
                  badge: '음성인식',
                },
                {
                  icon: Heart,
                  title: '라포 형성도',
                  description: '상대방과의 유대감과 호감도 형성 과정을 추적하고 분석합니다.',
                  badge: '관계분석',
                },
              ].map((feature, index) => (
                <Card key={index} variant="elevated" padding="lg" className="text-center">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                      <feature.icon className="h-6 w-6 text-primary-500" />
                    </div>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="outline" size="sm">
                        {feature.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-left">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </Stagger>
          </Container>
        </section>

        {/* Subscription CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30">
          <Container>
            <div className="text-center space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                더 나은 소개팅을 시작해보세요
              </h3>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                HeartSignal과 함께 성공적인 만남을 경험하고, 
                당신만의 연애 스토리를 만들어보세요.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
                  onClick={handleSubscribe}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  구독하기
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3"
                  onClick={() => router.push('/mypage')}
                >
                  마이페이지 보기
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Phase 2: 개발 환경 중복 데이터 모니터 */}
      <DuplicationMonitor />
    </div>
  );
}