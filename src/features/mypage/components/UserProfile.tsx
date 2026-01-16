'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { MapPin, Briefcase, Calendar, Heart } from 'lucide-react';
import { useUserStore } from '@/store/user/store';
import { UserProfileSkeleton } from '@/components/ui/enhanced/SkeletonCard';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const UserProfile = React.memo(function UserProfile() {
  const { profile, stats } = useUserStore();

  if (!profile) {
    return (
      <Card>
        <UserProfileSkeleton />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary-500" />
          내 프로필
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 기본 정보 */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <img 
              src={profile.profileImage || 'https://picsum.photos/200/200?random=1'} 
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {profile.name}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                {profile.age}세 • {profile.gender === 'male' ? '남성' : '여성'}
              </p>
            </div>
            
            <div className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-400">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              {profile.occupation && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {profile.occupation}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(profile.joinedAt, 'yyyy년 M월 가입', { locale: ko })}
              </div>
            </div>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="space-y-2">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            자기소개
          </h3>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {profile.bio}
          </p>
        </div>

        {/* 관심사 */}
        <div className="space-y-2">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            관심사
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, index) => (
              <Badge key={index} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* 통계 정보 */}
        {stats && (
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              활동 통계
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold text-primary-500">
                  {stats.totalConversations}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  총 대화 수
                </div>
              </div>
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold text-primary-500">
                  {stats.averageMatchScore}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  평균 매칭율
                </div>
              </div>
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold text-primary-500">
                  {Math.floor(stats.totalDuration / 60)}분
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  총 대화 시간
                </div>
              </div>
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-2xl font-bold text-primary-500">
                  {stats.bestMatchScore}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  최고 매칭율
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
