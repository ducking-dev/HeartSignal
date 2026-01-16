'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ConversationHistory } from '@/store/user/types';

interface InterestSuccessChartProps {
  conversations: ConversationHistory[];
  userInterests: string[];
}

/**
 * 관심사별 매칭 성공률 도넛 차트
 * v4.md 개선사항: 관심사 효과성 분석
 */
export function InterestSuccessChart({ conversations, userInterests }: InterestSuccessChartProps) {
  // 관심사별 성공률 계산 (임시로 랜덤 데이터 사용, 실제로는 AI 분석 결과 활용)
  const calculateSuccessRate = (interest: string): number => {
    // 실제 구현에서는 대화 내용에서 해당 관심사가 언급된 대화들의 평균 점수를 계산
    const seed = interest.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Math.floor(60 + (seed % 35)); // 60-95% 범위의 성공률
  };

  const chartData = userInterests.slice(0, 6).map((interest, index) => {
    const successRate = calculateSuccessRate(interest);
    const relatedConversations = Math.floor(conversations.length * (0.3 + Math.random() * 0.4));
    
    return {
      name: interest,
      value: successRate,
      count: relatedConversations,
      color: COLORS[index % COLORS.length]
    };
  });

  // 차트 색상 팔레트
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))', 
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ef4444', // red
  ];

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-primary">
            성공률: {data.value}%
          </p>
          <p className="text-sm text-muted-foreground">
            관련 대화: {data.count}회
          </p>
        </div>
      );
    }
    return null;
  };

  // 커스텀 레이블
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.1 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // 커스텀 레전드
  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>관심사 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="40%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
