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
  serverTimestamp,
  Timestamp,
  writeBatch,
  onSnapshot,
  db
} from './firebase';
import { Review, ReviewStats } from '@/types';

// 모든 리뷰 가져오기 (관리자용)
export async function getAllReviews(): Promise<Review[]> {
  try {
    console.log('getAllReviews: 전체 리뷰 조회 시작');
    
    const reviewsQuery = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(reviewsQuery);
    console.log('getAllReviews: 전체 리뷰 개수:', querySnapshot.size);
    
    const reviews = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        adminReplyAt: data.adminReplyAt?.toDate(),
        reportedAt: data.reportedAt?.toDate(),
      } as Review;
    });

    console.log('getAllReviews: 조회된 리뷰:', reviews.length);
    return reviews;
  } catch (error) {
    console.error('전체 리뷰 목록 가져오기 오류:', error);
    return [];
  }
}

// 상품별 모든 리뷰 가져오기 (신고된 리뷰 제외, 고객용)
export async function getProductReviews(productId?: string): Promise<Review[]> {
  try {
    console.log('getProductReviews: 상품 리뷰 조회 시작, productId:', productId);
    
    let reviewsQuery;
    if (productId) {
      reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        where('isReported', '==', false), // 신고되지 않은 리뷰만
        orderBy('createdAt', 'desc')
      );
    } else {
      reviewsQuery = query(
        collection(db, 'reviews'),
        where('isReported', '==', false), // 신고되지 않은 리뷰만
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(reviewsQuery);
    console.log('getProductReviews: 리뷰 개수:', querySnapshot.size);
    
    const reviews = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        adminReplyAt: data.adminReplyAt?.toDate(),
      } as Review;
    });

    return reviews;
  } catch (error) {
    console.error('상품 리뷰 목록 가져오기 오류:', error);
    return [];
  }
}

// 승인된 리뷰만 가져오기 (기존 호환성을 위해 유지)
export async function getApprovedReviews(productId?: string): Promise<Review[]> {
  try {
    console.log('getApprovedReviews: 승인된 리뷰 조회 시작, productId:', productId);
    
    let reviewsQuery;
    if (productId) {
      reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    } else {
      reviewsQuery = query(
        collection(db, 'reviews'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(reviewsQuery);
    console.log('getApprovedReviews: 승인된 리뷰 개수:', querySnapshot.size);
    
    const reviews = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        adminReplyAt: data.adminReplyAt?.toDate(),
      } as Review;
    });

    return reviews;
  } catch (error) {
    console.error('승인된 리뷰 목록 가져오기 오류:', error);
    return [];
  }
}

// 특정 리뷰 가져오기
export async function getReview(id: string): Promise<Review | null> {
  try {
    const docRef = doc(db, 'reviews', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        adminReplyAt: data.adminReplyAt?.toDate(),
        reportedAt: data.reportedAt?.toDate(),
      } as Review;
    } else {
      return null;
    }
  } catch (error) {
    console.error('리뷰 가져오기 오류:', error);
    return null;
  }
}

// 새 리뷰 작성
export async function createReview(reviewData: {
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
}): Promise<string | null> {
  try {
    console.log('createReview: 리뷰 작성 시작', reviewData);
    
    const newReview = {
      ...reviewData,
      images: reviewData.images || [],
      status: 'approved', // 즉시 공개 상태
      isReported: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'reviews'), newReview);
    console.log('createReview: 리뷰 작성 완료, ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('리뷰 작성 오류:', error);
    return null;
  }
}

// 리뷰 승인
export async function approveReview(id: string, adminId: string): Promise<boolean> {
  try {
    console.log('approveReview: 리뷰 승인 시작, ID:', id);
    
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: adminId,
      updatedAt: serverTimestamp(),
    });
    
    console.log('approveReview: 리뷰 승인 완료');
    return true;
  } catch (error) {
    console.error('리뷰 승인 오류:', error);
    return false;
  }
}

// 리뷰 거부
export async function rejectReview(id: string, adminId: string, reason?: string): Promise<boolean> {
  try {
    console.log('rejectReview: 리뷰 거부 시작, ID:', id);
    
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectedBy: adminId,
      rejectionReason: reason || '',
      updatedAt: serverTimestamp(),
    });
    
    console.log('rejectReview: 리뷰 거부 완료');
    return true;
  } catch (error) {
    console.error('리뷰 거부 오류:', error);
    return false;
  }
}

// 관리자 답글 작성
export async function addAdminReply(id: string, reply: string, adminId: string): Promise<boolean> {
  try {
    console.log('addAdminReply: 관리자 답글 작성 시작, ID:', id);
    
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, {
      adminReply: reply,
      adminReplyAt: serverTimestamp(),
      repliedBy: adminId,
      updatedAt: serverTimestamp(),
    });
    
    console.log('addAdminReply: 관리자 답글 작성 완료');
    return true;
  } catch (error) {
    console.error('관리자 답글 작성 오류:', error);
    return false;
  }
}

// 리뷰 신고
export async function reportReview(id: string, reason: string, reportedBy: string): Promise<boolean> {
  try {
    console.log('reportReview: 리뷰 신고 시작, ID:', id);
    
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, {
      isReported: true,
      reportReason: reason,
      reportedAt: serverTimestamp(),
      reportedBy: reportedBy,
      updatedAt: serverTimestamp(),
    });
    
    console.log('reportReview: 리뷰 신고 완료');
    return true;
  } catch (error) {
    console.error('리뷰 신고 오류:', error);
    return false;
  }
}

// 신고 처리 (신고 해제)
export async function resolveReport(id: string, adminId: string): Promise<boolean> {
  try {
    console.log('resolveReport: 신고 처리 시작, ID:', id);
    
    const docRef = doc(db, 'reviews', id);
    await updateDoc(docRef, {
      isReported: false,
      reportReason: '',
      reportedAt: null,
      reportedBy: '',
      updatedAt: serverTimestamp(),
    });
    
    console.log('resolveReport: 신고 처리 완료');
    return true;
  } catch (error) {
    console.error('신고 처리 오류:', error);
    return false;
  }
}

// 리뷰 삭제
export async function deleteReview(id: string): Promise<boolean> {
  try {
    console.log('deleteReview: 리뷰 삭제 시작, ID:', id);
    
    const docRef = doc(db, 'reviews', id);
    await deleteDoc(docRef);
    
    console.log('deleteReview: 리뷰 삭제 완료');
    return true;
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return false;
  }
}

// 리뷰 통계 계산
export async function getReviewStats(): Promise<ReviewStats> {
  try {
    console.log('getReviewStats: 리뷰 통계 계산 시작');
    
    const reviews = await getAllReviews();
    
    const stats: ReviewStats = {
      totalReviews: reviews.length,
      pendingReviews: reviews.filter(r => r.status === 'pending').length,
      approvedReviews: reviews.filter(r => r.status === 'approved').length,
      rejectedReviews: reviews.filter(r => r.status === 'rejected').length,
      reportedReviews: reviews.filter(r => r.isReported).length,
      averageRating: reviews.length > 0 
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0
    };
    
    console.log('getReviewStats: 리뷰 통계:', stats);
    return stats;
  } catch (error) {
    console.error('리뷰 통계 계산 오류:', error);
    return {
      totalReviews: 0,
      pendingReviews: 0,
      approvedReviews: 0,
      rejectedReviews: 0,
      reportedReviews: 0,
      averageRating: 0
    };
  }
}

// 상품별 리뷰 통계 계산
export async function getProductReviewStats(productId: string): Promise<{
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
}> {
  try {
    console.log('getProductReviewStats: 상품별 리뷰 통계 계산 시작, productId:', productId);
    
    const reviews = await getProductReviews(productId);
    
    const ratingDistribution: { [key: number]: number } = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });
    
    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0,
      ratingDistribution
    };
    
    console.log('getProductReviewStats: 상품별 리뷰 통계:', stats);
    return stats;
  } catch (error) {
    console.error('상품별 리뷰 통계 계산 오류:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
}

// 리뷰 시스템 초기화 (실제 데이터만 사용)
export async function initializeReviews(): Promise<void> {
  // 샘플 데이터를 생성하지 않음 - 실제 사용자 리뷰만 사용
  console.log('리뷰 시스템 초기화 완료 - 실제 데이터만 사용');
}

// 실시간 리뷰 리스너 (관리자용)
export function subscribeToAllReviews(callback: (reviews: Review[]) => void): () => void {
  const reviewsQuery = query(
    collection(db, 'reviews'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(reviewsQuery, (querySnapshot) => {
    const reviews = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        adminReplyAt: data.adminReplyAt?.toDate(),
        reportedAt: data.reportedAt?.toDate(),
      } as Review;
    });
    
    console.log('실시간 리뷰 업데이트:', reviews.length, '개');
    callback(reviews);
  }, (error) => {
    console.error('실시간 리뷰 리스너 오류:', error);
  });
}

// 실시간 상품별 리뷰 리스너 (고객용)
export function subscribeToProductReviews(productId: string, callback: (reviews: Review[]) => void): () => void {
  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('productId', '==', productId),
    where('isReported', '==', false), // 신고되지 않은 리뷰만
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(reviewsQuery, (querySnapshot) => {
    const reviews = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
        adminReplyAt: data.adminReplyAt?.toDate(),
      } as Review;
    });
    
    console.log('실시간 상품 리뷰 업데이트:', productId, reviews.length, '개');
    callback(reviews);
  }, (error) => {
    console.error('실시간 상품 리뷰 리스너 오류:', error);
  });
}

// 실시간 리뷰 통계 리스너 (관리자용)
export function subscribeToReviewStats(callback: (stats: ReviewStats) => void): () => void {
  return subscribeToAllReviews((reviews) => {
    const stats: ReviewStats = {
      totalReviews: reviews.length,
      pendingReviews: reviews.filter(r => r.status === 'pending').length,
      approvedReviews: reviews.filter(r => r.status === 'approved').length,
      rejectedReviews: reviews.filter(r => r.status === 'rejected').length,
      reportedReviews: reviews.filter(r => r.isReported).length,
      averageRating: reviews.length > 0 
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : 0
    };
    
    console.log('실시간 리뷰 통계 업데이트:', stats);
    callback(stats);
  });
}

// Additional functions for compatibility
export async function addReview(reviewData: any): Promise<void> {
  try {
    await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: new Date(),
      status: 'approved' // 즉시 승인 상태로 변경
    });
  } catch (error) {
    console.error('리뷰 추가 오류:', error);
    throw error;
  }
}


