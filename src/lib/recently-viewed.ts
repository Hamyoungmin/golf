import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { RecentlyViewed, RecentlyViewedItem, Product } from '@/types';

// 최근 본 상품 최대 저장 개수
const MAX_RECENTLY_VIEWED = 20;

/**
 * 최근 본 상품에 상품 추가
 */
export async function addToRecentlyViewed(userId: string, productId: string): Promise<boolean> {
  try {
    const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
    const recentlyViewedSnap = await getDoc(recentlyViewedRef);
    
    let items: RecentlyViewedItem[] = [];
    
    if (recentlyViewedSnap.exists()) {
      const data = recentlyViewedSnap.data() as RecentlyViewed;
      items = data.items || [];
    }
    
    // 이미 있는 상품이면 제거 (최신으로 업데이트하기 위해)
    items = items.filter(item => item.productId !== productId);
    
    // 맨 앞에 새 상품 추가
    items.unshift({
      productId,
      viewedAt: new Date()
    });
    
    // 최대 개수 제한
    if (items.length > MAX_RECENTLY_VIEWED) {
      items = items.slice(0, MAX_RECENTLY_VIEWED);
    }
    
    // Firestore에 저장
    await setDoc(recentlyViewedRef, {
      userId,
      items,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('최근 본 상품 추가 오류:', error);
    return false;
  }
}

/**
 * 사용자의 최근 본 상품 목록 조회
 */
export async function getUserRecentlyViewed(userId: string, limitCount?: number): Promise<RecentlyViewedItem[]> {
  try {
    const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
    const recentlyViewedSnap = await getDoc(recentlyViewedRef);
    
    if (!recentlyViewedSnap.exists()) {
      return [];
    }
    
    const data = recentlyViewedSnap.data() as RecentlyViewed;
    let items = data.items || [];
    
    // 개수 제한이 있으면 적용
    if (limitCount && limitCount > 0) {
      items = items.slice(0, limitCount);
    }
    
    return items;
  } catch (error) {
    console.error('최근 본 상품 조회 오류:', error);
    return [];
  }
}

/**
 * 최근 본 상품들의 상세 정보를 가져오기 (Product 정보 포함)
 */
export async function getRecentlyViewedProducts(userId: string, limitCount?: number): Promise<Product[]> {
  try {
    const recentlyViewedItems = await getUserRecentlyViewed(userId, limitCount);
    
    if (recentlyViewedItems.length === 0) {
      return [];
    }
    
    // 상품 ID 목록 추출
    const productIds = recentlyViewedItems.map(item => item.productId);
    
    // 상품 정보 조회
    const products: Product[] = [];
    
    for (const productId of productIds) {
      try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          products.push({
            id: productSnap.id,
            ...productData,
            createdAt: productData.createdAt?.toDate() || new Date(),
            updatedAt: productData.updatedAt?.toDate() || new Date(),
          } as Product);
        }
      } catch (error) {
        console.error(`상품 ${productId} 조회 오류:`, error);
        // 개별 상품 조회 실패는 전체를 실패시키지 않음
      }
    }
    
    return products;
  } catch (error) {
    console.error('최근 본 상품 상세 정보 조회 오류:', error);
    return [];
  }
}

/**
 * 최근 본 상품에서 특정 상품 제거
 */
export async function removeFromRecentlyViewed(userId: string, productId: string): Promise<boolean> {
  try {
    const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
    const recentlyViewedSnap = await getDoc(recentlyViewedRef);
    
    if (!recentlyViewedSnap.exists()) {
      return true; // 이미 없으므로 성공으로 처리
    }
    
    const data = recentlyViewedSnap.data() as RecentlyViewed;
    const items = (data.items || []).filter(item => item.productId !== productId);
    
    // 업데이트
    await setDoc(recentlyViewedRef, {
      userId,
      items,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('최근 본 상품 제거 오류:', error);
    return false;
  }
}

/**
 * 여러 상품을 최근 본 상품에서 제거
 */
export async function removeMultipleFromRecentlyViewed(userId: string, productIds: string[]): Promise<boolean> {
  try {
    const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
    const recentlyViewedSnap = await getDoc(recentlyViewedRef);
    
    if (!recentlyViewedSnap.exists()) {
      return true; // 이미 없으므로 성공으로 처리
    }
    
    const data = recentlyViewedSnap.data() as RecentlyViewed;
    const items = (data.items || []).filter(item => !productIds.includes(item.productId));
    
    // 업데이트
    await setDoc(recentlyViewedRef, {
      userId,
      items,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('최근 본 상품 다중 제거 오류:', error);
    return false;
  }
}

/**
 * 사용자의 최근 본 상품 목록 전체 삭제
 */
export async function clearRecentlyViewed(userId: string): Promise<boolean> {
  try {
    const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
    await deleteDoc(recentlyViewedRef);
    return true;
  } catch (error) {
    console.error('최근 본 상품 전체 삭제 오류:', error);
    return false;
  }
}

/**
 * 특정 상품이 최근 본 상품에 있는지 확인
 */
export async function isInRecentlyViewed(userId: string, productId: string): Promise<boolean> {
  try {
    const recentlyViewedItems = await getUserRecentlyViewed(userId);
    return recentlyViewedItems.some(item => item.productId === productId);
  } catch (error) {
    console.error('최근 본 상품 확인 오류:', error);
    return false;
  }
}
