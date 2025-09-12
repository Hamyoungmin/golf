/**
 * 에러 핸들링 유틸리티 함수들
 */

/**
 * Firestore 에러인지 확인
 */
export function isFirestoreError(error: Error | unknown): boolean {
  const err = error as any;
  return err?.code?.startsWith?.('firestore/') ||
         err?.message?.includes?.('Firestore') ||
         err?.code === 'resource-exhausted';
}

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: Error | unknown): boolean {
  return error?.code === 'unavailable' || 
         error?.message?.includes?.('network') ||
         error?.message?.includes?.('fetch');
}

/**
 * 할당량 초과 에러인지 확인
 */
export function isQuotaExceededError(error: Error | unknown): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (error as any)?.code === 'resource-exhausted' ||
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (error as any)?.message?.includes?.('Quota exceeded');
}

/**
 * 에러를 사용자 친화적인 메시지로 변환
 */
export function getErrorMessage(error: Error | unknown): string {
  if (isQuotaExceededError(error)) {
    return '일시적으로 서비스 이용량이 많습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요.';
  }
  
  if (isFirestoreError(error)) {
    return '데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.';
  }
  
  return '예상치 못한 오류가 발생했습니다.';
}

/**
 * 안전한 로컬 스토리지 접근
 */
export const safeLocalStorage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`로컬 스토리지 읽기 실패 (${key}):`, error);
      return null;
    }
  },
  
  set: (key: string, value: unknown) => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`로컬 스토리지 저장 실패 (${key}):`, error);
      return false;
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`로컬 스토리지 삭제 실패 (${key}):`, error);
      return false;
    }
  }
};

/**
 * 배열 안전성 검사
 */
export function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  console.warn('배열이 아닌 값이 전달됨:', value);
  return [];
}

/**
 * 재시도 로직이 포함된 함수 실행
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 할당량 초과 에러인 경우 재시도하지 않음
      if (isQuotaExceededError(error)) {
        throw error;
      }
      
      console.warn(`작업 실패 (${attempt}/${maxRetries}), ${delay}ms 후 재시도:`, error);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}
