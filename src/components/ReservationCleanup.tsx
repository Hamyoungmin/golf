'use client';

import { useEffect } from 'react';
import { cleanupExpiredReservations } from '@/lib/productReservations';

export default function ReservationCleanup() {
  useEffect(() => {
    // 컴포넌트 마운트 시 한 번 실행
    const performCleanup = async () => {
      try {
        await cleanupExpiredReservations();
      } catch (error) {
        console.error('예약 정리 실패:', error);
      }
    };

    performCleanup();

    // 5분마다 정기 정리 실행
    const interval = setInterval(performCleanup, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // 화면에 아무것도 렌더링하지 않음
}
