'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ConversationHistory } from '@/store/user/types';

interface ConversationTimeChartProps {
  conversations: ConversationHistory[];
}

/**
 * 대화 시간 분포 차트
 * v4.md 개선사항: 히스토그램으로 대화 패턴 분석
 */
export function ConversationTimeChart({ conversations }: ConversationTimeChartProps) {
  // 대화 시간을 구간별로 분류
  const getTimeRange = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 5) return '5분 미만';
    if (minutes < 10) return '5-10분';
    if (minutes < 15) return '10-15분';
    if (minutes < 30) return '15-30분';
    if (minutes < 60) return '30분-1시간';
    return '1시간 이상';
  };

  // 구간별 데이터 집계
  const timeRanges = ['5분 미만', '5-10분', '10-15분', '15-30분', '30분-1시간', '1시간 이상'];
  const chartData = timeRanges.map(range => {
    const count = conversations.filter(conv => getTimeRange(conv.duration) === range).length;
    return {
      range,
      count,
      percentage: conversations.length > 0 ? Math.round((count / conversations.length) * 100) : 0
    };
  }).filter(item => item.count > 0); // 데이터가 있는 구간만 표시

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary">
            대화 수: {data.count}회
          </p>
          <p className="text-sm text-muted-foreground">
            비율: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
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
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-muted" 
          />
          <XAxis 
            dataKey="range"
            className="text-xs text-muted-foreground"
            axisLine={false}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            className="text-xs text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            className="hover:opacity-80 transition-opacity"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
