'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';

// 동적 import로 클라이언트 사이드 렌더링만 하도록 설정
const MockAnalysisDemo = dynamic(() => import('@/components/MockAnalysisDemo'), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto text-center">
      <Card className="p-12 bg-white/80 backdrop-blur-sm border-pink-200 shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-pink-500" />
          <span className="ml-3 text-2xl font-semibold text-gray-800">Heart Signal</span>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      </Card>
    </div>
  )
});

/**
 * Mock 데이터 데모 페이지 - API 분석 로딩 및 결과 시각화
 */
export default function MockDemoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <Header showNavigation />
      
      <main className="flex-1 py-8">
        <Container>
          <MockAnalysisDemo />
        </Container>
      </main>
      
      <Footer />
    </div>
  );
}
