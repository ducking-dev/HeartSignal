'use client';

// 개발 환경 전용: 중복 데이터 실시간 모니터링 컴포넌트
import React, { useState, useEffect } from 'react';
import { useEnhancedUserStore } from '@/store/user/store-enhancer';
import { DuplicationGuard, MemoryMonitor } from '@/lib/instance-tracker';
import { debugMockDataState } from '@/lib/user-mock-data-safe';

interface DuplicationStats {
  totalConversations: number;
  uniqueIds: number;
  duplicateCount: number;
  lastUpdate: string;
}

export function DuplicationMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<DuplicationStats | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const enhancedStore = useEnhancedUserStore();

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const updateStats = () => {
    const conversations = enhancedStore.conversations;
    const uniqueIds = new Set(conversations.map(c => c.id));
    
    const newStats: DuplicationStats = {
      totalConversations: conversations.length,
      uniqueIds: uniqueIds.size,
      duplicateCount: conversations.length - uniqueIds.size,
      lastUpdate: new Date().toLocaleTimeString(),
    };
    
    setStats(newStats);
    
    // 중복이 발견되면 콘솔에 경고
    if (newStats.duplicateCount > 0) {
      console.warn(`🚨 중복 데이터 발견: ${newStats.duplicateCount}개`);
      DuplicationGuard.debugAll();
    }
  };

  const handleRemoveDuplicates = () => {
    const removed = enhancedStore.removeDuplicates();
    console.log(`🧹 중복 제거 완료: ${removed}개 제거됨`);
    updateStats();
  };

  const handleDebugState = () => {
    debugMockDataState(enhancedStore);
    DuplicationGuard.debugAll();
    MemoryMonitor.log('Debug State Check');
  };

  const handleResetAll = () => {
    DuplicationGuard.resetAll();
    enhancedStore.reset();
    console.log('🔄 모든 데이터 리셋 완료');
    updateStats();
  };

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, enhancedStore.conversations]);

  // 초기 로드
  useEffect(() => {
    updateStats();
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
        >
          🔍 Dev Monitor
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">🔍 Duplication Monitor</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs px-2 py-1 rounded ${
              autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {autoRefresh ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>
      </div>

      {stats && (
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">총 대화:</span>
              <span className="font-mono ml-1">{stats.totalConversations}</span>
            </div>
            <div>
              <span className="text-gray-600">고유 ID:</span>
              <span className="font-mono ml-1">{stats.uniqueIds}</span>
            </div>
          </div>
          
          <div className={`p-2 rounded text-sm ${
            stats.duplicateCount > 0 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={stats.duplicateCount > 0 ? 'text-red-700' : 'text-green-700'}>
                {stats.duplicateCount > 0 ? '🚨 중복:' : '✅ 중복:'}
              </span>
              <span className={`font-mono ${stats.duplicateCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {stats.duplicateCount}개
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            마지막 업데이트: {stats.lastUpdate}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={updateStats}
            className="text-xs px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
          >
            🔄 새로고침
          </button>
          <button
            onClick={handleDebugState}
            className="text-xs px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
          >
            🐛 디버그
          </button>
        </div>
        
        {stats && stats.duplicateCount > 0 && (
          <button
            onClick={handleRemoveDuplicates}
            className="w-full text-xs px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
          >
            🧹 중복 제거
          </button>
        )}
        
        <button
          onClick={handleResetAll}
          className="w-full text-xs px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
        >
          🔄 전체 리셋
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div>Phase 2: 비침습적 해결 방안 활성화</div>
          <div>Enhanced Store: {enhancedStore._enhanced ? '✅' : '❌'}</div>
        </div>
      </div>
    </div>
  );
}
