import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Product, ProductFilter, ProductSort, PaginatedResponse } from '@/types';

// Firestore 컬렉션 참조
const getProductsCollection = () => {
  const db = getFirebaseFirestore();
  if (!db) throw new Error('Firestore를 사용할 수 없습니다.');
  return collection(db, 'products');
};

// 모든 상품 조회 (페이지네이션 적용)
export const getProducts = async (
  page: number = 1,
  pageSize: number = 12,
  filter?: ProductFilter,
  sort?: ProductSort
): Promise<PaginatedResponse<Product>> => {
  try {
    const productsRef = getProductsCollection();
    const constraints: QueryConstraint[] = [];

    // 필터 적용
    if (filter) {
      if (filter.category) {
        constraints.push(where('category', '==', filter.category));
      }
      if (filter.brand) {
        constraints.push(where('brand', '==', filter.brand));
      }
      if (filter.isWomens !== undefined) {
        constraints.push(where('isWomens', '==', filter.isWomens));
      }
      if (filter.isKids !== undefined) {
        constraints.push(where('isKids', '==', filter.isKids));
      }
      if (filter.isLeftHanded !== undefined) {
        constraints.push(where('isLeftHanded', '==', filter.isLeftHanded));
      }
      if (filter.inStock) {
        constraints.push(where('stock', '>', 0));
      }
    }

    // 정렬 적용
    if (sort) {
      constraints.push(orderBy(sort.field, sort.direction));
    } else {
      // 기본 정렬: 최신순
      constraints.push(orderBy('createdAt', 'desc'));
    }

    // 페이지네이션 적용
    constraints.push(limit(pageSize));

    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const products: Product[] = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[];

    // 전체 개수 조회 (필터 적용)
    const countQuery = query(productsRef, ...constraints.filter(c => c.type !== 'limit'));
    const countSnapshot = await getDocs(countQuery);
    const total = countSnapshot.size;

    return {
      data: products,
      success: true,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('상품을 불러오는 중 오류가 발생했습니다.');
  }
};

// 특정 상품 조회
export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const docRef = doc(db, 'products', id);
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
    console.error('Error fetching product:', error);
    throw new Error('상품을 불러오는 중 오류가 발생했습니다.');
  }
};

// 카테고리별 상품 조회
export const getProductsByCategory = async (
  category: string,
  limit: number = 12
): Promise<Product[]> => {
  try {
    const productsRef = getProductsCollection();
    const q = query(
      productsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw new Error('카테고리별 상품을 불러오는 중 오류가 발생했습니다.');
  }
};

// 브랜드별 상품 조회
export const getProductsByBrand = async (
  brand: string,
  category?: string,
  limit: number = 12
): Promise<Product[]> => {
  try {
    const productsRef = getProductsCollection();
    const constraints: QueryConstraint[] = [
      where('brand', '==', brand),
      orderBy('createdAt', 'desc'),
      limit(limit)
    ];

    if (category) {
      constraints.unshift(where('category', '==', category));
    }

    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products by brand:', error);
    throw new Error('브랜드별 상품을 불러오는 중 오류가 발생했습니다.');
  }
};

// 상품 검색
export const searchProducts = async (
  searchTerm: string,
  limit: number = 12
): Promise<Product[]> => {
  try {
    const productsRef = getProductsCollection();
    
    // Firestore는 full-text search가 제한적이므로 
    // 상품명에 검색어가 포함된 것들을 찾습니다
    const q = query(
      productsRef,
      orderBy('name'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    const allProducts = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[];

    // 클라이언트 사이드에서 필터링 (실제 프로덕션에서는 Algolia 등 사용 권장)
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching products:', error);
    throw new Error('상품 검색 중 오류가 발생했습니다.');
  }
};

// 상품 추가 (관리자용)
export const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const productsRef = getProductsCollection();
    const now = new Date();
    
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('상품 추가 중 오류가 발생했습니다.');
  }
};

// 상품 수정 (관리자용)
export const updateProduct = async (id: string, productData: Partial<Product>): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('상품 수정 중 오류가 발생했습니다.');
  }
};

// 상품 삭제 (관리자용)
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('상품 삭제 중 오류가 발생했습니다.');
  }
};

// 인기 상품 조회
export const getPopularProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    const productsRef = getProductsCollection();
    // 실제로는 조회수나 판매량 기준으로 정렬해야 하지만, 
    // 현재는 최신순으로 조회
    const q = query(
      productsRef,
      where('stock', '>', 0),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw new Error('인기 상품을 불러오는 중 오류가 발생했습니다.');
  }
};

// 상품 통계 조회 (관리자용)
export const getProductStats = async (): Promise<{
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  categories: { [key: string]: number };
}> => {
  try {
    const productsRef = getProductsCollection();
    const allProductsSnapshot = await getDocs(productsRef);
    
    let totalProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    const categories: { [key: string]: number } = {};

    allProductsSnapshot.forEach((doc) => {
      const data = doc.data();
      totalProducts++;

      // 재고 확인
      if (data.stock === 0) {
        outOfStockProducts++;
      } else if (data.stock < 10) {
        lowStockProducts++;
      }

      // 카테고리별 집계
      if (data.category) {
        categories[data.category] = (categories[data.category] || 0) + 1;
      }
    });

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      categories
    };
  } catch (error) {
    console.error('상품 통계 조회 오류:', error);
    throw new Error('상품 통계를 불러오는 중 오류가 발생했습니다.');
  }
};