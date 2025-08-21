'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  operatingHours: string;
  holidays: string;
}

export interface StoreSettings {
  businessNumber: string;
  businessRegistration: string;
  companyName: string;
  representative: string;
  address: string;
  phone: string;
  email: string;
}

export interface ShippingSettings {
  baseShippingCost: number;
  freeShippingThreshold: number;
  jejuAdditionalCost: number;
  islandAdditionalCost: number;
  defaultCarrier: string;
}

export interface PaymentSettings {
  enabledMethods: {
    card: boolean;
    transfer: boolean;
    vbank: boolean;
    phone: boolean;
    kakaopay: boolean;
    naverpay: boolean;
  };
  pgProvider: string;
  refundPeriod: number;
}

export interface NotificationSettings {
  emailNotifications: {
    newOrder: boolean;
    paymentComplete: boolean;
    lowStock: boolean;
    newReview: boolean;
    dailyReport: boolean;
  };
  notificationEmail: string;
}

export interface SecuritySettings {
  securityPolicies: {
    loginLog: boolean;
    twoFactor: boolean;
    ipWhitelist: boolean;
  };
  sessionTimeout: number;
  allowedIPs: string;
}

export interface AllSettings {
  general: GeneralSettings;
  store: StoreSettings;
  shipping: ShippingSettings;
  payment: PaymentSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

interface SettingsContextType {
  settings: AllSettings;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  updateShippingSettings: (settings: Partial<ShippingSettings>) => void;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  saveSettings: () => void;
  resetToDefaults: () => void;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

// 기본 설정값
const defaultSettings: AllSettings = {
  general: {
    siteName: '골프상회',
    siteDescription: '최고 품질의 골프용품을 합리적인 가격에 제공하는 골프상회입니다.',
    operatingHours: '평일 09:00 - 18:00',
    holidays: '토요일, 일요일, 공휴일'
  },
  store: {
    businessNumber: '740-47-00888',
    businessRegistration: '제 2023-화성봉담-0314호',
    companyName: '골프상회',
    representative: '홍길동',
    address: '경기도 수원시 권선구 세지로28번길 15-30 104호',
    phone: '010-7236-8400',
    email: 'crover.kk@gmail.com'
  },
  shipping: {
    baseShippingCost: 3000,
    freeShippingThreshold: 50000,
    jejuAdditionalCost: 3000,
    islandAdditionalCost: 5000,
    defaultCarrier: 'CJ대한통운'
  },
  payment: {
    enabledMethods: {
      card: true,
      transfer: true,
      vbank: true,
      phone: false,
      kakaopay: true,
      naverpay: false
    },
    pgProvider: '토스페이먼츠',
    refundPeriod: 7
  },
  notifications: {
    emailNotifications: {
      newOrder: true,
      paymentComplete: true,
      lowStock: true,
      newReview: false,
      dailyReport: true
    },
    notificationEmail: 'admin@golf.com'
  },
  security: {
    securityPolicies: {
      loginLog: true,
      twoFactor: true,
      ipWhitelist: false
    },
    sessionTimeout: 60,
    allowedIPs: ''
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AllSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<AllSettings>(defaultSettings);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 컴포넌트 마운트 시 저장된 설정 불러오기
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedData = localStorage.getItem('adminSettings');
        if (savedData) {
          const parsedSettings = JSON.parse(savedData);
          setSettings(parsedSettings.settings);
          setSavedSettings(parsedSettings.settings);
          setLastSaved(new Date(parsedSettings.lastSaved));
        }
      } catch (error) {
        console.error('설정 불러오기 실패:', error);
      }
    };

    loadSettings();
  }, []);

  // 변경사항 여부 계산
  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const updateGeneralSettings = (newSettings: Partial<GeneralSettings>) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, ...newSettings }
    }));
  };

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({
      ...prev,
      store: { ...prev.store, ...newSettings }
    }));
  };

  const updateShippingSettings = (newSettings: Partial<ShippingSettings>) => {
    setSettings(prev => ({
      ...prev,
      shipping: { ...prev.shipping, ...newSettings }
    }));
  };

  const updatePaymentSettings = (newSettings: Partial<PaymentSettings>) => {
    setSettings(prev => ({
      ...prev,
      payment: { ...prev.payment, ...newSettings }
    }));
  };

  const updateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...newSettings }
    }));
  };

  const updateSecuritySettings = (newSettings: Partial<SecuritySettings>) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, ...newSettings }
    }));
  };

  const saveSettings = () => {
    try {
      const dataToSave = {
        settings,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('adminSettings', JSON.stringify(dataToSave));
      setSavedSettings(settings);
      setLastSaved(new Date());
      
      // 저장 후 강제 리렌더링을 위한 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: { settings, timestamp: new Date() } 
      }));
      
      // 성공 알림 - 더 상세한 피드백
      const categoryNames = {
        'general': '일반 설정',
        'store': '스토어 정보', 
        'shipping': '배송 설정',
        'payment': '결제 설정',
        'notifications': '알림 설정',
        'security': '보안 설정'
      };
      
      const applyCount = Object.keys(settings).length;
      const appliedSettings = Object.keys(settings).map(key => categoryNames[key as keyof typeof categoryNames]).join(', ');
      
      const confirmMessage = `✅ 설정이 성공적으로 저장되었습니다!\n\n` +
        `📊 적용된 설정: ${applyCount}개 카테고리\n` +
        `🎯 ${appliedSettings}\n\n` +
        `🕒 저장 시간: ${new Date().toLocaleString()}\n\n` +
        `🚀 모든 설정이 실시간으로 사이트에 반영되었습니다!\n` +
        `📄 헤더/푸터, 배송비, 결제수단 등이 즉시 업데이트되었습니다.\n\n` +
        `페이지를 새로고침하여 전체 적용을 확인하시겠습니까?\n` +
        `(새로고침 없이도 대부분 기능이 즉시 반영됩니다)`;
      
      // 잠시 기다린 후 알림 표시 (이벤트 처리 시간 확보)
      setTimeout(() => {
        if (confirm(confirmMessage)) {
          // 사용자가 확인을 원하면 페이지 새로고침
          window.location.reload();
        }
      }, 100);
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('❌ 설정 저장에 실패했습니다.\n\n다시 시도해주세요.\n\n오류: ' + error);
    }
  };

  const resetToDefaults = () => {
    if (confirm('모든 설정을 기본값으로 복원하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setSettings(defaultSettings);
      alert('설정이 기본값으로 복원되었습니다. 저장 버튼을 클릭하여 변경사항을 저장하세요.');
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateGeneralSettings,
      updateStoreSettings,
      updateShippingSettings,
      updatePaymentSettings,
      updateNotificationSettings,
      updateSecuritySettings,
      saveSettings,
      resetToDefaults,
      hasUnsavedChanges,
      lastSaved
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
