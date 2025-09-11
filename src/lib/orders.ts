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
import { completeProductReservation } from './productReservations';
import { decreaseMultipleProductsStock } from './products';

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
    console.log('🛍️ 주문 생성 시작:', orderData);
    
    const docRef = doc(collection(db, 'orders'));
    const now = new Date();
    
    const order: Order = {
      ...orderData,
      orderId: docRef.id,
      createdAt: now,
      updatedAt: now,
    };

    // 주문 생성 전에 먼저 재고 감소 처리
    if (orderData.items) {
      console.log('📦 재고 감소 처리 시작...');
      const stockDecreaseSuccess = await decreaseMultipleProductsStock(
        orderData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName
        }))
      );

      if (!stockDecreaseSuccess) {
        throw new Error('재고 감소 처리에 실패했습니다. 주문이 취소됩니다.');
      }
      console.log('✅ 재고 감소 완료');
    }

    // 재고 감소 성공 후 주문 생성
    await setDoc(docRef, order);
    console.log('✅ 주문 생성 완료:', docRef.id);
    
    // 주문한 상품들의 예약을 완료 처리
    if (orderData.items && orderData.userId) {
      console.log('🔒 상품 예약 완료 처리...');
      const reservationPromises = orderData.items.map(item => 
        completeProductReservation(item.productId, orderData.userId)
      );
      await Promise.all(reservationPromises);
      console.log('✅ 예약 완료 처리 완료');
    }
    
    // 주문 생성 후 자동으로 통계 업데이트
    await onOrderCreated(docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ 주문 생성 오류:', error);
    return null;
  }
}

// 주문 상태 업데이트 (결제 상태도 함께 업데이트)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date()
    });

    // 🔄 주문이 취소된 경우 관련 결제 정보도 취소 상태로 업데이트
    if (status === 'cancelled') {
      console.log('📋 주문 취소 - 관련 결제 정보 업데이트 중...', orderId);
      await updatePaymentStatusByCancellation(orderId);
    }

    return true;
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    return false;
  }
}

// 주문 취소 시 관련 결제 정보 취소 처리
async function updatePaymentStatusByCancellation(orderId: string): Promise<boolean> {
  try {
    console.log('🔍 주문 취소 처리 시작:', orderId);
    
    // 해당 주문 ID와 관련된 모든 결제 정보 찾기 (복합 쿼리 피하기)
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('orderId', '==', orderId)
    );
    
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    if (paymentsSnapshot.empty) {
      console.log('📋 해당 주문의 결제 정보가 없습니다:', orderId);
      return true;
    }

    console.log(`📋 찾은 결제 정보: ${paymentsSnapshot.docs.length}개`);

    // 취소되지 않은 결제만 필터링하여 업데이트
    const updatePromises = paymentsSnapshot.docs
      .filter(paymentDoc => paymentDoc.data().status !== 'cancelled') // 클라이언트에서 필터링
      .map(paymentDoc => {
        console.log(`📋 결제 정보 취소 중: ${paymentDoc.id} (현재 상태: ${paymentDoc.data().status})`);
        return updateDoc(doc(db, 'payments', paymentDoc.id), {
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date(),
          notes: (paymentDoc.data().notes || '') + '\n[자동] 주문 취소로 인한 결제 취소'
        });
      });

    if (updatePromises.length === 0) {
      console.log('📋 업데이트할 결제 정보가 없습니다 (이미 모두 취소됨)');
      return true;
    }

    await Promise.all(updatePromises);
    
    console.log(`✅ ${updatePromises.length}개의 결제 정보를 취소 상태로 업데이트 완료`);
    return true;
  } catch (error) {
    console.error('❌ 결제 정보 취소 처리 실패:', error);
    // 결제 상태 업데이트가 실패해도 주문 상태 변경은 유지
    return false;
  }
}

// 특정 주문의 결제 상태를 강제로 취소 처리 (디버깅용)
export async function forceUpdatePaymentStatus(orderId: string): Promise<boolean> {
  console.log('🔧 특정 주문의 결제 상태 강제 업데이트:', orderId);
  return await updatePaymentStatusByCancellation(orderId);
}

// 주문 ID로 주문 정보 가져오기 (별칭 함수)
export async function getOrderByOrderId(orderId: string): Promise<Order | null> {
  return await getOrder(orderId);
}
