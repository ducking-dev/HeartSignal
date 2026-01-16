import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ui/enhanced/ToastSystem';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HeartSignal - AI 소개팅 대화 분석',
  description: '감정은 섬세하게, 결과는 간단하게 - AI가 분석하는 소개팅 대화',
  keywords: ['소개팅', '대화분석', 'AI', '매칭', '연애'],
  authors: [{ name: 'HeartSignal Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#E95877',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 초기 렌더링 깜빡임 방지 스크립트 (v4.md 개선사항) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('heartsignal-theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // localStorage 접근 실패 시 시스템 테마 사용
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ErrorBoundary>
          <AppProvider>
            <ToastProvider>
              <Providers>
                {children}
                <Toaster />
              </Providers>
            </ToastProvider>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
