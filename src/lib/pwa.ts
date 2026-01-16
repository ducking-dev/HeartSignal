/**
 * PWA Utilities - Progressive Web App 기능을 위한 유틸리티들
 * 오프라인 지원, 설치 프롬프트, 푸시 알림 등
 */

import { useState, useEffect, useCallback } from 'react';

// PWA 설치 가능 여부 및 설치 프롬프트 관리
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 이미 설치된 PWA인지 확인
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkIfInstalled();

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setIsInstallable(true);
    };

    // 설치 완료 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      console.log('PWA가 성공적으로 설치되었습니다');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    const result = await installPrompt.prompt();
    const userChoice = await result.userChoice;

    if (userChoice === 'accepted') {
      console.log('사용자가 PWA 설치를 수락했습니다');
      return true;
    } else {
      console.log('사용자가 PWA 설치를 거부했습니다');
      return false;
    }
  }, [installPrompt]);

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  };
}

// 온라인/오프라인 상태 관리
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// 서비스 워커 등록 및 관리
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('서비스 워커가 등록되었습니다:', registration);

      // 업데이트 확인
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('새로운 버전이 사용 가능합니다');
              // 사용자에게 새로고침 프롬프트 표시
              showUpdatePrompt();
            }
          });
        }
      });

      return registration;
    })
    .catch((error) => {
      console.error('서비스 워커 등록 실패:', error);
      return null;
    });
}

// 업데이트 프롬프트 표시
function showUpdatePrompt() {
  if (confirm('새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?')) {
    window.location.reload();
  }
}

// 푸시 알림 권한 요청 및 구독
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('알림 권한이 거부되었습니다');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// 로컬 알림 표시
export function showLocalNotification(
  title: string,
  options: NotificationOptions = {}
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    ...options,
  });

  // 자동으로 닫기 (5초 후)
  setTimeout(() => {
    notification.close();
  }, 5000);

  return notification;
}

// 캐시 관리
export class CacheManager {
  static async clearOldCaches() {
    if (!('caches' in window)) return;

    const cacheNames = await caches.keys();
    const currentCaches = ['heartsignal-v1', 'heartsignal-static-v1'];
    
    const deletePromises = cacheNames
      .filter(name => !currentCaches.includes(name))
      .map(name => caches.delete(name));

    await Promise.all(deletePromises);
  }

  static async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    let totalSize = 0;
    const cacheNames = await caches.keys();

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  }

  static async clearAllCaches() {
    if (!('caches' in window)) return;

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

// PWA 설치 프롬프트 컴포넌트
export function InstallPrompt() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      // 설치 가능할 때 3초 후에 프롬프트 표시
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 24시간 동안 다시 표시하지 않음
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  // 이미 거부한 경우 24시간 동안 표시하지 않음
  useEffect(() => {
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);
      
      if (hoursPassed < 24) {
        setShowPrompt(false);
        return;
      }
    }
  }, []);

  if (!showPrompt || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💖</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              HeartSignal 설치하기
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              홈 화면에 추가하여 더 빠르고 편리하게 사용하세요
            </p>
            
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleInstall}
                className="bg-primary-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-600 transition-colors"
              >
                설치하기
              </button>
              <button
                onClick={handleDismiss}
                className="bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 px-3 py-1 rounded text-xs font-medium hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors"
              >
                나중에
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// 오프라인 표시 컴포넌트
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.
    </div>
  );
}

// PWA 상태 확인 훅
export function usePWAStatus() {
  const [isPWA, setIsPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    const checkPWAStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isPWAMode = isStandaloneMode || isInWebAppiOS;
      
      setIsPWA(isPWAMode);
      setIsStandalone(isStandaloneMode);
    };

    checkPWAStatus();
    
    // display-mode 변경 감지
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWAStatus);
    
    return () => {
      mediaQuery.removeEventListener('change', checkPWAStatus);
    };
  }, []);

  return { isPWA, isStandalone };
}

