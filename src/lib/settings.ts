'use client';

import { AllSettings } from '@/contexts/SettingsContext';

// 로컬 스토리지에서 설정 가져오기
export function getStoredSettings(): AllSettings | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const savedData = localStorage.getItem('adminSettings');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.settings;
    }
  } catch (error) {
    console.error('설정 불러오기 실패:', error);
  }
  
  return null;
}

// 배송비 계산 유틸리티 함수
export function calculateShippingCost(cartTotal: number, settings?: AllSettings): number {
  if (!settings) {
    const storedSettings = getStoredSettings();
    if (!storedSettings) return 3000; // 기본값
    settings = storedSettings;
  }
  
  return cartTotal >= settings.shipping.freeShippingThreshold 
    ? 0 
    : settings.shipping.baseShippingCost;
}

// 결제 수단 필터링 함수
export function getEnabledPaymentMethods(settings?: AllSettings) {
  if (!settings) {
    const storedSettings = getStoredSettings();
    if (!storedSettings) return ['bank_transfer']; // 기본값
    settings = storedSettings;
  }
  
  const enabledMethods = [];
  
  if (settings.payment.enabledMethods.transfer) enabledMethods.push('bank_transfer');
  if (settings.payment.enabledMethods.card) enabledMethods.push('card');
  if (settings.payment.enabledMethods.vbank) enabledMethods.push('vbank');
  if (settings.payment.enabledMethods.phone) enabledMethods.push('phone');
  if (settings.payment.enabledMethods.kakaopay) enabledMethods.push('kakaopay');
  if (settings.payment.enabledMethods.naverpay) enabledMethods.push('naverpay');
  
  return enabledMethods.length > 0 ? enabledMethods : ['bank_transfer']; // 최소 하나는 보장
}

// 가격 포맷팅 함수
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
}

// 사이트 기본 정보 가져오기
export function getSiteInfo(settings?: AllSettings) {
  if (!settings) {
    const storedSettings = getStoredSettings();
    if (!storedSettings) {
      return {
        siteName: '골프상회',
        siteDescription: '최고 품질의 골프용품을 합리적인 가격에 제공하는 골프상회입니다.',
        operatingHours: '평일 09:00 - 18:00',
        holidays: '토요일, 일요일, 공휴일'
      };
    }
    settings = storedSettings;
  }
  
  return settings.general;
}

// 스토어 정보 가져오기
export function getStoreInfo(settings?: AllSettings) {
  if (!settings) {
    const storedSettings = getStoredSettings();
    if (!storedSettings) {
      return {
        businessNumber: '740-47-00888',
        businessRegistration: '제 2023-화성봉담-0314호',
        companyName: '골프상회',
        representative: '홍길동',
        address: '경기도 수원시 권선구 세지로28번길 15-30 104호',
        phone: '010-7236-8400',
        email: 'crover.kk@gmail.com'
      };
    }
    settings = storedSettings;
  }
  
  return settings.store;
}

// 배송 정보 가져오기
export function getShippingInfo(settings?: AllSettings) {
  if (!settings) {
    const storedSettings = getStoredSettings();
    if (!storedSettings) {
      return {
        baseShippingCost: 3000,
        freeShippingThreshold: 50000,
        jejuAdditionalCost: 3000,
        islandAdditionalCost: 5000,
        defaultCarrier: 'CJ대한통운'
      };
    }
    settings = storedSettings;
  }
  
  return settings.shipping;
}
