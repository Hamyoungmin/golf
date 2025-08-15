import { 
  db,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  deleteDoc,
  serverTimestamp 
} from './firebase';
import { RecentlyViewed, RecentlyViewedItem, Product } from '@/types';

// 최근 본 상품 최대 저장 개수
const MAX_RECENTLY_VIEWED = 20;

// 로컬 스토리지 키들
const STORAGE_KEYS = {
  RECENTLY_VIEWED: 'golf-recently-viewed',
  LAST_SYNC: 'golf-recently-viewed-sync',
  PRODUCTS_CACHE: 'golf-products-cache'
};

// 캐시 유효 시간 (5분)
const CACHE_DURATION = 5 * 60 * 1000;

// 로컬 스토리지 유틸리티 함수들
const localStorageUtils = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('로컬 스토리지 저장 실패:', error);
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('로컬 스토리지 삭제 실패:', error);
    }
  }
};

// 캐시가 유효한지 확인
function isCacheValid(lastSync: number): boolean {
  return Date.now() - lastSync < CACHE_DURATION;
}

/**
 * 최근 본 상품에 상품 추가 (로컬 캐싱 포함)
 */
export async function addToRecentlyViewed(userId: string, productId: string): Promise<boolean> {
  try {
    // 로컬 캐시에서 기존 데이터 가져오기
    const cacheKey = `${STORAGE_KEYS.RECENTLY_VIEWED}_${userId}`;
    let items: RecentlyViewedItem[] = localStorageUtils.get(cacheKey) || [];
    
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
    
    // 로컬 캐시에 즉시 저장
    localStorageUtils.set(cacheKey, items);
    localStorageUtils.set(`${STORAGE_KEYS.LAST_SYNC}_${userId}`, Date.now());
    
    // Firestore에 비동기로 저장 (실패해도 로컬 캐시는 유지)
    try {
      const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
      await setDoc(recentlyViewedRef, {
        userId,
        items,
        updatedAt: serverTimestamp()
      });
    } catch (firestoreError) {
      console.warn('Firestore 저장 실패 (로컬 캐시는 유지됨):', firestoreError);
      // Firestore 실패해도 true 반환 (로컬 캐시가 있음)
    }
    
    return true;
  } catch (error) {
    console.error('최근 본 상품 추가 오류:', error);
    return false;
  }
}

/**
 * 사용자의 최근 본 상품 목록 조회 (로컬 캐싱 포함)
 */
export async function getUserRecentlyViewed(userId: string, limitCount?: number): Promise<RecentlyViewedItem[]> {
  try {
    const cacheKey = `${STORAGE_KEYS.RECENTLY_VIEWED}_${userId}`;
    const lastSyncKey = `${STORAGE_KEYS.LAST_SYNC}_${userId}`;
    
    // 로컬 캐시 확인
    const cachedItems = localStorageUtils.get(cacheKey);
    const lastSync = localStorageUtils.get(lastSyncKey);
    
    // 유효한 캐시가 있으면 사용
    if (cachedItems && lastSync && isCacheValid(lastSync)) {
      let items = cachedItems;
      
      // 개수 제한이 있으면 적용
      if (limitCount && limitCount > 0) {
        items = items.slice(0, limitCount);
      }
      
      return items;
    }
    
    // 캐시가 없거나 만료된 경우 Firestore에서 조회
    try {
      const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
      const recentlyViewedSnap = await getDoc(recentlyViewedRef);
      
      let items: RecentlyViewedItem[] = [];
      
      if (recentlyViewedSnap.exists()) {
        const data = recentlyViewedSnap.data() as RecentlyViewed;
        items = data.items || [];
      }
      
      // 로컬 캐시 업데이트
      localStorageUtils.set(cacheKey, items);
      localStorageUtils.set(lastSyncKey, Date.now());
      
      // 개수 제한이 있으면 적용
      if (limitCount && limitCount > 0) {
        items = items.slice(0, limitCount);
      }
      
      return items;
    } catch (firestoreError) {
      console.warn('Firestore 조회 실패, 캐시된 데이터 사용:', firestoreError);
      
      // Firestore 실패 시 캐시된 데이터라도 반환
      if (cachedItems) {
        let items = cachedItems;
        if (limitCount && limitCount > 0) {
          items = items.slice(0, limitCount);
        }
        return items;
      }
      
      return [];
    }
  } catch (error) {
    console.error('최근 본 상품 조회 오류:', error);
    return [];
  }
}

/**
 * 최근 본 상품들의 상세 정보를 가져오기 (Product 정보 포함, 로컬 캐싱 포함)
 */
export async function getRecentlyViewedProducts(userId: string, limitCount?: number): Promise<Product[]> {
  try {
    const recentlyViewedItems = await getUserRecentlyViewed(userId, limitCount);
    
    if (recentlyViewedItems.length === 0) {
      return [];
    }
    
    // 상품 캐시 키
    const productsCacheKey = `${STORAGE_KEYS.PRODUCTS_CACHE}_${userId}`;
    const cachedProducts = localStorageUtils.get(productsCacheKey) || {};
    
    // 상품 상세 페이지의 샘플 데이터 (fallback용)
    const sampleProducts = [
      {
        id: '1',
        name: '캘러웨이 로그 드라이버',
        price: '140,000원',
        category: 'drivers',
        brand: 'callaway',
        images: ['/d1.jpg'],
        description: '캘러웨이의 최신 로그(ROGUE) 드라이버입니다. 혁신적인 기술과 뛰어난 성능으로 최고의 비거리와 정확성을 제공합니다. 모든 레벨의 골퍼에게 적합한 고성능 드라이버입니다.',
        stock: 5,
        specifications: {
          '로프트': '10.5도',
          '샤프트': 'Aldila Rogue MAX 65',
          '플렉스': 'S',
          '클럽 길이': '45.5인치',
          '헤드 볼륨': '460cc'
        },
        isWomens: false,
        isKids: false,
        isLeftHanded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    // 상품 ID 목록 추출
    const productIds = recentlyViewedItems.map(item => item.productId);
    
    // 상품 정보 조회
    const products: Product[] = [];
    const needFirestoreQuery: string[] = [];
    
    // 캐시된 상품들 먼저 확인
    for (const productId of productIds) {
      const cachedProduct = cachedProducts[productId];
      
      if (cachedProduct && cachedProduct.cachedAt && 
          isCacheValid(cachedProduct.cachedAt)) {
        products.push(cachedProduct.product);
      } else {
        needFirestoreQuery.push(productId);
      }
    }
    
    // Firestore에서 조회해야 하는 상품들 처리 (제한적으로)
    for (const productId of needFirestoreQuery) {
      try {
        let product: Product | null = null;
        
        // 샘플 데이터에서 먼저 찾기 (Firestore 사용량 줄이기)
        product = sampleProducts.find(p => p.id === productId) || null;
        
        // 샘플 데이터에 없는 경우에만 Firestore 조회 (할당량 절약)
        if (!product) {
          try {
            const productRef = doc(db, 'products', productId);
            const productSnap = await getDoc(productRef);
            
            if (productSnap.exists()) {
              const productData = productSnap.data();
              product = {
                id: productSnap.id,
                ...productData,
                createdAt: productData.createdAt?.toDate() || new Date(),
                updatedAt: productData.updatedAt?.toDate() || new Date(),
              } as Product;
            }
          } catch (firestoreError) {
            console.warn(`Firestore에서 상품 ${productId} 조회 실패:`, firestoreError);
          }
        }
        
        if (product) {
          products.push(product);
          
          // 상품 캐시에 저장
          cachedProducts[productId] = {
            product,
            cachedAt: Date.now()
          };
        }
      } catch (error) {
        console.error(`상품 ${productId} 조회 오류:`, error);
        // 에러 발생 시 샘플 데이터에서 찾기
        const product = sampleProducts.find(p => p.id === productId);
        if (product) {
          products.push(product);
        }
      }
    }
    
    // 상품 캐시 업데이트
    if (needFirestoreQuery.length > 0) {
      localStorageUtils.set(productsCacheKey, cachedProducts);
    }
    
    // 원래 순서 유지
    const orderedProducts: Product[] = [];
    for (const productId of productIds) {
      const product = products.find(p => p.id === productId);
      if (product) {
        orderedProducts.push(product);
      }
    }
    
    return orderedProducts;
  } catch (error) {
    console.error('최근 본 상품 상세 정보 조회 오류:', error);
    return [];
  }
}

/**
 * 최근 본 상품에서 특정 상품 제거 (로컬 캐싱 포함)
 */
export async function removeFromRecentlyViewed(userId: string, productId: string): Promise<boolean> {
  try {
    if (!userId || !productId) {
      return false;
    }

    const cacheKey = `${STORAGE_KEYS.RECENTLY_VIEWED}_${userId}`;
    
    // 로컬 캐시에서 제거
    const cachedItems = localStorageUtils.get(cacheKey) || [];
    const filteredItems = cachedItems.filter((item: RecentlyViewedItem) => 
      item && item.productId !== productId
    );
    
    // 로컬 캐시 업데이트
    localStorageUtils.set(cacheKey, filteredItems);
    localStorageUtils.set(`${STORAGE_KEYS.LAST_SYNC}_${userId}`, Date.now());
    
    // Firestore 업데이트 (실패해도 로컬 캐시는 유지)
    try {
      const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
      await setDoc(recentlyViewedRef, {
        userId,
        items: filteredItems,
        updatedAt: serverTimestamp()
      });
    } catch (firestoreError) {
      console.warn('Firestore 제거 실패 (로컬 캐시는 업데이트됨):', firestoreError);
    }
    
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
    // 입력값 검증
    if (!userId || !Array.isArray(productIds)) {
      console.error('유효하지 않은 입력값:', { userId, productIds });
      return false;
    }

    const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
    const recentlyViewedSnap = await getDoc(recentlyViewedRef);
    
    if (!recentlyViewedSnap.exists()) {
      return true; // 이미 없으므로 성공으로 처리
    }
    
    const data = recentlyViewedSnap.data() as RecentlyViewed;
    const originalItems = data.items || [];
    
    // 안전한 배열 필터링
    const filteredItems = originalItems.filter(item => {
      if (!item || typeof item.productId !== 'string') {
        return false;
      }
      return !productIds.includes(item.productId);
    });
    
    // 업데이트
    await setDoc(recentlyViewedRef, {
      userId,
      items: filteredItems,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('최근 본 상품 다중 제거 오류:', error);
    return false;
  }
}

/**
 * 사용자의 최근 본 상품 목록 전체 삭제 (로컬 캐싱 포함)
 */
export async function clearRecentlyViewed(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }

    const cacheKey = `${STORAGE_KEYS.RECENTLY_VIEWED}_${userId}`;
    const productsCacheKey = `${STORAGE_KEYS.PRODUCTS_CACHE}_${userId}`;
    const lastSyncKey = `${STORAGE_KEYS.LAST_SYNC}_${userId}`;
    
    // 로컬 캐시 모두 삭제
    localStorageUtils.remove(cacheKey);
    localStorageUtils.remove(productsCacheKey);
    localStorageUtils.remove(lastSyncKey);
    
    // Firestore에서 삭제 (실패해도 로컬은 이미 삭제됨)
    try {
      const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
      await deleteDoc(recentlyViewedRef);
    } catch (firestoreError) {
      console.warn('Firestore 삭제 실패 (로컬 캐시는 삭제됨):', firestoreError);
    }
    
    return true;
  } catch (error) {
    console.error('최근 본 상품 전체 삭제 오류:', error);
    return false;
  }
}

/**
 * 특정 상품이 최근 본 상품에 있는지 확인 (로컬 캐싱 포함)
 */
export async function isInRecentlyViewed(userId: string, productId: string): Promise<boolean> {
  try {
    if (!userId || !productId) {
      return false;
    }

    // 로컬 캐시에서 먼저 확인 (빠른 응답)
    const cacheKey = `${STORAGE_KEYS.RECENTLY_VIEWED}_${userId}`;
    const cachedItems = localStorageUtils.get(cacheKey);
    
    if (Array.isArray(cachedItems)) {
      return cachedItems.some((item: RecentlyViewedItem) => 
        item && item.productId === productId
      );
    }
    
    // 캐시가 없으면 조회 (이때 캐시도 업데이트됨)
    const recentlyViewedItems = await getUserRecentlyViewed(userId);
    return recentlyViewedItems.some(item => item.productId === productId);
  } catch (error) {
    console.error('최근 본 상품 확인 오류:', error);
    return false;
  }
}

// 디바운싱을 위한 타이머 저장소
const debounceTimers = new Map<string, NodeJS.Timeout>();

/**
 * Firestore 요청을 디바운스하는 헬퍼 함수
 */
function debounceFirestoreOperation(
  key: string, 
  operation: () => Promise<void>, 
  delay: number = 1000
): void {
  // 기존 타이머가 있으면 취소
  const existingTimer = debounceTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }
  
  // 새로운 타이머 설정
  const timer = setTimeout(async () => {
    try {
      await operation();
    } catch (error) {
      console.warn('디바운스된 Firestore 작업 실패:', error);
    } finally {
      debounceTimers.delete(key);
    }
  }, delay);
  
  debounceTimers.set(key, timer);
}

/**
 * 최근 본 상품에 상품 추가 (디바운스 버전)
 */
export async function addToRecentlyViewedDebounced(userId: string, productId: string): Promise<boolean> {
  if (!userId || !productId) {
    return false;
  }

  try {
    // 로컬 캐시는 즉시 업데이트
    const cacheKey = `${STORAGE_KEYS.RECENTLY_VIEWED}_${userId}`;
    let items: RecentlyViewedItem[] = localStorageUtils.get(cacheKey) || [];
    
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
    
    // 로컬 캐시에 즉시 저장
    localStorageUtils.set(cacheKey, items);
    localStorageUtils.set(`${STORAGE_KEYS.LAST_SYNC}_${userId}`, Date.now());
    
    // Firestore 업데이트는 디바운스 (1초 지연)
    debounceFirestoreOperation(`recently-viewed-${userId}`, async () => {
      const recentlyViewedRef = doc(db, 'recentlyViewed', userId);
      await setDoc(recentlyViewedRef, {
        userId,
        items,
        updatedAt: serverTimestamp()
      });
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('최근 본 상품 추가 (디바운스) 오류:', error);
    return false;
  }
}
