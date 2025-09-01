'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '@/types';
import { 
  getLocalCart, 
  addToCart as addToCartService,
  removeFromCart as removeFromCartService,
  updateCartItemQuantity as updateCartItemQuantityService,
  clearCart as clearCartService,
  syncCartOnLogin,
  getCartItemCount,
  getCartTotal
} from '@/lib/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  addToCart: (productId: string, quantity: number, price: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 장바구니 아이템 수와 총액 계산
  const cartItemCount = getCartItemCount(cartItems);
  const cartTotal = getCartTotal(cartItems);

  // 컴포넌트 마운트 시 로컬 장바구니 로드
  useEffect(() => {
    const localCart = getLocalCart();
    setCartItems(localCart);
  }, []);

  // 사용자 로그인/로그아웃 시 장바구니 동기화
  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        setLoading(true);
        try {
          const syncedCart = await syncCartOnLogin(user.uid);
          setCartItems(syncedCart);
        } catch (error) {
          console.error('장바구니 동기화 실패:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // 로그아웃 시 로컬 장바구니만 유지
        const localCart = getLocalCart();
        setCartItems(localCart);
      }
    };

    syncCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number, price: number) => {
    setLoading(true);
    try {
      const updatedCart = await addToCartService(
        productId, 
        quantity, 
        price, 
        user?.uid,
        user?.displayName || user?.email || undefined,
        user?.email || undefined
      );
      setCartItems(updatedCart);
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setLoading(true);
    try {
      const updatedCart = await removeFromCartService(productId, user?.uid);
      setCartItems(updatedCart);
    } catch (error) {
      console.error('장바구니 제거 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    setLoading(true);
    try {
      const updatedCart = await updateCartItemQuantityService(
        productId, 
        quantity, 
        user?.uid
      );
      setCartItems(updatedCart);
    } catch (error) {
      console.error('장바구니 수량 업데이트 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await clearCartService(user?.uid);
      setCartItems([]);
    } catch (error) {
      console.error('장바구니 초기화 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    cartItemCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
