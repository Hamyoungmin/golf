'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProductReservation } from '@/types';
import { 
  subscribeToProductReservation,
  checkProductAvailability 
} from '@/lib/productReservations';

interface ProductReservationStatusProps {
  productId: string;
  onReservationChange?: (reservation: ProductReservation | null) => void;
}

export default function ProductReservationStatus({ 
  productId, 
  onReservationChange 
}: ProductReservationStatusProps) {
  const { user } = useAuth();
  const [reservation, setReservation] = useState<ProductReservation | null>(null);
  const [loading, setLoading] = useState(true);

  // 장바구니 점유 상태 실시간 구독
  useEffect(() => {
    const unsubscribe = subscribeToProductReservation(productId, (newReservation) => {
      setReservation(newReservation);
      setLoading(false);
      onReservationChange?.(newReservation);
    });

    return unsubscribe;
  }, [productId, onReservationChange]);

  if (loading) {
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #e9ecef',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        상태 확인 중...
      </div>
    );
  }

  if (!reservation) {
    return null; // 사용 가능한 경우 아무것도 표시하지 않음
  }

  const isMyReservation = user && reservation.userId === user.uid;

  if (isMyReservation) {
    return (
      <div style={{
        padding: '12px',
        backgroundColor: '#d1ecf1',
        borderRadius: '6px',
        border: '1px solid #bee5eb',
        fontSize: '14px',
        color: '#0c5460',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>🛒</span>
        <span style={{ fontWeight: '600' }}>내가 장바구니에 담은 상품</span>
      </div>
    );
  }

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#f8d7da',
      borderRadius: '6px',
      border: '1px solid #f5c6cb',
      fontSize: '14px',
      color: '#721c24'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span>⚠️</span>
        <span style={{ fontWeight: '600' }}>&quot;{reservation.userName}&quot;님이 장바구니에 담았습니다</span>
      </div>
      <div style={{ fontSize: '12px', color: '#dc3545' }}>
        다른 고객이 주문 완료하거나 장바구니에서 제거할 때까지 기다려주세요
      </div>
    </div>
  );
}

// 예약 상태에 따른 장바구니 버튼 컴포넌트
interface ReservationAwareAddToCartButtonProps {
  productId: string;
  price: number;
  onAddToCart: () => Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
}

export function ReservationAwareAddToCartButton({
  productId,
  price,
  onAddToCart,
  disabled = false,
  children
}: ReservationAwareAddToCartButtonProps) {
  const { user } = useAuth();
  const [reservation, setReservation] = useState<ProductReservation | null>(null);
  const [loading, setLoading] = useState(false);

  // 예약 상태 확인
  useEffect(() => {
    const checkAvailability = async () => {
      if (!user) return;
      
      try {
        const availability = await checkProductAvailability(productId, user.uid);
        if (!availability.available && availability.reservedBy) {
          // 다른 사용자가 예약한 상태를 시뮬레이션
          setReservation({
            id: 'temp',
            productId,
            userId: 'other',
            userName: availability.reservedBy,
            userEmail: '',
            reservedAt: new Date(),
            expiresAt: availability.expiresAt || new Date(),
            status: 'active'
          });
        } else {
          setReservation(null);
        }
      } catch (error) {
        console.error('예약 상태 확인 오류:', error);
      }
    };

    checkAvailability();
  }, [productId, user]);

  const handleClick = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (reservation && reservation.userId !== user.uid) {
      alert(`이 상품은 현재 "${reservation.userName}"님이 장바구니에 담았습니다.\n다른 고객이 주문 완료하거나 장바구니에서 제거할 때까지 기다려주세요.`);
      return;
    }

    setLoading(true);
    try {
      await onAddToCart();
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading || (reservation && reservation.userId !== user?.uid);

  return (
    <button
      onClick={handleClick}
      disabled={!!isDisabled}
      style={{
        width: '100%',
        padding: '16px',
        backgroundColor: isDisabled ? '#9ca3af' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      {loading ? '추가 중...' : children}
    </button>
  );
}
