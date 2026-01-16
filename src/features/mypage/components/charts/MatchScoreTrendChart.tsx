'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ConversationHistory } from '@/store/user/types';

interface MatchScoreTrendChartProps {
  conversations: ConversationHistory[];
}

/**
 * 매칭 점수 트렌드 차트
 * v4.md 개선사항: 시간축 기반 점수 변화 추적
 */
export const MatchScoreTrendChart = React.memo(function MatchScoreTrendChart({ conversations }: MatchScoreTrendChartProps) {
  // 대화를 날짜순으로 정렬하고 차트 데이터로 변환
  const chartData = conversations
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((conv, index) => ({
      index: index + 1,
      score: conv.matchScore,
      date: conv.date,
      partnerName: conv.partnerName,
      formattedDate: format(conv.date, 'M/d', { locale: ko })
    }));

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">
            {data.partnerName}님과의 대화
          </p>
          <p className="text-sm text-muted-foreground">
            {format(data.date, 'yyyy년 M월 d일', { locale: ko })}
          </p>
          <p className="text-sm font-medium text-primary">
            매칭 점수: {data.score}점
          </p>
        </div>
      );
    }
    return null;
  };

  // 점수에 따른 선 색상 결정
  const getLineColor = () => {
    const avgScore = chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length;
    if (avgScore >= 80) return '#10b981'; // green
    if (avgScore >= 60) return '#f59e0b'; // amber  
    return '#ef4444'; // red
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>표시할 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-muted" 
          />
          <XAxis 
            dataKey="formattedDate"
            className="text-xs text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]}
            className="text-xs text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke={getLineColor()}
            strokeWidth={3}
            dot={{ fill: getLineColor(), strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: getLineColor(), strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
