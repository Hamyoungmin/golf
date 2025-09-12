import { 
  db,
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  addDoc,
  orderBy,
  serverTimestamp
} from './firebase';
import { Product, InventoryStats, StockHistory, StockAdjustment } from '@/types';
import { getProducts, updateProductStock } from './products';

// 재고 통계 계산
export async function getInventoryStats(): Promise<InventoryStats> {
  try {
    const products = await getProducts();
    
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock <= 0).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, product) => {
      return sum + (parseInt(product.price) * product.stock);
    }, 0);

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue
    };
  } catch (error) {
    console.error('재고 통계 계산 오류:', error);
    return {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalValue: 0
    };
  }
}

// 재고가 있는 상품 목록 가져오기 (재고 관리용)
export async function getInventoryProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.sort((a, b) => {
      // 품절 상품을 맨 아래로, 그 다음 재고 부족 상품, 마지막에 정상 재고 상품
      if (a.stock === 0 && b.stock > 0) return 1;
      if (a.stock > 0 && b.stock === 0) return -1;
      if (a.stock <= 0 && b.stock > 0) return -1;
      if (a.stock > 0 && b.stock <= 0) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('재고 상품 목록 가져오기 오류:', error);
    return [];
  }
}

// 재고 조정 (입고/출고/조정)
export async function adjustStock(
  adjustment: StockAdjustment, 
  adminUserId: string
): Promise<boolean> {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    // 현재 상품 정보 가져오기
    const productDoc = await getDoc(doc(db, 'products', adjustment.productId));
    if (!productDoc.exists()) {
      throw new Error('상품을 찾을 수 없습니다.');
    }

    const product = productDoc.data() as Product;
    const previousStock = product.stock;
    let newStock: number;

    // 재고 계산
    switch (adjustment.type) {
      case 'increase':
        newStock = previousStock + adjustment.quantity;
        break;
      case 'decrease':
        newStock = Math.max(0, previousStock - adjustment.quantity);
        break;
      case 'set':
        newStock = adjustment.quantity;
        break;
      default:
        throw new Error('잘못된 조정 타입입니다.');
    }

    // 재고 업데이트
    const success = await updateProductStock(adjustment.productId, newStock);
    if (!success) {
      throw new Error('재고 업데이트에 실패했습니다.');
    }

    // 재고 이력 저장
    await addStockHistory({
      productId: adjustment.productId,
      productName: product.name,
      type: 'adjustment',
      previousStock,
      newStock,
      quantity: Math.abs(newStock - previousStock),
      reason: adjustment.reason,
      createdBy: adminUserId
    });

    return true;
  } catch (error) {
    console.error('재고 조정 오류:', error);
    return false;
  }
}

// 재고 이력 추가
export async function addStockHistory(historyData: Omit<StockHistory, 'id' | 'createdAt'>): Promise<boolean> {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    await addDoc(collection(db, 'stockHistory'), {
      ...historyData,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('재고 이력 저장 오류:', error);
    return false;
  }
}

// 특정 상품의 재고 이력 가져오기
export async function getProductStockHistory(productId: string): Promise<StockHistory[]> {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    const q = query(
      collection(db, 'stockHistory'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as StockHistory;
    });

    return history;
  } catch (error) {
    console.error('재고 이력 가져오기 오류:', error);
    return [];
  }
}

// 전체 재고 이력 가져오기 (최근 100개)
export async function getAllStockHistory(limit: number = 100): Promise<StockHistory[]> {
  try {
    if (!db) {
      throw new Error('Firestore가 초기화되지 않았습니다');
    }
    
    const q = query(
      collection(db, 'stockHistory'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.slice(0, limit).map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as StockHistory;
    });

    return history;
  } catch (error) {
    console.error('전체 재고 이력 가져오기 오류:', error);
    return [];
  }
}

// 재고 상태 텍스트 반환
export function getStockStatusText(stock: number): string {
  if (stock === 0) return '품절';
  if (stock < 0) return '부족';
  return '정상';
}

// 재고 상태 색상 반환
export function getStockStatusColor(stock: number): string {
  if (stock === 0) return '#e74c3c'; // 빨간색
  if (stock < 0) return '#f39c12'; // 주황색
  return '#27ae60'; // 초록색
}

// 자동 재고 알림 확인 (재고 부족 상품들)
export async function checkLowStockProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter(product => product.stock < 0);
  } catch (error) {
    console.error('재고 부족 상품 확인 오류:', error);
    return [];
  }
}

// 품절 상품 확인
export async function checkOutOfStockProducts(): Promise<Product[]> {
  try {
    const products = await getProducts();
    return products.filter(product => product.stock === 0);
  } catch (error) {
    console.error('품절 상품 확인 오류:', error);
    return [];
  }
}
