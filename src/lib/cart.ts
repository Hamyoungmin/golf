// Firebase 제거됨: 로컬스토리지 기능만 사용
import { CartItem } from '@/types';

// 로컬스토리지 키
const CART_STORAGE_KEY = 'golf_cart';

// 로컬스토리지에서 장바구니 조회
export const getLocalCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('로컬 장바구니 조회 오류:', error);
    return [];
  }
};

// 로컬스토리지에 장바구니 저장
export const saveLocalCart = (cartItems: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('로컬 장바구니 저장 오류:', error);
  }
};

// 로컬스토리지 장바구니 초기화
export const clearLocalCart = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('로컬 장바구니 초기화 오류:', error);
  }
};

// Firebase 제거됨: 더미 함수들
export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  // 로컬 장바구니만 반환
  return getLocalCart();
};

export const saveUserCart = async (userId: string, cartItems: CartItem[]): Promise<void> => {
  // 로컬스토리지만 사용
  saveLocalCart(cartItems);
};

// 장바구니에 상품 추가
export const addToCart = async (
  productId: string,
  quantity: number,
  price: number,
  userId?: string
): Promise<CartItem[]> => {
  try {
    // 로컬 장바구니에서 현재 아이템들 가져오기
    // eslint-disable-next-line prefer-const
    let cartItems = getLocalCart();

    // 기존 아이템이 있는지 확인
    const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      // 기존 아이템이 있으면 수량 업데이트
      cartItems[existingItemIndex].quantity += quantity;
    } else {
      // 새 아이템 추가
      const newItem: CartItem = {
        productId,
        quantity,
        price,
      };
      cartItems.push(newItem);
    }

    // 로컬스토리지에 저장
    saveLocalCart(cartItems);

    // 로그인한 사용자라면 Firestore에도 저장
    if (userId) {
      await saveUserCart(userId, cartItems);
    }

    return cartItems;
  } catch (error) {
    console.error('장바구니 추가 오류:', error);
    throw new Error('장바구니 추가 중 오류가 발생했습니다.');
  }
};

// 장바구니에서 상품 제거
export const removeFromCart = async (
  productId: string,
  userId?: string
): Promise<CartItem[]> => {
  try {
    let cartItems = getLocalCart();
    cartItems = cartItems.filter(item => item.productId !== productId);

    saveLocalCart(cartItems);

    if (userId) {
      await saveUserCart(userId, cartItems);
    }

    return cartItems;
  } catch (error) {
    console.error('장바구니 제거 오류:', error);
    throw new Error('장바구니 제거 중 오류가 발생했습니다.');
  }
};

// 장바구니 아이템 수량 업데이트
export const updateCartItemQuantity = async (
  productId: string,
  quantity: number,
  userId?: string
): Promise<CartItem[]> => {
  try {
    let cartItems = getLocalCart();
    const itemIndex = cartItems.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        // 수량이 0 이하면 아이템 제거
        cartItems = cartItems.filter(item => item.productId !== productId);
      } else {
        cartItems[itemIndex].quantity = quantity;
      }
    }

    saveLocalCart(cartItems);

    if (userId) {
      await saveUserCart(userId, cartItems);
    }

    return cartItems;
  } catch (error) {
    console.error('장바구니 수량 업데이트 오류:', error);
    throw new Error('장바구니 수량 업데이트 중 오류가 발생했습니다.');
  }
};

// 장바구니 전체 초기화
export const clearCart = async (userId?: string): Promise<void> => {
  try {
    clearLocalCart();

    if (userId) {
      await saveUserCart(userId, []);
    }
  } catch (error) {
    console.error('장바구니 초기화 오류:', error);
    throw new Error('장바구니 초기화 중 오류가 발생했습니다.');
  }
};

// Firebase 제거됨: 로컬 장바구니만 반환
export const syncCartOnLogin = async (userId: string): Promise<CartItem[]> => {
  // 로컬 장바구니만 반환
  return getLocalCart();
};

// 장바구니 총 아이템 수 계산
export const getCartItemCount = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

// 장바구니 총 금액 계산 (숫자 가격만)
export const getCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};
