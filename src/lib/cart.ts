// Firebase 제거됨: 로컬스토리지 기능만 사용
import { CartItem } from '@/types';
import { 
  reserveProduct, 
  releaseProductReservation,
  getActiveProductReservation,
  checkProductAvailability
} from './productReservations';
import { getProductById } from './products';

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



// 장바구니에 상품 추가 (예약 기능 포함)
export const addToCart = async (
  productId: string,
  quantity: number,
  price: number,
  userId?: string,
  userName?: string,
  userEmail?: string
): Promise<CartItem[]> => {
  try {
    // 로그인하지 않은 사용자는 예약 기능 없이 기존 방식 사용
    if (!userId || !userName || !userEmail) {
      return await addToCartWithoutReservation(productId, quantity, price, userId);
    }

    console.log('🛒 [addToCart] 장바구니 추가 시작 - productId:', productId, 'userId:', userId);
    
    // 상품 정보 조회 및 재고 검증
    const product = await getProductById(productId);
    if (!product) {
      throw new Error('상품 정보를 찾을 수 없습니다.');
    }
    
    // 재고 검증
    if (quantity > product.stock) {
      throw new Error(`재고가 ${product.stock}개만 남아있습니다. 수량을 확인해 주세요.`);
    }
    
    if (product.stock <= 0) {
      throw new Error('현재 품절된 상품입니다.');
    }
    
    // 제품 예약 가능 여부 확인
    const availability = await checkProductAvailability(productId, userId);
    console.log('🔍 [addToCart] 예약 가능 여부:', availability);
    
    if (!availability.available) {
      throw new Error(
        `이 상품은 현재 "${availability.reservedBy}"님이 장바구니에 담았습니다.\n` +
        `다른 고객이 주문 완료하거나 장바구니에서 제거할 때까지 기다려주세요.`
      );
    }

    // 제품 예약하기
    console.log('🔒 [addToCart] 상품 예약 시작...');
    const reservationId = await reserveProduct(productId, userId, userName, userEmail);
    console.log('✅ [addToCart] 상품 예약 완료! reservationId:', reservationId);

    // 로컬 장바구니에서 현재 아이템들 가져오기
    let cartItems = getLocalCart();

    // 기존 아이템이 있는지 확인
    const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      // 기존 수량 + 새 수량이 재고를 초과하는지 확인
      const totalQuantity = cartItems[existingItemIndex].quantity + quantity;
      if (totalQuantity > product.stock) {
        throw new Error(`장바구니에 이미 ${cartItems[existingItemIndex].quantity}개가 담겨있어, 총 ${totalQuantity}개가 됩니다. 재고(${product.stock}개)를 초과할 수 없습니다.`);
      }
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('장바구니 추가 중 오류가 발생했습니다.');
  }
};

// 예약 없이 장바구니에 상품 추가 (비로그인 사용자용)
const addToCartWithoutReservation = async (
  productId: string,
  quantity: number,
  price: number,
  userId?: string
): Promise<CartItem[]> => {
  // 상품 정보 조회 및 재고 검증
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('상품 정보를 찾을 수 없습니다.');
  }
  
  // 재고 검증
  if (quantity > product.stock) {
    throw new Error(`재고가 ${product.stock}개만 남아있습니다. 수량을 확인해 주세요.`);
  }
  
  if (product.stock <= 0) {
    throw new Error('현재 품절된 상품입니다.');
  }

  const cartItems = getLocalCart();

  const existingItemIndex = cartItems.findIndex(item => item.productId === productId);

  if (existingItemIndex > -1) {
    // 기존 수량 + 새 수량이 재고를 초과하는지 확인
    const totalQuantity = cartItems[existingItemIndex].quantity + quantity;
    if (totalQuantity > product.stock) {
      throw new Error(`장바구니에 이미 ${cartItems[existingItemIndex].quantity}개가 담겨있어, 총 ${totalQuantity}개가 됩니다. 재고(${product.stock}개)를 초과할 수 없습니다.`);
    }
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    const newItem: CartItem = {
      productId,
      quantity,
      price,
    };
    cartItems.push(newItem);
  }

  saveLocalCart(cartItems);

  if (userId) {
    await saveUserCart(userId, cartItems);
  }

  return cartItems;
};

// 장바구니에서 상품 제거 (예약 해제 포함)
export const removeFromCart = async (
  productId: string,
  userId?: string
): Promise<CartItem[]> => {
  try {
    let cartItems = getLocalCart();
    cartItems = cartItems.filter(item => item.productId !== productId);

    saveLocalCart(cartItems);

    // 로그인한 사용자인 경우 예약 해제
    if (userId) {
      await saveUserCart(userId, cartItems);
      await releaseProductReservation(productId, userId);
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

// 장바구니 전체 초기화 (모든 예약 해제 포함)
export const clearCart = async (userId?: string): Promise<void> => {
  try {
    const cartItems = getLocalCart();
    
    clearLocalCart();

    if (userId) {
      await saveUserCart(userId, []);
      
      // 장바구니에 있던 모든 상품의 예약 해제
      const releasePromises = cartItems.map(item => 
        releaseProductReservation(item.productId, userId)
      );
      await Promise.all(releasePromises);
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
