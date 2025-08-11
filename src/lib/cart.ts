import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Cart, CartItem } from '@/types';

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

// Firestore에서 사용자 장바구니 조회
export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const cartData = cartSnap.data() as Cart;
      return cartData.items || [];
    }

    return [];
  } catch (error) {
    console.error('사용자 장바구니 조회 오류:', error);
    throw new Error('장바구니를 불러오는 중 오류가 발생했습니다.');
  }
};

// Firestore에 사용자 장바구니 저장
export const saveUserCart = async (userId: string, cartItems: CartItem[]): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const cartRef = doc(db, 'carts', userId);
    const cartData: Cart = {
      userId,
      items: cartItems,
      updatedAt: new Date(),
    };

    await setDoc(cartRef, cartData);
  } catch (error) {
    console.error('사용자 장바구니 저장 오류:', error);
    throw new Error('장바구니 저장 중 오류가 발생했습니다.');
  }
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

// 로그인 시 서버 장바구니와 로컬 장바구니 동기화
export const syncCartOnLogin = async (userId: string): Promise<CartItem[]> => {
  try {
    const localCart = getLocalCart();
    const serverCart = await getUserCart(userId);

    // 로컬 장바구니와 서버 장바구니 병합
    const mergedCart = [...serverCart];

    localCart.forEach(localItem => {
      const existingServerItem = mergedCart.find(
        serverItem => serverItem.productId === localItem.productId
      );

      if (existingServerItem) {
        // 수량을 더함 (로컬에서 추가한 것 + 서버에 있던 것)
        existingServerItem.quantity += localItem.quantity;
      } else {
        // 새 아이템 추가
        mergedCart.push(localItem);
      }
    });

    // 병합된 장바구니를 서버와 로컬에 저장
    await saveUserCart(userId, mergedCart);
    saveLocalCart(mergedCart);

    return mergedCart;
  } catch (error) {
    console.error('장바구니 동기화 오류:', error);
    throw new Error('장바구니 동기화 중 오류가 발생했습니다.');
  }
};

// 장바구니 총 아이템 수 계산
export const getCartItemCount = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

// 장바구니 총 금액 계산 (숫자 가격만)
export const getCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};
