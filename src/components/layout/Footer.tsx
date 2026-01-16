'use client';

/**
 * Footer - 애플리케이션 푸터 컴포넌트
 * 브랜딩, 링크, 소셜미디어를 포함하는 재사용 가능한 푸터
 */

import React from 'react';
import { Heart, Github, Twitter, Instagram } from 'lucide-react';
import { Container } from './Container';
import { cn } from '@/lib/utils';

export interface FooterProps {
  showBranding?: boolean;
  showLinks?: boolean;
  showSocial?: boolean;
  className?: string;
}

const currentYear = new Date().getFullYear();

export function Footer({
  showBranding = true,
  showLinks = true,
  showSocial = true,
  className,
}: FooterProps) {
  return (
    <footer
      className={cn(
        // 기본 푸터 스타일
        'border-t border-neutral-200 bg-neutral-50',
        'dark:border-neutral-700 dark:bg-neutral-900',
        
        // 높이 설정 (v1.md 기준 80px)
        'min-h-20',
        
        // 추가 클래스
        className
      )}
    >
      <Container className="py-6">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* 왼쪽: 브랜딩 */}
          {showBranding && (
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  HeartSignal
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  © {currentYear} HeartSignal. All rights reserved.
                </p>
              </div>
            </div>
          )}
          
          {/* 중앙: 링크 (데스크톱에서는 왼쪽으로 이동) */}
          {showLinks && (
            <nav className="flex flex-wrap items-center justify-center space-x-6 md:order-first md:ml-8">
              <a
                href="/privacy"
                className="text-xs text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
              >
                개인정보처리방침
              </a>
              <a
                href="/terms"
                className="text-xs text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
              >
                이용약관
              </a>
              <a
                href="/support"
                className="text-xs text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
              >
                고객지원
              </a>
              <a
                href="/about"
                className="text-xs text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
              >
                서비스 소개
              </a>
            </nav>
          )}
          
          {/* 오른쪽: 소셜미디어 */}
          {showSocial && (
            <div className="flex items-center space-x-3">
              <a
                href="https://github.com/heartsignal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/heartsignal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/heartsignal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
        
        {/* 추가 정보 (작은 텍스트) */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
            "감정은 섬세하게, 결과는 간단하게" - 더 나은 소개팅을 위한 AI 분석 서비스
          </p>
        </div>
      </Container>
    </footer>
  );
}

