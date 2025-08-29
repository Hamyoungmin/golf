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
  orderBy, 
  limit as firestoreLimit,
  DocumentSnapshot
} from './firebase';
import { Order, OrderStatus } from '@/types';
import { onOrderCreated } from './analytics';

// 특정 사용자의 주문 목록 가져오기
export async function getUserOrders(userId: string, limit?: number): Promise<Order[]> {
  try {
    let q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );

    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        orderId: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order;
    });

    // 클라이언트 사이드에서 생성일 기준으로 정렬 (최신순)
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('사용자 주문 목록 가져오기 오류:', error);
    return [];
  }
}

// 모든 주문 목록 가져오기 (관리자용)
export async function getAllOrders(limit?: number, startAfter?: any, status?: OrderStatus): Promise<Order[]> {
  try {
    let q = query(collection(db, 'orders'));

    if (status) {
      q = query(
        collection(db, 'orders'),
        where('status', '==', status)
      );
    }

    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        orderId: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order;
    });

    // 클라이언트 사이드에서 생성일 기준으로 정렬 (최신순)
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('주문 목록 가져오기 오류:', error);
    return [];
  }
}

// 특정 주문 가져오기
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        orderId: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order;
    }

    return null;
  } catch (error) {
    console.error('주문 가져오기 오류:', error);
    return null;
  }
}

// 주문 상태 텍스트 변환
export function getOrderStatusText(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return '주문 접수';
    case 'payment_pending':
      return '결제 대기';
    case 'paid':
      return '결제 완료';
    case 'shipped':
      return '배송 중';
    case 'delivered':
      return '배송 완료';
    case 'cancelled':
      return '주문 취소';
    default:
      return '알 수 없음';
  }
}

// 주문 상태 색상 변환
export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'payment_pending':
      return 'text-blue-600 bg-blue-100';
    case 'paid':
      return 'text-blue-600 bg-blue-100';
    case 'shipped':
      return 'text-purple-600 bg-purple-100';
    case 'delivered':
      return 'text-blue-600 bg-blue-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// 주문 생성
export async function createOrder(orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const docRef = doc(collection(db, 'orders'));
    const now = new Date();
    
    const order: Order = {
      ...orderData,
      orderId: docRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, order);
    
    // 주문 생성 후 자동으로 통계 업데이트
    await onOrderCreated(docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('주문 생성 오류:', error);
    return null;
  }
}

// 주문 상태 업데이트
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    return false;
  }
}

// 주문 ID로 주문 정보 가져오기 (별칭 함수)
export async function getOrderByOrderId(orderId: string): Promise<Order | null> {
  return await getOrder(orderId);
}
