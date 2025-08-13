'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserRecentlyViewed, 
  addToRecentlyViewed as addToRecentlyViewedAPI,
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

  // 최근 본 상품 데이터 로드
  const loadRecentlyViewed = async () => {
    if (!user) {
      setRecentlyViewedItems([]);
      setRecentlyViewedProductIds([]);
      return;
    }

    setLoading(true);
    try {
      const products = await getRecentlyViewedProducts(user.uid);
      setRecentlyViewedItems(products);
      setRecentlyViewedProductIds(products.map(p => p.id));
    } catch (error) {
      console.error('최근 본 상품 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 변경 시 최근 본 상품 로드
  useEffect(() => {
    loadRecentlyViewed();
  }, [user]);

  // 최근 본 상품에 상품 추가
  const addToRecentlyViewed = async (productId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const success = await addToRecentlyViewedAPI(user.uid, productId);
      if (success) {
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

  // 상품이 최근 본 상품에 있는지 확인
  const isInRecentlyViewed = (productId: string): boolean => {
    return recentlyViewedProductIds.includes(productId);
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
