'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { formatPrice } from '@/lib/settings';

const SettingsDisplay = () => {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  // 설정 업데이트 감지
  useEffect(() => {
    const handleSettingsUpdate = () => {
      // 설정이 업데이트되면 잠시 표시
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  return (
    <>
      {/* 고정 설정 정보 표시 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '12px',
        maxWidth: '280px',
        zIndex: 1000
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ⚙️ 실시간 설정 반영
        </div>
        <div style={{ fontSize: '11px', lineHeight: '1.4', opacity: 0.9 }}>
          <div>🏷️ <strong>사이트명:</strong> {settings.general.siteName}</div>
          <div>🚚 <strong>기본배송비:</strong> {formatPrice(settings.shipping.baseShippingCost)}</div>
          <div>📦 <strong>무료배송:</strong> {formatPrice(settings.shipping.freeShippingThreshold)} 이상</div>
          <div>💳 <strong>결제수단:</strong> {[
            settings.payment.enabledMethods.card && '카드',
            settings.payment.enabledMethods.transfer && '계좌이체',
            settings.payment.enabledMethods.kakaopay && '카카오페이',
            settings.payment.enabledMethods.naverpay && '네이버페이'
          ].filter(Boolean).join(', ')}</div>
          <div>🏪 <strong>대표전화:</strong> {settings.store.phone}</div>
          <div style={{ marginTop: '6px', fontSize: '10px', opacity: 0.7 }}>
            ✨ 관리자 설정에서 변경 즉시 반영됩니다!
          </div>
        </div>
      </div>

      {/* 설정 업데이트 알림 */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1001,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          ✅ 설정이 실시간으로 반영되었습니다!
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default SettingsDisplay;
