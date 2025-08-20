'use client';

import { useEffect } from 'react';
import { trackVisitor, incrementPageView } from '@/lib/analytics';
import { useAuth } from '@/contexts/AuthContext';

// 세션 ID 생성 함수
function generateSessionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}_${random}`;
}

// 세션 ID 관리
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
}

export default function VisitorTracker() {
  const { user } = useAuth();

  useEffect(() => {
    const sessionId = getSessionId();
    
    // 방문자 추적
    const trackUserVisit = async () => {
      try {
        await trackVisitor(sessionId, user?.uid);
        
        // 페이지뷰 증가 (첫 방문이 아닌 경우)
        const hasVisitedBefore = localStorage.getItem('has_visited_before');
        if (hasVisitedBefore) {
          await incrementPageView(sessionId);
        } else {
          localStorage.setItem('has_visited_before', 'true');
        }
      } catch (error) {
        console.error('방문자 추적 오류:', error);
      }
    };

    trackUserVisit();

    // 페이지 가시성 변경 시 추가 추적
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        incrementPageView(sessionId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // 이 컴포넌트는 렌더링하지 않음 (추적만 수행)
  return null;
}
