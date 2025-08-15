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
  WhereFilterOp
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
    let products = await getProducts(filter, sort, limit || 100);
    
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        product.description.toLowerCase().includes(searchTermLower) ||
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

// 인기 상품 가져오기 (임시로 최신 순으로 정렬)
export async function getPopularProducts(limit: number = 8): Promise<Product[]> {
  try {
    const q = query(
      collection(db, 'products'),
      where('stock', '>', 0),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

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
    console.error('인기 상품 가져오기 오류:', error);
    return [];
  }
}

