// 공통 alert 유틸리티 함수들
// 이 함수들을 사용하면 기존 alert() 코드를 최소한으로 수정할 수 있습니다.

interface AlertUtilsType {
  showLoginRequired: () => void;
  showWishlistLoginRequired: () => void;
  showOutOfStock: () => void;
  showAddedToCart: () => void;
  showAddedToWishlist: () => void;
  showRemovedFromWishlist: () => void;
  showReviewLoginRequired: () => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
}

// 전역 alert 유틸리티 객체
declare global {
  interface Window {
    alertUtils?: AlertUtilsType;
  }
}

// CustomAlert를 위한 이벤트 기반 시스템
export const triggerCustomAlert = (
  message: string, 
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'prompt' = 'info',
  options?: {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: (value?: string) => void;
    onCancel?: () => void;
    placeholder?: string;
    defaultValue?: string;
  }
) => {
  const event = new CustomEvent('showCustomAlert', {
    detail: { message, type, options }
  });
  window.dispatchEvent(event);
};

// Promise 기반의 confirm 함수
export const customConfirm = (message: string, title?: string): Promise<boolean> => {
  return new Promise((resolve) => {
    triggerCustomAlert(message, 'confirm', {
      title: title || '확인',
      confirmText: '확인',
      cancelText: '취소',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
};

// Promise 기반의 prompt 함수
export const customPrompt = (message: string, defaultValue?: string, title?: string): Promise<string | null> => {
  return new Promise((resolve) => {
    triggerCustomAlert(message, 'prompt', {
      title: title || '입력',
      confirmText: '확인',
      cancelText: '취소',
      defaultValue: defaultValue || '',
      placeholder: defaultValue || '',
      onConfirm: (value) => resolve(value || ''),
      onCancel: () => resolve(null)
    });
  });
};

// 로그인 페이지로 이동하는 함수 (중복 방지)
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 로그인 페이지로 이동 시작...', window.location.pathname);
    }
    
    // 이미 로그인 페이지에 있다면 바로 리턴
    if (window.location.pathname === '/login') {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ 이미 로그인 페이지에 있음');
      }
      return;
    }
    
    // 기존 router.push가 있을 수 있으므로 조금 더 기다린 후 실행
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 로그인 페이지로 이동 실행', window.location.pathname);
        }
        // Next.js router가 우선 실행되도록 하고, 그래도 이동하지 않으면 강제 이동
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔧 강제 리다이렉트 실행');
            }
            window.location.href = '/login';
          }
        }, 50);
      }
    }, 200);
  }
};

// 기존 alert() 함수를 오버라이드하여 CustomAlert 사용
export const overrideAlert = () => {
  if (typeof window !== 'undefined') {
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    const originalPrompt = window.prompt;
    
    window.alert = (message: string | unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = typeof message === 'string' ? message : String(message as any);
      
      // 로그인 관련 메시지들을 감지하여 적절한 타입 설정
      if (msg.includes('로그인이 필요') || 
          msg.includes('로그인 후 가능') || 
          msg.includes('위시리스트에 추가하려면 로그인') ||
          msg.includes('관심상품에 추가하려면 로그인') ||
          msg.includes('장바구니에 추가하려면 로그인')) {
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 알림 감지: 로그인 관련 메시지', msg);
        }
        
        triggerCustomAlert(msg, 'warning', {
          title: '로그인 필요',
          confirmText: '로그인하기',
          cancelText: '취소',
          onConfirm: redirectToLogin,
          onCancel: () => {
            if (process.env.NODE_ENV === 'development') {
              console.log('🚫 로그인 취소됨');
            }
          }
        });
      } else if (msg.includes('추가되었습니다') || msg.includes('성공')) {
        triggerCustomAlert(msg, 'success');
      } else if (msg.includes('품절') || msg.includes('실패') || msg.includes('오류')) {
        triggerCustomAlert(msg, 'error');
      } else if (msg.includes('선택') || msg.includes('입력') || msg.includes('문의')) {
        triggerCustomAlert(msg, 'warning');
      } else {
        triggerCustomAlert(msg, 'info');
      }
    };

    // confirm과 prompt는 기존 함수 유지 (동기 처리 필요)
    // 개별적으로 customConfirm, customPrompt 사용 권장
  }
};

// 공통 alert 함수들
export const alertUtils: AlertUtilsType = {
  showLoginRequired: () => triggerCustomAlert('로그인이 필요합니다.', 'warning'),
  showWishlistLoginRequired: () => triggerCustomAlert('위시리스트에 추가하려면 로그인이 필요합니다.', 'warning'),
  showOutOfStock: () => triggerCustomAlert('품절된 상품입니다.', 'warning'),
  showAddedToCart: () => triggerCustomAlert('장바구니에 추가되었습니다.', 'success'),
  showAddedToWishlist: () => triggerCustomAlert('위시리스트에 추가되었습니다.', 'success'),
  showRemovedFromWishlist: () => triggerCustomAlert('위시리스트에서 제거되었습니다.', 'success'),
  showReviewLoginRequired: () => triggerCustomAlert('리뷰 작성은 로그인 후 가능합니다.', 'warning'),
  showError: (message: string) => triggerCustomAlert(message, 'error'),
  showSuccess: (message: string) => triggerCustomAlert(message, 'success'),
  showWarning: (message: string) => triggerCustomAlert(message, 'warning')
};

// 전역에서 사용할 수 있도록 설정
if (typeof window !== 'undefined') {
  window.alertUtils = alertUtils;
}
