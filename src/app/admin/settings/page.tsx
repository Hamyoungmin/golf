'use client';

import React, { useState } from 'react';
import { 
  CogIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { 
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
  } = useSettings();

  const tabs = [
    { id: 'general', name: '일반 설정', icon: CogIcon },
    { id: 'store', name: '스토어 정보', icon: BuildingStorefrontIcon },
    { id: 'shipping', name: '배송 설정', icon: TruckIcon },
    { id: 'payment', name: '결제 설정', icon: CreditCardIcon },
    { id: 'notifications', name: '알림 설정', icon: BellIcon },
    { id: 'security', name: '보안 설정', icon: ShieldCheckIcon },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🌐 기본 사이트 정보
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    사이트 이름
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateGeneralSettings({ siteName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    사이트 설명
                  </label>
                  <textarea
                    rows={3}
                    value={settings.general.siteDescription}
                    onChange={(e) => updateGeneralSettings({ siteDescription: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⏰ 운영 시간 설정
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    운영 시간
                  </label>
                  <input
                    type="text"
                    value={settings.general.operatingHours}
                    onChange={(e) => updateGeneralSettings({ operatingHours: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    휴무일
                  </label>
                  <input
                    type="text"
                    value={settings.general.holidays}
                    onChange={(e) => updateGeneralSettings({ holidays: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'store':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏢 사업자 정보
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    사업자 번호
                  </label>
                  <input
                    type="text"
                    value={settings.store.businessNumber}
                    onChange={(e) => updateStoreSettings({ businessNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    통신판매업신고번호
                  </label>
                  <input
                    type="text"
                    value={settings.store.businessRegistration}
                    onChange={(e) => updateStoreSettings({ businessRegistration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    상호명
                  </label>
                  <input
                    type="text"
                    value={settings.store.companyName}
                    onChange={(e) => updateStoreSettings({ companyName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    대표자명
                  </label>
                  <input
                    type="text"
                    value={settings.store.representative}
                    onChange={(e) => updateStoreSettings({ representative: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📍 연락처 정보
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    사업장 주소
                  </label>
                  <input
                    type="text"
                    value={settings.store.address}
                    onChange={(e) => updateStoreSettings({ address: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '5px',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                      대표 전화번호
                    </label>
                    <input
                      type="text"
                      value={settings.store.phone}
                      onChange={(e) => updateStoreSettings({ phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '5px',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                      대표 이메일
                    </label>
                    <input
                      type="email"
                      value={settings.store.email}
                      onChange={(e) => updateStoreSettings({ email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚚 배송비 설정
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    기본 배송비
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={settings.shipping.baseShippingCost}
                      onChange={(e) => updateShippingSettings({ baseShippingCost: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>원</span>
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    무료배송 기준금액
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={settings.shipping.freeShippingThreshold}
                      onChange={(e) => updateShippingSettings({ freeShippingThreshold: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>원 이상</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏝️ 지역별 추가 배송비
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    제주도 추가 배송비
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={settings.shipping.jejuAdditionalCost}
                      onChange={(e) => updateShippingSettings({ jejuAdditionalCost: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>원</span>
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    도서산간 추가 배송비
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={settings.shipping.islandAdditionalCost}
                      onChange={(e) => updateShippingSettings({ islandAdditionalCost: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '120px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>원</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📦 배송업체 설정
              </h4>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  기본 배송업체
                </label>
                <select 
                  value={settings.shipping.defaultCarrier}
                  onChange={(e) => updateShippingSettings({ defaultCarrier: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="CJ대한통운">CJ대한통운</option>
                  <option value="롯데택배">롯데택배</option>
                  <option value="한진택배">한진택배</option>
                  <option value="우체국택배">우체국택배</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💳 사용 가능한 결제 수단
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { id: 'card', name: '신용카드/체크카드', key: 'card' },
                  { id: 'transfer', name: '계좌이체', key: 'transfer' },
                  { id: 'vbank', name: '가상계좌', key: 'vbank' },
                  { id: 'phone', name: '휴대폰 결제', key: 'phone' },
                  { id: 'kakaopay', name: '카카오페이', key: 'kakaopay' },
                  { id: 'naverpay', name: '네이버페이', key: 'naverpay' },
                ].map((payment) => {
                  const isEnabled = settings.payment.enabledMethods[payment.key as keyof typeof settings.payment.enabledMethods];
                  return (
                    <label key={payment.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: isEnabled ? '#e8f5e8' : '#f8f8f8',
                      borderRadius: '4px',
                      border: '1px solid ' + (isEnabled ? '#d4edda' : '#e9ecef'),
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => updatePaymentSettings({
                          enabledMethods: {
                            ...settings.payment.enabledMethods,
                            [payment.key]: e.target.checked
                          }
                        })}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#333' }}>{payment.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🏦 PG사 및 정책 설정
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    PG사 설정
                  </label>
                  <select 
                    value={settings.payment.pgProvider}
                    onChange={(e) => updatePaymentSettings({ pgProvider: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="토스페이먼츠">토스페이먼츠</option>
                    <option value="이니시스">이니시스</option>
                    <option value="나이스페이">나이스페이</option>
                    <option value="KG이니시스">KG이니시스</option>
                  </select>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    환불 처리 기한
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={settings.payment.refundPeriod}
                      onChange={(e) => updatePaymentSettings({ refundPeriod: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '80px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>일</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📧 이메일 알림 설정
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {[
                  { id: 'newOrder', name: '신규 주문 알림', key: 'newOrder' },
                  { id: 'paymentComplete', name: '결제 완료 알림', key: 'paymentComplete' },
                  { id: 'lowStock', name: '재고 부족 알림', key: 'lowStock' },
                  { id: 'newReview', name: '신규 리뷰 알림', key: 'newReview' },
                  { id: 'dailyReport', name: '일일 매출 리포트', key: 'dailyReport' },
                ].map((notification) => {
                  const isEnabled = settings.notifications.emailNotifications[notification.key as keyof typeof settings.notifications.emailNotifications];
                  return (
                    <label key={notification.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: isEnabled ? '#e8f5e8' : '#f8f8f8',
                      borderRadius: '4px',
                      border: '1px solid ' + (isEnabled ? '#d4edda' : '#e9ecef'),
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => updateNotificationSettings({
                          emailNotifications: {
                            ...settings.notifications.emailNotifications,
                            [notification.key]: e.target.checked
                          }
                        })}
                        style={{ marginRight: '10px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#333' }}>{notification.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ✉️ 알림 수신 설정
              </h4>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  알림 수신 이메일
                </label>
                <input
                  type="email"
                  value={settings.notifications.notificationEmail}
                  onChange={(e) => updateNotificationSettings({ notificationEmail: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔒 보안 정책
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'loginLog', name: '관리자 로그인 로그 기록', key: 'loginLog' },
                  { id: 'twoFactor', name: '중요 작업 시 2차 인증 요구', key: 'twoFactor' },
                  { id: 'ipWhitelist', name: 'IP 화이트리스트 사용', key: 'ipWhitelist' },
                ].map((security) => {
                  const isEnabled = settings.security.securityPolicies[security.key as keyof typeof settings.security.securityPolicies];
                  return (
                    <label key={security.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: isEnabled ? '#fff3cd' : '#f8f8f8',
                      borderRadius: '4px',
                      border: '1px solid ' + (isEnabled ? '#ffeaa7' : '#e9ecef'),
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => updateSecuritySettings({
                          securityPolicies: {
                            ...settings.security.securityPolicies,
                            [security.key]: e.target.checked
                          }
                        })}
                        style={{ marginRight: '10px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#333' }}>{security.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⏱️ 세션 및 접근 제어
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    세션 타임아웃
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSecuritySettings({ sessionTimeout: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100px',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>분</span>
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    허용 IP 목록 (IP 화이트리스트 사용 시)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.security.allowedIPs}
                    onChange={(e) => updateSecuritySettings({ allowedIPs: e.target.value })}
                    placeholder="IP 주소를 한 줄에 하나씩 입력하세요&#10;예: 192.168.1.1&#10;    10.0.0.1"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '8px'
            }}>
              시스템 설정
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: 0
            }}>
              쇼핑몰 운영에 필요한 각종 설정을 관리합니다.
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            <button 
              onClick={resetToDefaults}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              🔄 기본값으로 복원
            </button>
            <button 
              onClick={saveSettings}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#fff',
                backgroundColor: hasUnsavedChanges ? '#dc3545' : '#007bff',
                cursor: 'pointer'
              }}
            >
              {hasUnsavedChanges ? '⚠️ 저장 필요' : '💾 전체 저장'}
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            설정 카테고리
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: activeTab === tab.id ? '#fff' : '#666',
                    backgroundColor: activeTab === tab.id ? '#007bff' : '#f9f9f9',
                    cursor: 'pointer'
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            {tabs.find(tab => tab.id === activeTab)?.name} 
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff',
            padding: '25px'
          }}>
            {renderTabContent()}
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px',
          backgroundColor: hasUnsavedChanges ? '#fff3cd' : '#f8f9ff',
          border: '1px solid ' + (hasUnsavedChanges ? '#ffeaa7' : '#e0e8ff'),
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {hasUnsavedChanges ? (
              <span>
                ⚠️ <strong>미저장 변경사항:</strong> 설정이 변경되었습니다. 저장해주세요.
                {lastSaved && (
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    마지막 저장: {lastSaved.toLocaleString()}
                  </div>
                )}
              </span>
            ) : (
              <span>
                💡 <strong>팁:</strong> 설정 변경 후 반드시 저장 버튼을 클릭해주세요.
                {lastSaved && (
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    마지막 저장: {lastSaved.toLocaleString()}
                  </div>
                )}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={resetToDefaults}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              🔄 기본값 복원
            </button>
            <button 
              onClick={saveSettings}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#fff',
                backgroundColor: hasUnsavedChanges ? '#dc3545' : '#28a745',
                cursor: 'pointer'
              }}
            >
              {hasUnsavedChanges ? '⚠️ 변경사항 저장' : '✅ 저장 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
