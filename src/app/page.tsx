'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ImageSlider from '@/components/ImageSlider';

export default function Home() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로그인한 관리자라면 관리자 페이지로 자동 리다이렉트
    if (!loading && user && isAdmin) {
      console.log('🔄 관리자 계정 감지 - 관리자 페이지로 리다이렉트');
      router.push('/admin');
    }
  }, [user, isAdmin, loading, router]);

  // 관리자라면 빈 화면 표시 (리다이렉트 중)
  if (!loading && user && isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <ImageSlider />
    </div>
  );
}