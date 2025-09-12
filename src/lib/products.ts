import { 
  db,
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
  increment
} from './firebase';
import { Product, ProductFilter, ProductSort } from '@/types';

// 상품 목록 가져오기 (필터링 및 페이지네이션 지원)
export async function getProducts(
  filter?: ProductFilter,
  sort?: ProductSort,
  limit?: number,
  startAfterDoc?: any
): Promise<Product[]> {
  try {
    let q = query(collection(db, 'products'));

    // 필터 적용
    if (filter) {
      if (filter.category) {
        q = query(q, where('category', '==', filter.category));
      }
      if (filter.brand) {
        q = query(q, where('brand', '==', filter.brand));
      }
      if (filter.isWomens !== undefined) {
        q = query(q, where('isWomens', '==', filter.isWomens));
      }
      if (filter.isKids !== undefined) {
        q = query(q, where('isKids', '==', filter.isKids));
      }
      if (filter.isLeftHanded !== undefined) {
        q = query(q, where('isLeftHanded', '==', filter.isLeftHanded));
      }
      if (filter.inStock !== undefined && filter.inStock) {
        q = query(q, where('stock', '>', 0));
      }
      // targetPage 필터는 인덱스 에러 방지를 위해 getProductsForPage 함수 사용 권장
      if (filter.targetPage) {
        // 복합 쿼리 인덱스 에러 방지를 위해 간단한 처리
        const targetPageProducts = await getProductsForPage(filter.targetPage, {
          category: filter.category,
          brand: filter.brand,
          isWomens: filter.isWomens,
          isKids: filter.isKids,
          isLeftHanded: filter.isLeftHanded,
          inStock: filter.inStock,
          minPrice: filter.minPrice,
          maxPrice: filter.maxPrice,
        }, sort, limit);
        return targetPageProducts;
      }
    }

    // 정렬 적용
    if (sort) {
      q = query(q, orderBy(sort.field, sort.direction));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    // 페이지네이션
    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Product;
    });

    return products;
  } catch (error) {
    console.error('상품 목록 가져오기 오류:', error);
    return [];
  }
}

// 특정 상품 가져오기
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Product;
    }

    return null;
  } catch (error) {
    console.error('상품 가져오기 오류:', error);
    return null;
  }
}

// 상품 검색
export async function searchProducts(
  searchTerm: string,
  filter?: ProductFilter,
  sort?: ProductSort,
  limit?: number
): Promise<Product[]> {
  try {
    // Firestore는 전문 검색을 지원하지 않으므로 클라이언트 측에서 필터링
    // 제한 해제: 모든 상품에서 검색할 수 있도록 함
    let products = await getProducts(filter, sort, limit);
    
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        product.description.toLowerCase().includes(searchTermLower) ||
        (product.detailedDescription && product.detailedDescription.toLowerCase().includes(searchTermLower)) ||
        product.brand.toLowerCase().includes(searchTermLower) ||
        product.category.toLowerCase().includes(searchTermLower)
      );
    }

    // 가격 필터 적용 (클라이언트 측)
    if (filter?.minPrice !== undefined) {
      products = products.filter(product => parseInt(product.price) >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined) {
      products = products.filter(product => parseInt(product.price) <= filter.maxPrice!);
    }

    return products;
  } catch (error) {
    console.error('상품 검색 오류:', error);
    return [];
  }
}

// 상품 추가
export async function addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const docRef = doc(collection(db, 'products'));
    const now = new Date();
    
    const product: Product = {
      ...productData,
      id: docRef.id,
      views: 0, // 조회수 초기화
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, product);
    return docRef.id;
  } catch (error) {
    console.error('상품 추가 오류:', error);
    return null;
  }
}

// 상품 수정
export async function updateProduct(productId: string, productData: Partial<Product>): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    const updateData = {
      ...productData,
      updatedAt: new Date(),
    };

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('상품 수정 오류:', error);
    return false;
  }
}

// 상품 삭제
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    return false;
  }
}

// 카테고리별 상품 개수 가져오기
export async function getProductCountByCategory(): Promise<Record<string, number>> {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const categoryCounts: Record<string, number> = {};

    querySnapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      const category = data.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return categoryCounts;
  } catch (error) {
    console.error('카테고리별 상품 개수 가져오기 오류:', error);
    return {};
  }
}

// 재고 업데이트
export async function updateProductStock(productId: string, newStock: number): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('재고 업데이트 오류:', error);
    return false;
  }
}

// 주문 완료 시 재고 감소
export async function decreaseProductStock(productId: string, quantity: number): Promise<boolean> {
  try {
    // 먼저 현재 상품 정보 가져오기
    const product = await getProduct(productId);
    if (!product) {
      console.error('상품을 찾을 수 없습니다:', productId);
      return false;
    }

    // 현재 재고보다 많은 수량 요청 시 오류
    if (product.stock < quantity) {
      console.error('재고 부족:', {
        productId,
        currentStock: product.stock,
        requestedQuantity: quantity
      });
      return false;
    }

    // 재고 감소
    const newStock = product.stock - quantity;
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: new Date(),
    });

    console.log(`상품 재고 감소 완료: ${product.name} (${product.stock} → ${newStock})`);
    return true;
  } catch (error) {
    console.error('재고 감소 오류:', error);
    return false;
  }
}

// 여러 상품의 재고 일괄 감소 (주문 완료용)
export async function decreaseMultipleProductsStock(orderItems: Array<{
  productId: string;
  quantity: number;
  productName?: string;
}>): Promise<boolean> {
  try {
    console.log('주문 상품들의 재고 감소 시작:', orderItems);

    // 모든 상품의 재고 감소를 병렬로 처리
    const decreasePromises = orderItems.map(async (item) => {
      const success = await decreaseProductStock(item.productId, item.quantity);
      if (!success) {
        throw new Error(`상품 재고 감소 실패: ${item.productName || item.productId}`);
      }
      return success;
    });

    const results = await Promise.all(decreasePromises);
    const allSuccess = results.every(result => result === true);

    if (allSuccess) {
      console.log('✅ 모든 상품 재고 감소 완료');
    } else {
      console.error('❌ 일부 상품 재고 감소 실패');
    }

    return allSuccess;
  } catch (error) {
    console.error('다중 상품 재고 감소 오류:', error);
    return false;
  }
}

// 기존 상품들에 새 필드 추가 (마이그레이션)
export async function migrateProductsWithNewFields(): Promise<{ success: number; failed: number; total: number }> {
  try {
    console.log('상품 마이그레이션 시작...');
    
    // 모든 상품 가져오기
    const allProducts = await getProducts();
    const results = { success: 0, failed: 0, total: allProducts.length };
    
    console.log(`총 ${allProducts.length}개 상품 발견`);
    
    for (const product of allProducts) {
      try {
        // 이미 새 필드가 있는 상품은 건너뛰기
        if (product.cover !== undefined && product.productCode !== undefined) {
          console.log(`상품 ${product.name} - 이미 업데이트됨`);
          results.success++;
          continue;
        }
        
        // 새 필드 추가
        const updateData: Partial<Product> = {};
        
        if (product.cover === undefined) {
          // 브랜드별로 기본 커버 설정 (예시)
          updateData.cover = ['titleist', 'callaway'].includes(product.brand.toLowerCase());
        }
        
        if (product.productCode === undefined) {
          // 브랜드별 프리픽스로 상품 코드 생성
          const brandPrefix = product.brand.slice(0, 2).toUpperCase();
          const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          updateData.productCode = `${brandPrefix}${randomNum}`;
        }
        
        // 상품 업데이트
        const success = await updateProduct(product.id, updateData);
        
        if (success) {
          console.log(`상품 ${product.name} - 업데이트 완료: 커버=${updateData.cover}, 코드=${updateData.productCode}`);
          results.success++;
        } else {
          console.error(`상품 ${product.name} - 업데이트 실패`);
          results.failed++;
        }
        
      } catch (error) {
        console.error(`상품 ${product.name} 처리 중 오류:`, error);
        results.failed++;
      }
    }
    
    console.log(`마이그레이션 완료: 성공 ${results.success}개, 실패 ${results.failed}개`);
    return results;
    
  } catch (error) {
    console.error('상품 마이그레이션 오류:', error);
    return { success: 0, failed: 0, total: 0 };
  }
}

// 인기 상품 가져오기 (재고가 있는 최신 상품)
export async function getPopularProducts(limit: number = 8): Promise<Product[]> {
  try {
    // 먼저 최신 상품을 가져온 후 클라이언트에서 재고 필터링 (인덱스 에러 방지)
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit * 3) // 여유분을 두고 가져와서 재고가 있는 상품 중에서 선택
    );

    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Product;
    });

    // 클라이언트 사이드에서 재고 필터링 및 제한 적용
    products = products
      .filter(product => product.stock > 0)
      .slice(0, limit);

    return products;
  } catch (error) {
    console.error('인기 상품 가져오기 오류:', error);
    return [];
  }
}

// 특정 페이지에 표시될 상품들 가져오기
export async function getProductsForPage(
  pagePath: string,
  filter?: Omit<ProductFilter, 'targetPage'>,
  sort?: ProductSort,
  limit?: number
): Promise<Product[]> {
  try {
    // 먼저 targetPages 필터만으로 쿼리 (인덱스 에러 방지)
    let q = query(
      collection(db, 'products'),
      where('targetPages', 'array-contains', pagePath)
    );

    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Product;
    });

    // 클라이언트 사이드에서 추가 필터링
    if (filter) {
      if (filter.category) {
        products = products.filter(p => p.category === filter.category);
      }
      if (filter.brand) {
        products = products.filter(p => p.brand === filter.brand);
      }
      if (filter.isWomens !== undefined) {
        products = products.filter(p => p.isWomens === filter.isWomens);
      }
      if (filter.isKids !== undefined) {
        products = products.filter(p => p.isKids === filter.isKids);
      }
      if (filter.isLeftHanded !== undefined) {
        products = products.filter(p => p.isLeftHanded === filter.isLeftHanded);
      }
      if (filter.inStock !== undefined && filter.inStock) {
        products = products.filter(p => p.stock > 0);
      }
      if (filter.minPrice !== undefined) {
        products = products.filter(p => parseInt(p.price) >= filter.minPrice!);
      }
      if (filter.maxPrice !== undefined) {
        products = products.filter(p => parseInt(p.price) <= filter.maxPrice!);
      }
    }

    // 클라이언트 사이드에서 정렬
    if (sort) {
      products.sort((a, b) => {
        const aValue = a[sort.field as keyof Product];
        const bValue = b[sort.field as keyof Product];
        
        // undefined 값 처리
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sort.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sort.direction === 'asc' ? -1 : 1;
        
        if (sort.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    } else {
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // 제한 적용
    if (limit) {
      products = products.slice(0, limit);
    }

    return products;
  } catch (error) {
    console.error('페이지별 상품 가져오기 오류:', error);
    return [];
  }
}

// 페이지별 상품 개수 가져오기
export async function getProductCountForPage(pagePath: string): Promise<number> {
  try {
    const products = await getProductsForPage(pagePath);
    return products.length;
  } catch (error) {
    console.error('페이지별 상품 개수 가져오기 오류:', error);
    return 0;
  }
}

// 상품 조회수 증가
export async function incrementProductViews(productId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      views: increment(1),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('상품 조회수 증가 오류:', error);
    return false;
  }
}

// 상품별 위시리스트 개수 가져오기
export async function getProductWishlistCount(productId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'wishlists'),
      where('productIds', 'array-contains', productId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('상품 위시리스트 개수 가져오기 오류:', error);
    return 0;
  }
}

// Alias for backward compatibility
export { getProduct as getProductById };
