'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedUserStore } from '@/store/user/store-enhancer';
import { useToastHelpers } from '@/components/ui/enhanced/ToastSystem';
import { ArrowLeft, Share2, Calendar, Clock, TrendingUp, MessageSquare, Heart } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 대화 상세 보기 페이지 Props
 * Next.js 15 호환성: params는 Promise로 처리
 */
interface ConversationDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 대화 상세 보기 페이지
 * v6.0 개선사항: Next.js 15 호환성 적용
 */
export default async function ConversationDetailPage({ params }: ConversationDetailPageProps) {
  const { id: conversationId } = await params;
  
  return <ConversationDetailPageClient conversationId={conversationId} />;
}

/**
 * 클라이언트 컴포넌트 분리 (Single Responsibility Principle)
 * 서버 컴포넌트와 클라이언트 로직을 명확히 분리
 */
function ConversationDetailPageClient({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { conversations } = useEnhancedUserStore();
  const { success, error } = useToastHelpers();
  
  const conversation = conversations.find(conv => conv.id === conversationId);

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              대화를 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground mb-6">
              요청하신 대화가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => router.push('/mypage')}>
              마이페이지로 돌아가기
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${conversation.partnerName}님과의 대화 결과`,
          text: `매칭 점수 ${conversation.matchScore}점을 받았어요!`,
          url: window.location.href,
        });
        success('대화 결과가 공유되었습니다!');
      } catch (shareError) {
        // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
        if ((shareError as Error).name !== 'AbortError') {
          error('공유 중 오류가 발생했습니다.');
        }
      }
    } else {
      // Fallback: 클립보드에 복사
      try {
        await navigator.clipboard.writeText(window.location.href);
        success('링크가 클립보드에 복사되었습니다!');
      } catch (clipboardError) {
        error('클립보드 복사 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 페이지 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {conversation.partnerName}님과의 대화
                </h1>
                <p className="text-muted-foreground">
                  {formatDistanceToNow(conversation.date, { addSuffix: true, locale: ko })}
                </p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              공유하기
            </Button>
          </div>

          {/* 대화 요약 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                대화 요약
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">대화 날짜</p>
                    <p className="font-medium">
                      {format(conversation.date, 'yyyy년 M월 d일', { locale: ko })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">대화 시간</p>
                    <p className="font-medium">{formatDuration(conversation.duration)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">매칭 점수</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{conversation.matchScore}</span>
                      <Badge className={getMatchScoreColor(conversation.matchScore)}>
                        {conversation.matchScore >= 80 && '완벽한 케미'}
                        {conversation.matchScore >= 60 && conversation.matchScore < 80 && '좋은 시작'}
                        {conversation.matchScore >= 40 && conversation.matchScore < 60 && '발전 가능성'}
                        {conversation.matchScore < 40 && '더 노력 필요'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 분석 요약 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI 분석 요약
                </h3>
                <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
                  <p className="text-foreground leading-relaxed">
                    {conversation.summary}
                  </p>
                </div>
              </div>

              {/* 주요 하이라이트 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">주요 하이라이트</h3>
                <div className="space-y-2">
                  {conversation.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-foreground">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 대화 전사 내용 (향후 구현 예정) */}
          <Card>
            <CardHeader>
              <CardTitle>대화 전사 내용</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>대화 전사 내용은 향후 업데이트에서 제공될 예정입니다.</p>
                <p className="text-sm mt-2">현재는 AI 분석 요약과 하이라이트를 확인하실 수 있습니다.</p>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push('/mypage')}>
              마이페이지로 돌아가기
            </Button>
            <Button onClick={handleShare}>
              결과 공유하기
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
