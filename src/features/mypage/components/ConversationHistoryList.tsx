'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/store/user/store';
import { ConversationCardSkeleton } from '@/components/ui/enhanced/SkeletonCard';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ConversationHistory } from '@/store/user/types';

interface ConversationCardProps {
  conversation: ConversationHistory;
  onViewDetails?: (conversation: ConversationHistory) => void;
}

function ConversationCard({ conversation, onViewDetails }: ConversationCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails?.(conversation)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* 상대방 정보 */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {conversation.partnerName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {conversation.partnerName} ({conversation.partnerAge}세)
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {formatDistanceToNow(conversation.date, { 
                    addSuffix: true, 
                    locale: ko 
                  })}
                </p>
              </div>
            </div>

            {/* 대화 정보 */}
            <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(conversation.duration)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(conversation.date, 'M월 d일', { locale: ko })}
              </div>
            </div>

            {/* 요약 */}
            <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
              {conversation.summary}
            </p>

            {/* 하이라이트 */}
            {conversation.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {conversation.highlights.slice(0, 2).map((highlight, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
                {conversation.highlights.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{conversation.highlights.length - 2}개
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* 매칭 점수와 상태 */}
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(conversation.matchScore)}`}>
              {conversation.matchScore}%
            </div>
            <Badge 
              variant={conversation.status === 'completed' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {conversation.status === 'completed' ? '완료' : 
               conversation.status === 'ongoing' ? '진행중' : '취소됨'}
            </Badge>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversationHistoryList() {
  const { conversations } = useUserStore();

  const handleViewDetails = (conversation: ConversationHistory) => {
    // v4.md 개선사항: 대화 상세 보기 페이지로 이동
    window.location.href = `/conversation/${conversation.id}`;
  };

  if (conversations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary-500" />
            대화 히스토리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-500 mb-4">아직 대화 기록이 없어요</p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              첫 대화 시작하기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary-500" />
          대화 히스토리
          <Badge variant="secondary" className="ml-auto">
            {conversations.length}개
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedConversations.map((conversation) => (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            onViewDetails={handleViewDetails}
          />
        ))}
      </CardContent>
    </Card>
  );
}
