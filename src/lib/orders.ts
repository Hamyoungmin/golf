import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Order, OrderItem, OrderStatus, Address } from '@/types';

// 주문 ID 생성 함수
const generateOrderId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD${timestamp}${random}`.toUpperCase();
};

// 새 주문 생성
export const createOrder = async (orderData: {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
}): Promise<string> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const orderId = generateOrderId();
    const now = new Date();

    const order: Omit<Order, 'orderId'> = {
      userId: orderData.userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'pending',
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      createdAt: now,
      updatedAt: now,
    };

    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      orderId,
      ...order,
    });

    return orderId;
  } catch (error) {
    console.error('주문 생성 오류:', error);
    throw new Error('주문 생성 중 오류가 발생했습니다.');
  }
};

// 특정 주문 조회
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      orderId: data.orderId,
      userId: data.userId,
      items: data.items,
      totalAmount: data.totalAmount,
      status: data.status,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Order;
  } catch (error) {
    console.error('주문 조회 오류:', error);
    throw new Error('주문을 불러오는 중 오류가 발생했습니다.');
  }
};

// 사용자의 주문 목록 조회
export const getUserOrders = async (
  userId: string,
  limit: number = 10,
  lastOrder?: Order
): Promise<Order[]> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const ordersRef = collection(db, 'orders');
    let q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    // 페이지네이션을 위한 커서
    if (lastOrder) {
      q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(Timestamp.fromDate(lastOrder.createdAt)),
        firestoreLimit(limit)
      );
    }

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        orderId: data.orderId,
        userId: data.userId,
        items: data.items,
        totalAmount: data.totalAmount,
        status: data.status,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('사용자 주문 목록 조회 오류:', error);
    throw new Error('주문 목록을 불러오는 중 오류가 발생했습니다.');
  }
};

// 주문 상태 업데이트
export const updateOrderStatus = async (
  orderId: string, 
  status: OrderStatus
): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('주문을 찾을 수 없습니다.');
    }

    const orderDoc = querySnapshot.docs[0];
    await updateDoc(orderDoc.ref, {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    throw new Error('주문 상태 업데이트 중 오류가 발생했습니다.');
  }
};

// 주문 취소
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    await updateOrderStatus(orderId, 'cancelled');
  } catch (error) {
    console.error('주문 취소 오류:', error);
    throw new Error('주문 취소 중 오류가 발생했습니다.');
  }
};

// 결제 완료 처리
export const completePayment = async (orderId: string): Promise<void> => {
  try {
    await updateOrderStatus(orderId, 'paid');
  } catch (error) {
    console.error('결제 완료 처리 오류:', error);
    throw new Error('결제 완료 처리 중 오류가 발생했습니다.');
  }
};

// 주문 통계 (관리자용)
export const getOrderStats = async (): Promise<{
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const ordersRef = collection(db, 'orders');
    const allOrdersQuery = query(ordersRef);
    const allOrdersSnapshot = await getDocs(allOrdersQuery);

    let totalOrders = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let totalRevenue = 0;

    allOrdersSnapshot.forEach((doc) => {
      const data = doc.data();
      totalOrders++;

      switch (data.status) {
        case 'pending':
          pendingOrders++;
          break;
        case 'delivered':
          completedOrders++;
          totalRevenue += data.totalAmount;
          break;
      }
    });

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    };
  } catch (error) {
    console.error('주문 통계 조회 오류:', error);
    throw new Error('주문 통계를 불러오는 중 오류가 발생했습니다.');
  }
};

// 주문 상태별 텍스트 반환
export const getOrderStatusText = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return '주문 접수';
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
};

// 주문 상태별 색상 반환
export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'paid':
      return 'text-blue-600 bg-blue-100';
    case 'shipped':
      return 'text-purple-600 bg-purple-100';
    case 'delivered':
      return 'text-green-600 bg-green-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// 모든 주문 조회 (관리자용)
export const getAllOrders = async (
  limit: number = 20,
  lastOrder?: Order,
  status?: OrderStatus
): Promise<Order[]> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const ordersRef = collection(db, 'orders');
    const constraints = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(firestoreLimit(limit));

    if (lastOrder) {
      constraints.push(startAfter(Timestamp.fromDate(lastOrder.createdAt)));
    }

    const q = query(ordersRef, ...constraints);
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        orderId: data.orderId,
        userId: data.userId,
        items: data.items,
        totalAmount: data.totalAmount,
        status: data.status,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('전체 주문 목록 조회 오류:', error);
    throw new Error('주문 목록을 불러오는 중 오류가 발생했습니다.');
  }
};

// 최근 주문 조회 (관리자 대시보드용)
export const getRecentOrders = async (limit: number = 5): Promise<Order[]> => {
  return getAllOrders(limit);
};