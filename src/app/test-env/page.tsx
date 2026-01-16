'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Copy, FileText, Terminal } from 'lucide-react';

export default function TestEnvPage() {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  const envTemplate = `# HeartSignal 환경변수 설정
# 프로젝트 루트에 .env.local 파일로 저장하세요

# 필수: OpenAI API 키 (https://platform.openai.com/api-keys)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here

# 앱 환경 설정
NEXT_PUBLIC_APP_ENV=development`;

  const setupSteps = [
    {
      step: 1,
      title: "OpenAI API 키 발급",
      description: "https://platform.openai.com/api-keys 에서 계정을 만들고 API 키를 발급받으세요.",
      action: "웹사이트 방문"
    },
    {
      step: 2,
      title: ".env.local 파일 생성",
      description: "프로젝트 루트 디렉토리에 .env.local 파일을 생성하세요.",
      action: "파일 생성"
    },
    {
      step: 3,
      title: "환경변수 설정",
      description: "아래 템플릿을 복사해서 .env.local 파일에 붙여넣고 실제 API 키로 교체하세요.",
      action: "설정 완료"
    },
    {
      step: 4,
      title: "개발 서버 재시작",
      description: "npm run dev를 다시 실행해서 환경변수를 로드하세요.",
      action: "서버 재시작"
    }
  ];
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">환경변수 테스트</h1>
      <p className="text-gray-600 mb-8">HeartSignal의 AI 기능을 사용하기 위해 환경변수를 설정하세요.</p>
      
      {/* 현재 상태 확인 */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {apiKey ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>OpenAI API 키</span>
            </CardTitle>
            <CardDescription>
              AI 분석을 위한 OpenAI API 키 상태
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKey ? (
              <div className="space-y-2">
                <Badge variant="success">로드됨</Badge>
                <div className="text-sm text-gray-600">
                  길이: {apiKey.length}자<br />
                  <code className="text-xs bg-gray-100 p-1 rounded">
                    {apiKey.substring(0, 10)}...{apiKey.substring(apiKey.length - 4)}
                  </code>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="destructive">로드 안됨</Badge>
                <p className="text-sm text-red-600">
                  환경변수가 설정되지 않았습니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {appEnv ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>앱 환경</span>
            </CardTitle>
            <CardDescription>
              애플리케이션 환경 설정 상태
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appEnv ? (
              <div className="space-y-2">
                <Badge variant="success">{appEnv}</Badge>
                <p className="text-sm text-gray-600">
                  환경이 올바르게 설정되었습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="outline">기본값 사용</Badge>
                <p className="text-sm text-gray-600">
                  선택적 설정입니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 설정이 필요한 경우 안내 */}
      {!apiKey && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>환경변수 설정이 필요합니다</span>
            </CardTitle>
            <CardDescription className="text-orange-700">
              AI 기능을 사용하려면 OpenAI API 키를 설정해야 합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {setupSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-orange-900">{step.title}</h3>
                  <p className="text-sm text-orange-700 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 환경변수 템플릿 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>환경변수 템플릿</span>
          </CardTitle>
          <CardDescription>
            아래 내용을 복사해서 프로젝트 루트의 .env.local 파일에 저장하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{envTemplate}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(envTemplate, 'template')}
            >
              {copied === 'template' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied === 'template' ? '복사됨!' : '복사'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 터미널 명령어 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span>터미널 명령어</span>
          </CardTitle>
          <CardDescription>
            환경변수 설정 후 개발 서버를 재시작하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-black text-green-400 p-4 rounded-lg text-sm">
                <code># 개발 서버 중지 (Ctrl+C){'\n'}# 그 다음 다시 시작{'\n'}npm run dev</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard('npm run dev', 'command')}
              >
                {copied === 'command' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === 'command' ? '복사됨!' : '복사'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 디버그 버튼 */}
      <Card>
        <CardHeader>
          <CardTitle>디버그 도구</CardTitle>
          <CardDescription>
            개발자 콘솔에서 환경변수 상태를 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => {
              console.log('=== HeartSignal 환경변수 디버그 ===');
              console.log('NEXT_PUBLIC_OPENAI_API_KEY:', apiKey ? `✅ 로드됨 (${apiKey.length}자)` : '❌ 로드 안됨');
              console.log('NEXT_PUBLIC_APP_ENV:', appEnv || '설정되지 않음');
              console.log('전체 NEXT_PUBLIC 변수들:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
              console.log('전체 process.env:', process.env);
              console.log('=====================================');
            }}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Terminal className="h-4 w-4" />
            <span>콘솔에 환경변수 출력</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
