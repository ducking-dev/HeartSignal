'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/store/user/store';
import { useTheme } from '@/contexts/AppContext';
import { useToastHelpers } from '@/components/ui/enhanced/ToastSystem';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * 사용자 설정 페이지
 * v4.md 개선사항: 사용자 설정 페이지 구현
 */
export default function SettingsPage() {
  const router = useRouter();
  const { profile, setProfile, logout, isAuthenticated } = useUserStore();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToastHelpers();

  // 폼 상태
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age || 25,
    bio: profile?.bio || '',
    location: profile?.location || '',
    occupation: profile?.occupation || '',
    interests: profile?.interests || []
  });

  // 알림 설정
  const [notifications, setNotifications] = useState({
    newMessages: true,
    analysisComplete: true,
    weeklyReport: false,
    marketing: false
  });

  // 개인정보 설정
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareAnalytics: false,
    dataRetention: true
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              로그인이 필요합니다
            </h1>
            <p className="text-muted-foreground mb-6">
              설정 페이지를 이용하려면 먼저 로그인해주세요.
            </p>
            <Button onClick={() => router.push('/')}>
              홈으로 돌아가기
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const handleSaveProfile = () => {
    try {
      const updatedProfile = {
        ...profile,
        ...formData,
        interests: formData.interests
      };
      
      setProfile(updatedProfile);
      success('프로필이 성공적으로 업데이트되었습니다!');
    } catch (err) {
      error('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      logout();
      success('계정이 삭제되었습니다.');
      router.push('/');
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 5000); // 5초 후 자동 취소
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 페이지 헤더 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">설정</h1>
              <p className="text-muted-foreground">
                계정 정보와 앱 설정을 관리하세요
              </p>
            </div>
          </div>

          {/* 프로필 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                프로필 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="age">나이</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    min="18"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="location">지역</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="거주 지역"
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">직업</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    placeholder="직업을 입력하세요"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="자신을 소개해보세요"
                  rows={4}
                />
              </div>

              {/* 관심사 */}
              <div>
                <Label>관심사</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive/20"
                      onClick={() => handleRemoveInterest(interest)}
                    >
                      {interest} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="새 관심사 추가"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                  />
                  <Button onClick={handleAddInterest} variant="outline">
                    추가
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                프로필 저장
              </Button>
            </CardContent>
          </Card>

          {/* 알림 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'newMessages', label: '새 메시지 알림', desc: '새로운 대화 요청이 있을 때 알림' },
                { key: 'analysisComplete', label: '분석 완료 알림', desc: '대화 분석이 완료되었을 때 알림' },
                { key: 'weeklyReport', label: '주간 리포트', desc: '주간 활동 요약 리포트 수신' },
                { key: 'marketing', label: '마케팅 알림', desc: '새로운 기능 및 이벤트 소식' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 테마 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                테마 설정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">다크 모드</div>
                  <div className="text-sm text-muted-foreground">
                    현재: {theme.name === 'dark' ? '다크 모드' : '라이트 모드'}
                  </div>
                </div>
                <Switch
                  checked={theme.name === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* 개인정보 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                개인정보 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'profileVisible', label: '프로필 공개', desc: '다른 사용자에게 프로필 정보 공개', icon: Eye },
                { key: 'shareAnalytics', label: '분석 데이터 공유', desc: '서비스 개선을 위한 익명 데이터 공유', icon: EyeOff },
                { key: 'dataRetention', label: '데이터 보관', desc: '대화 기록 및 분석 결과 보관', icon: Shield }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                    <Switch
                      checked={privacy[item.key as keyof typeof privacy]}
                      onCheckedChange={(checked) => 
                        setPrivacy(prev => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 계정 관리 */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                계정 관리
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">계정 삭제</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <Button
                    variant={showDeleteConfirm ? "destructive" : "outline"}
                    onClick={handleDeleteAccount}
                    className={showDeleteConfirm ? "animate-pulse" : ""}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {showDeleteConfirm ? '정말로 삭제하시겠습니까?' : '계정 삭제'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
