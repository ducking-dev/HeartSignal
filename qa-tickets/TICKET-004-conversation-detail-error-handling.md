# 티켓 #004: 대화 상세 페이지에서 존재하지 않는 대화 ID 처리 개선

**티켓 번호**: TICKET-004  
**심각도**: 🟠 High  
**우선순위**: P1 (1주일 내 수정)  
**작성일**: 2024년 12월  
**담당자**: 개발팀

---

## 📋 문제 요약

대화 상세 페이지(`/conversation/[id]`)에서 존재하지 않는 대화 ID로 접근할 때 에러 페이지는 표시되지만, 사용자 경험을 개선할 수 있는 여지가 있습니다.

---

## 🔍 상세 설명

### 현재 구현
```typescript
const conversation = conversations.find(conv => conv.id === conversationId);

if (!conversation) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Container className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            대화를 찾을 수 없습니다
          </h1>
          <p className="text-muted-foreground mb-6">
            요청하신 대화가 존재하지 않거나 삭제되었습니다.
          </p>
          <Button onClick={() => router.push('/mypage')}>
            마이페이지로 돌아가기
          </Button>
        </div>
      </Container>
    </div>
  );
}
```

### 문제점
1. 로딩 상태가 없음 (데이터 로딩 중인지, 없는지 구분 불가)
2. 에러 메시지가 단순함
3. 자동 리다이렉트 옵션이 없음
4. 사용자가 어떻게 이 페이지에 도달했는지 추적 어려움

---

## 🐛 시나리오

1. 사용자가 직접 URL 입력 (`/conversation/invalid-id`)
2. 삭제된 대화 링크 클릭
3. 잘못된 링크 공유

---

## ✅ 해결 방안

### 개선된 에러 처리

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

function ConversationDetailPageClient({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const { conversations } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [autoRedirect, setAutoRedirect] = useState(false);

  useEffect(() => {
    // 데이터 로딩 시뮬레이션 (실제로는 필요 없을 수 있음)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 자동 리다이렉트 옵션
  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        router.push('/mypage');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoRedirect, router]);

  const conversation = conversations.find(conv => conv.id === conversationId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">대화 정보를 불러오는 중...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                대화를 찾을 수 없습니다
              </h1>
              <p className="text-muted-foreground">
                요청하신 대화가 존재하지 않거나 삭제되었습니다.
              </p>
              <p className="text-sm text-muted-foreground">
                대화 ID: <code className="bg-muted px-2 py-1 rounded">{conversationId}</code>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/mypage')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                마이페이지로 돌아가기
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="h-4 w-4 mr-2" />
                홈으로 가기
              </Button>
            </div>

            {autoRedirect && (
              <p className="text-sm text-muted-foreground">
                3초 후 마이페이지로 자동 이동합니다...
              </p>
            )}

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setAutoRedirect(true)}
              className="text-xs"
            >
              자동 리다이렉트 활성화
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // ... 기존 대화 상세 표시 코드 ...
}
```

---

## 📁 관련 파일

- `src/app/conversation/[id]/page.tsx` - **수정 필요**

---

## 🧪 테스트 계획

1. **기능 테스트**
   - 존재하지 않는 ID로 접근 시 에러 페이지 표시 확인
   - 로딩 상태 표시 확인
   - 자동 리다이렉트 기능 확인

2. **사용자 경험 테스트**
   - 에러 메시지 명확성 확인
   - 네비게이션 버튼 동작 확인

---

## 📊 영향도 분석

**개선 효과**:
- 사용자 경험 향상
- 에러 상황에 대한 명확한 안내
- 자동 복구 옵션 제공

**영향받는 사용자**:
- 잘못된 링크로 접근한 사용자
- 삭제된 대화 링크를 클릭한 사용자

---

## 📝 체크리스트

- [ ] 로딩 상태 추가
- [ ] 에러 메시지 개선
- [ ] 자동 리다이렉트 옵션 추가
- [ ] 테스트 완료
- [ ] 코드 리뷰 완료
- [ ] 배포 전 검증 완료

---

## 🔗 관련 티켓

- 독립적인 이슈
