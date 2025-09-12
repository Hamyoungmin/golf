'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserRecentlyViewed, 
  addToRecentlyViewed as addToRecentlyViewedAPI,
  addToRecentlyViewedDebounced,
  removeFromRecentlyViewed as removeFromRecentlyViewedAPI,
  getRecentlyViewedProducts,
  removeMultipleFromRecentlyViewed as removeMultipleFromRecentlyViewedAPI,
  clearRecentlyViewed as clearRecentlyViewedAPI,
  isInRecentlyViewed as isInRecentlyViewedAPI
} from '@/lib/recently-viewed';
import { Product, RecentlyViewedItem } from '@/types';

interface RecentlyViewedContextType {
  recentlyViewedItems: Product[];
  recentlyViewedProductIds: string[];
  loading: boolean;
  addToRecentlyViewed: (productId: string) => Promise<boolean>;
  removeFromRecentlyViewed: (productId: string) => Promise<boolean>;
  removeMultipleFromRecentlyViewed: (productIds: string[]) => Promise<boolean>;
  clearRecentlyViewed: () => Promise<boolean>;
  isInRecentlyViewed: (productId: string) => boolean;
  refreshRecentlyViewed: () => Promise<void>;
  recentlyViewedCount: number;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<Product[]>([]);
  const [recentlyViewedProductIds, setRecentlyViewedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 최근 본 상품 데이터 로드 (개선된 에러 핸들링)
  const loadRecentlyViewed = useCallback(async () => {
    if (!user) {
      setRecentlyViewedItems([]);
      setRecentlyViewedProductIds([]);
      return;
    }

    setLoading(true);
    try {
      const products = await getRecentlyViewedProducts(user.uid);
      
      // 데이터 유효성 검증
      if (Array.isArray(products)) {
        setRecentlyViewedItems(products);
        setRecentlyViewedProductIds(products.map(p => p?.id).filter(Boolean));
      } else {
        console.warn('최근 본 상품 데이터가 배열이 아닙니다:', products);
        setRecentlyViewedItems([]);
        setRecentlyViewedProductIds([]);
      }
    } catch (error) {
      console.error('최근 본 상품 로드 오류:', error);
      
      // 에러 발생 시에도 빈 배열로 초기화 (앱 크래시 방지)
      setRecentlyViewedItems([]);
      setRecentlyViewedProductIds([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 사용자 변경 시 최근 본 상품 로드
  useEffect(() => {
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  // 최근 본 상품에 상품 추가 (디바운스 적용)
  const addToRecentlyViewed = async (productId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // 디바운스된 함수 사용 (Firestore 요청 줄이기)
      const success = await addToRecentlyViewedDebounced(user.uid, productId);
      if (success) {
        // 로컬 상태 즉시 업데이트 (UI 반응성 향상)
        await refreshRecentlyViewed();
      }
      return success;
    } catch (error) {
      console.error('최근 본 상품 추가 오류:', error);
      return false;
    }
  };

  // 최근 본 상품에서 상품 제거
  const removeFromRecentlyViewed = async (productId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const success = await removeFromRecentlyViewedAPI(user.uid, productId);
      if (success) {
        await refreshRecentlyViewed();
      }
      return success;
    } catch (error) {
      console.error('최근 본 상품 제거 오류:', error);
      return false;
    }
  };

  // 최근 본 상품에서 여러 상품 제거
  const removeMultipleFromRecentlyViewed = async (productIds: string[]): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const success = await removeMultipleFromRecentlyViewedAPI(user.uid, productIds);
      if (success) {
        await refreshRecentlyViewed();
      }
      return success;
    } catch (error) {
      console.error('최근 본 상품 다중 제거 오류:', error);
      return false;
    }
  };

  // 최근 본 상품 전체 삭제
  const clearRecentlyViewed = async (): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const success = await clearRecentlyViewedAPI(user.uid);
      if (success) {
        await refreshRecentlyViewed();
      }
      return success;
    } catch (error) {
      console.error('최근 본 상품 전체 삭제 오류:', error);
      return false;
    }
  };

  // 상품이 최근 본 상품에 있는지 확인 (로컬 캐시 우선 사용)
  const isInRecentlyViewed = (productId: string): boolean => {
    // 로컬 상태에서 먼저 확인 (가장 빠른 응답)
    if (recentlyViewedProductIds.includes(productId)) {
      return true;
    }
    
    // 추가적인 안전 장치: 배열이 유효한지 확인
    if (!Array.isArray(recentlyViewedProductIds)) {
      console.warn('recentlyViewedProductIds가 배열이 아닙니다:', recentlyViewedProductIds);
      return false;
    }
    
    return false;
  };

  // 최근 본 상품 새로고침
  const refreshRecentlyViewed = async (): Promise<void> => {
    await loadRecentlyViewed();
  };

  const value: RecentlyViewedContextType = {
    recentlyViewedItems,
    recentlyViewedProductIds,
    loading,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    removeMultipleFromRecentlyViewed,
    clearRecentlyViewed,
    isInRecentlyViewed,
    refreshRecentlyViewed,
    recentlyViewedCount: recentlyViewedItems.length,
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
