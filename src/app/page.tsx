'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import ImageSlider from '@/components/ImageSlider';

export default function Home() {
  const { user, isAdmin, loading } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // 로그인한 관리자라면 관리자 페이지로 자동 리다이렉트
    if (!loading && user && isAdmin) {
      console.log('🔄 관리자 계정 감지 - 관리자 페이지로 리다이렉트');
      router.push('/admin');
    }
  }, [user, isAdmin, loading, router]);

  // 페이지 타이틀을 설정값으로 동적 업데이트
  useEffect(() => {
    document.title = `${settings.general.siteName} - 골프용품 전문 도매몰`;
    
    // 메타 설명도 업데이트
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', settings.general.siteDescription);
    }
  }, [settings.general.siteName, settings.general.siteDescription, forceUpdate]);

  // 설정 업데이트 이벤트 리스너
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('🔄 MainPage: 설정 업데이트 감지', event.detail);
      setForceUpdate(prev => prev + 1);
      
      // 즉시 메타데이터 업데이트
      const newSettings = event.detail.settings;
      document.title = `${newSettings.general.siteName} - 골프용품 전문 도매몰`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', newSettings.general.siteDescription);
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

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