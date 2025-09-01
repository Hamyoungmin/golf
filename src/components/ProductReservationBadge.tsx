'use client';

import { useState, useEffect } from 'react';
import { getProductReservationStatus } from '@/lib/productReservations';

interface ProductReservationBadgeProps {
  productId: string;
  className?: string;
}

export default function ProductReservationBadge({ 
  productId, 
  className = '' 
}: ProductReservationBadgeProps) {
  const [reservationStatus, setReservationStatus] = useState<{
    isReserved: boolean;
    reservedBy?: string;
    timeLeft?: string;
  }>({ isReserved: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkReservationStatus = async () => {
      try {
        console.log('🔍 [Badge] 예약 상태 확인 중, productId:', productId);
        const status = await getProductReservationStatus(productId);
        console.log('📊 [Badge] 예약 상태 결과:', status);
        setReservationStatus(status);
      } catch (error) {
        console.error('예약 상태 확인 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    checkReservationStatus();

    // 30초마다 상태 업데이트 (실시간 효과)
    const interval = setInterval(checkReservationStatus, 30000);
    
    return () => clearInterval(interval);
  }, [productId]);

  console.log('🎯 [Badge] 렌더링 상태 - loading:', loading, 'isReserved:', reservationStatus.isReserved);

  if (loading) {
    return (
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: 'rgba(108, 117, 125, 0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        zIndex: 10
      }}>
        확인 중...
      </div>
    );
  }

  if (!reservationStatus.isReserved) {
    console.log('❌ [Badge] 예약 없음 - 아무것도 표시하지 않음');
    return null; // 예약되지 않은 상품은 아무것도 표시하지 않음
  }

  console.log('✅ [Badge] 예약됨 - 뱃지 표시');

  return (
    <div 
      className={className}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: 'rgba(220, 53, 69, 0.9)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '700',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        border: '2px solid white'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>🔒</span>
        <span>예약중</span>
      </div>
      {reservationStatus.timeLeft && (
        <div style={{ 
          fontSize: '10px', 
          opacity: 0.9, 
          marginTop: '2px',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}>
          {reservationStatus.timeLeft} 후 해제
        </div>
      )}
    </div>
  );
}

// 더 큰 버전의 예약 상태 표시 (상품 카드에서 사용)
export function ProductReservationInfo({ 
  productId, 
  showDetails = false 
}: { 
  productId: string; 
  showDetails?: boolean;
}) {
  const [reservationStatus, setReservationStatus] = useState<{
    isReserved: boolean;
    reservedBy?: string;
    timeLeft?: string;
  }>({ isReserved: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkReservationStatus = async () => {
      try {
        console.log('🔍 [Info] 예약 상태 확인 중, productId:', productId);
        const status = await getProductReservationStatus(productId);
        console.log('📊 [Info] 예약 상태 결과:', status);
        setReservationStatus(status);
      } catch (error) {
        console.error('예약 상태 확인 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    checkReservationStatus();

    // 30초마다 상태 업데이트 (실시간 효과)
    const interval = setInterval(checkReservationStatus, 30000);
    
    return () => clearInterval(interval);
  }, [productId]);

  if (loading || !reservationStatus.isReserved) {
    return null;
  }

  return (
    <div style={{
      padding: '8px 12px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '6px',
      marginBottom: '10px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#856404',
        fontWeight: '600'
      }}>
        <span>⚠️</span>
        <span>다른 고객이 장바구니에 담았습니다</span>
      </div>
      
      {showDetails && reservationStatus.timeLeft && (
        <div style={{
          fontSize: '12px',
          color: '#856404',
          marginTop: '4px'
        }}>
          📅 {reservationStatus.timeLeft} 후 자동 해제
        </div>
      )}
      
      {showDetails && reservationStatus.reservedBy && (
        <div style={{
          fontSize: '11px',
          color: '#6c757d',
          marginTop: '2px'
        }}>
          예약자: {reservationStatus.reservedBy}
        </div>
      )}
    </div>
  );
}