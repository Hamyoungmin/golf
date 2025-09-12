'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  // getUserWishlist, // unused
  addToWishlist as addToWishlistAPI,
  removeFromWishlist as removeFromWishlistAPI,
  getWishlistProducts,
  removeMultipleFromWishlist as removeMultipleFromWishlistAPI,
  // isInWishlist as isInWishlistAPI // unused
} from '@/lib/wishlist';
import { Product } from '@/types';

interface WishlistContextType {
  wishlistItems: Product[];
  wishlistProductIds: string[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  removeMultipleFromWishlist: (productIds: string[]) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 위시리스트 데이터 로드
  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setWishlistProductIds([]);
      return;
    }

    setLoading(true);
    try {
      const products = await getWishlistProducts(user.uid);
      setWishlistItems(products);
      setWishlistProductIds(products.map(p => p.id));
    } catch (error) {
      console.error('위시리스트 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 사용자 변경 시 위시리스트 로드
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // 위시리스트에 상품 추가
  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    if (wishlistProductIds.includes(productId)) {
      return true; // 이미 추가된 상품
    }

    try {
      const success = await addToWishlistAPI(user.uid, productId);
      if (success) {
        await refreshWishlist();
      }
      return success;
    } catch (error) {
      console.error('위시리스트 추가 오류:', error);
      return false;
    }
  };

  // 위시리스트에서 상품 제거
  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const success = await removeFromWishlistAPI(user.uid, productId);
      if (success) {
        await refreshWishlist();
      }
      return success;
    } catch (error) {
      console.error('위시리스트 제거 오류:', error);
      return false;
    }
  };

  // 위시리스트에서 여러 상품 제거
  const removeMultipleFromWishlist = async (productIds: string[]): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const success = await removeMultipleFromWishlistAPI(user.uid, productIds);
      if (success) {
        await refreshWishlist();
      }
      return success;
    } catch (error) {
      console.error('위시리스트 다중 제거 오류:', error);
      return false;
    }
  };

  // 상품이 위시리스트에 있는지 확인
  const isInWishlist = (productId: string): boolean => {
    return wishlistProductIds ? wishlistProductIds.includes(productId) : false;
  };

  // 위시리스트 새로고침
  const refreshWishlist = async (): Promise<void> => {
    await loadWishlist();
  };

  const value: WishlistContextType = {
    wishlistItems,
    wishlistProductIds,
    loading,
    addToWishlist,
    removeFromWishlist,
    removeMultipleFromWishlist,
    isInWishlist,
    refreshWishlist,
    wishlistCount: wishlistItems.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
