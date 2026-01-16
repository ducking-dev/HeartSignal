'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, MessageCircle, Trophy, Heart, Target, BarChart3, PieChart } from 'lucide-react';
import { useUserStore } from '@/store/user/store';
import { 
  LazyMatchScoreTrendChart, 
  LazyConversationTimeChart, 
  LazyInterestSuccessChart 
} from './charts';
import { StatsSkeleton, ChartSkeleton } from '@/components/ui/enhanced/SkeletonCard';

export const UserStats = React.memo(function UserStats() {
  const { stats, conversations, profile } = useUserStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'distribution' | 'interests'>('overview');

  if (!stats) {
    return (
      <Card>
        <StatsSkeleton />
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' };
    if (score >= 80) return { grade: 'A', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' };
    if (score >= 70) return { grade: 'B+', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' };
    if (score >= 60) return { grade: 'B', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' };
    if (score >= 50) return { grade: 'C+', color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' };
    return { grade: 'C', color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20' };
  };

  const averageGrade = getScoreGrade(stats.averageMatchScore);
  const bestGrade = getScoreGrade(stats.bestMatchScore);

  // 최근 대화들의 트렌드 계산
  const recentConversations = conversations
    .filter(conv => conv.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const recentAverage = recentConversations.length > 0
    ? recentConversations.reduce((sum, conv) => sum + conv.matchScore, 0) / recentConversations.length
    : 0;

  const trend = recentAverage > stats.averageMatchScore ? 'up' : 
                recentAverage < stats.averageMatchScore ? 'down' : 'stable';

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            통계 대시보드
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { id: 'overview', label: '개요', icon: TrendingUp },
              { id: 'trends', label: '트렌드', icon: BarChart3 },
              { id: 'distribution', label: '분포', icon: BarChart3 },
              { id: 'interests', label: '관심사', icon: PieChart }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(id as any)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* 탭 컨텐츠 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 주요 통계 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalConversations}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    총 대화 수
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/20 rounded-lg">
                  <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.averageMatchScore}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    평균 매칭율
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatTime(stats.totalDuration)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    총 대화 시간
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/20 rounded-lg">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.bestMatchScore}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    최고 매칭율
                  </div>
                </div>
              </div>

              {/* 성과 분석 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">성과 분석</h3>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">평균 매칭 등급</h4>
                    <p className="text-sm text-muted-foreground">전체 대화 기준</p>
                  </div>
                  <Badge className={averageGrade.color}>
                    {averageGrade.grade}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">최고 매칭 등급</h4>
                    <p className="text-sm text-muted-foreground">개인 최고 기록</p>
                  </div>
                  <Badge className={bestGrade.color}>
                    {bestGrade.grade}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">매칭 점수 트렌드</h3>
              <p className="text-sm text-muted-foreground">시간에 따른 매칭 점수 변화를 확인하세요</p>
              <LazyMatchScoreTrendChart conversations={conversations} />
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">대화 시간 분포</h3>
              <p className="text-sm text-muted-foreground">대화 시간대별 분포를 확인하세요</p>
              <LazyConversationTimeChart conversations={conversations} />
            </div>
          )}

          {activeTab === 'interests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">관심사별 성공률</h3>
              <p className="text-sm text-muted-foreground">관심사가 대화에 미치는 영향을 분석합니다</p>
              <LazyInterestSuccessChart 
                conversations={conversations} 
                userInterests={profile?.interests || []}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
