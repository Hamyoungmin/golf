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
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp
} from './firebase';
import { ProductReservation } from '@/types';

// 간단한 배타적 장바구니 시스템 (시간 제한 없음)

// 제품을 장바구니에 점유하기 (간단한 버전)
export async function reserveProduct(
  productId: string, 
  userId: string, 
  userName: string, 
  userEmail: string
): Promise<string | null> {
  try {
    // 이미 다른 사용자가 장바구니에 담았는지 확인
    const existingReservation = await getActiveProductReservation(productId);
    if (existingReservation && existingReservation.userId !== userId) {
      throw new Error(`이미 "${existingReservation.userName}"님이 장바구니에 담은 상품입니다.`);
    }

    // 사용자가 이미 담은 경우는 기존 예약 유지
    if (existingReservation && existingReservation.userId === userId) {
      return existingReservation.id;
    }

    // 새로운 장바구니 점유 생성 (24시간 제한)
    console.log('🔒 [reserveProduct] 새 예약 생성 시작...');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24시간 후
    console.log('📅 [reserveProduct] 만료 시간:', expiresAt);
    
    const reservation: Omit<ProductReservation, 'id'> = {
      productId,
      userId,
      userName,
      userEmail,
      reservedAt: now,
      expiresAt: expiresAt,
      status: 'active'
    };

    console.log('💾 [reserveProduct] Firebase에 저장할 데이터:', reservation);
    const docRef = await addDoc(collection(db, 'productReservations'), {
      ...reservation,
      reservedAt: serverTimestamp(),
      expiresAt: reservation.expiresAt,
      updatedAt: serverTimestamp()
    });

    console.log('✅ [reserveProduct] 상품 장바구니 점유 완료! docRef.id:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('상품 장바구니 점유 오류:', error);
    throw error;
  }
}

// 제품 예약 해제
export async function releaseProductReservation(
  productId: string, 
  userId: string
): Promise<boolean> {
  try {
    const reservation = await getActiveProductReservation(productId);
    
    if (!reservation) {
      return true; // 이미 예약이 없음
    }

    if (reservation.userId !== userId) {
      throw new Error('다른 사용자의 예약은 해제할 수 없습니다.');
    }

    await updateDoc(doc(db, 'productReservations', reservation.id), {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });

    console.log('상품 예약 해제 완료:', reservation.id);
    return true;
  } catch (error) {
    console.error('상품 예약 해제 오류:', error);
    return false;
  }
}

// 활성 상태인 제품 점유 조회 (간단한 버전)
export async function getActiveProductReservation(
  productId: string
): Promise<ProductReservation | null> {
  try {
    console.log('🔍 [getActiveProductReservation] Firebase 쿼리 시작, productId:', productId);
    const q = query(
      collection(db, 'productReservations'),
      where('productId', '==', productId),
      where('status', '==', 'active'),
      orderBy('reservedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    console.log('📊 [getActiveProductReservation] 쿼리 결과:', querySnapshot.size, '개 문서');
    
    if (querySnapshot.empty) {
      console.log('❌ [getActiveProductReservation] 쿼리 결과 없음');
      return null;
    }

    const docSnapshot = querySnapshot.docs[0];
    const data = docSnapshot.data();
    
    const reservation: ProductReservation = {
      id: docSnapshot.id,
      productId: data.productId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      reservedAt: data.reservedAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
      status: data.status
    };

    // 만료 시간 확인
    if (reservation.expiresAt < new Date()) {
      // 만료된 예약은 자동으로 취소 처리
      await updateDoc(doc(db, 'productReservations', docSnapshot.id), {
        status: 'expired',
        updatedAt: serverTimestamp()
      });
      return null;
    }

    return reservation;
  } catch (error) {
    console.error('활성 장바구니 점유 조회 오류:', error);
    return null;
  }
}

// 제품이 예약 가능한지 확인
export async function checkProductAvailability(
  productId: string,
  userId?: string
): Promise<{ available: boolean; reservedBy?: string; expiresAt?: Date }> {
  try {
    const reservation = await getActiveProductReservation(productId);
    
    if (!reservation) {
      return { available: true };
    }

    // 본인이 예약한 경우는 사용 가능
    if (userId && reservation.userId === userId) {
      return { available: true };
    }

    return { 
      available: false, 
      reservedBy: reservation.userName,
      expiresAt: reservation.expiresAt
    };
  } catch (error) {
    console.error('제품 사용 가능 여부 확인 오류:', error);
    return { available: true }; // 오류 시 사용 가능으로 처리
  }
}

// 사용자의 모든 활성 장바구니 점유 조회 (간단한 버전)
export async function getUserActiveReservations(
  userId: string
): Promise<ProductReservation[]> {
  try {
    const q = query(
      collection(db, 'productReservations'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('reservedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    const reservations: ProductReservation[] = [];

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const reservation: ProductReservation = {
        id: doc.id,
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        reservedAt: data.reservedAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
        status: data.status
      };

      // 시간 제한 없음 - 단순히 추가
      reservations.push(reservation);
    }

    return reservations;
  } catch (error) {
    console.error('사용자 장바구니 점유 조회 오류:', error);
    return [];
  }
}

// 여러 제품의 예약 상태 확인
export async function checkMultipleProductsReservation(
  productIds: string[]
): Promise<Record<string, ProductReservation | null>> {
  try {
    const result: Record<string, ProductReservation | null> = {};
    
    // 각 제품에 대해 예약 상태 확인
    const promises = productIds.map(async (productId) => {
      const reservation = await getActiveProductReservation(productId);
      return { productId, reservation };
    });

    const results = await Promise.all(promises);
    
    results.forEach(({ productId, reservation }) => {
      result[productId] = reservation;
    });

    return result;
  } catch (error) {
    console.error('다중 제품 예약 상태 확인 오류:', error);
    return {};
  }
}

// 제품 장바구니 점유 상태 실시간 구독 (간단한 버전)
export function subscribeToProductReservation(
  productId: string,
  callback: (reservation: ProductReservation | null) => void
): () => void {
  const q = query(
    collection(db, 'productReservations'),
    where('productId', '==', productId),
    where('status', '==', 'active'),
    orderBy('reservedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    if (querySnapshot.empty) {
      callback(null);
      return;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const reservation: ProductReservation = {
      id: doc.id,
      productId: data.productId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      reservedAt: data.reservedAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
      status: data.status
    };

    // 시간 제한 없음 - 단순히 active 상태면 점유됨
    callback(reservation);
  }, (error) => {
    console.error('장바구니 점유 상태 구독 오류:', error);
    callback(null);
  });
}

// 예약 완료 처리 (주문 완료 시)
export async function completeProductReservation(
  productId: string, 
  userId: string
): Promise<boolean> {
  try {
    const reservation = await getActiveProductReservation(productId);
    
    if (!reservation || reservation.userId !== userId) {
      return false;
    }

    await updateDoc(doc(db, 'productReservations', reservation.id), {
      status: 'completed',
      updatedAt: serverTimestamp()
    });

    console.log('상품 예약 완료 처리:', reservation.id);
    return true;
  } catch (error) {
    console.error('예약 완료 처리 오류:', error);
    return false;
  }
}

// 만료된 예약 정리 (정기적으로 실행하는 함수)
export async function cleanupExpiredReservations(): Promise<number> {
  try {
    const q = query(
      collection(db, 'productReservations'),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const now = new Date();
    let cleanedCount = 0;

    const cleanupPromises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const expiresAt = data.expiresAt?.toDate() || new Date(0);
      
      if (expiresAt <= now) {
        await updateDoc(doc.ref, {
          status: 'expired',
          updatedAt: serverTimestamp()
        });
        cleanedCount++;
      }
    });

    await Promise.all(cleanupPromises);
    
    if (cleanedCount > 0) {
      console.log(`만료된 예약 ${cleanedCount}개 정리 완료`);
    }

    return cleanedCount;
  } catch (error) {
    console.error('만료된 예약 정리 오류:', error);
    return 0;
  }
}

// 상품의 예약 상태를 간단히 확인하는 함수 (목록용)
export async function getProductReservationStatus(productId: string): Promise<{
  isReserved: boolean;
  reservedBy?: string;
  expiresAt?: Date;
  timeLeft?: string;
}> {
  try {
    console.log('🔍 [getProductReservationStatus] 상품 예약 상태 조회 시작:', productId);
    const reservation = await getActiveProductReservation(productId);
    console.log('📊 [getProductReservationStatus] 예약 데이터:', reservation);
    
    if (!reservation) {
      console.log('❌ [getProductReservationStatus] 예약 없음');
      return { isReserved: false };
    }

    // 남은 시간 계산
    const now = new Date();
    const timeLeft = reservation.expiresAt.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeLeftString = '';
    if (hoursLeft > 0) {
      timeLeftString = `${hoursLeft}시간 ${minutesLeft}분`;
    } else if (minutesLeft > 0) {
      timeLeftString = `${minutesLeft}분`;
    } else {
      timeLeftString = '곧 만료';
    }

    return {
      isReserved: true,
      reservedBy: reservation.userName,
      expiresAt: reservation.expiresAt,
      timeLeft: timeLeftString
    };
  } catch (error) {
    console.error('상품 예약 상태 확인 오류:', error);
    return { isReserved: false };
  }
}
