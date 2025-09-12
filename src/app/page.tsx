'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import ImageSlider from '@/components/ImageSlider';

export default function Home() {
  // const { user, isAdmin, loading } = useAuth();
  const { settings } = useSettings();
  // const router = useRouter();
  const [forceUpdate, setForceUpdate] = useState(0);

  // 관리자 자동 리다이렉트 제거 - 홈페이지도 볼 수 있게 함

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

  // 관리자도 홈페이지를 볼 수 있도록 로딩 화면 제거

  return (
    <div>
      <ImageSlider />
    </div>
  );
}