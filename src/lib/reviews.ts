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

// 승인된 리뷰만 가져오기 (고객용)
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
      status: 'pending', // 기본적으로 승인 대기 상태
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
    
    const reviews = await getApprovedReviews(productId);
    
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

// 초기 더미 리뷰 데이터 생성 (개발/테스트용)
export async function initializeReviews(): Promise<void> {
  try {
    console.log('initializeReviews: 초기 리뷰 데이터 확인 시작');
    
    const reviews = await getAllReviews();
    if (reviews.length > 0) {
      console.log('initializeReviews: 이미 리뷰 데이터가 존재함, 스킵');
      return;
    }
    
    console.log('initializeReviews: 초기 리뷰 데이터 생성 시작');
    
    const dummyReviews = [
      {
        productId: 'product-1',
        productName: '캘러웨이 로그 드라이버',
        userId: 'user-1',
        userName: '김**',
        rating: 5,
        title: '정말 만족스러운 구매입니다!',
        content: '상태가 생각보다 훨씬 좋았고, 배송도 빨랐습니다. 골프장에서 써보니 비거리도 늘어난 것 같아요.',
        images: [],
        status: 'approved' as const,
        isReported: false,
        approvedAt: new Date(),
        approvedBy: 'admin-1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        productId: 'product-2',
        productName: '타이틀리스트 917 우드',
        userId: 'user-2',
        userName: '박**',
        rating: 4,
        title: '괜찮은 상품이에요',
        content: '중고치고는 상태가 좋습니다. 다만 배송이 조금 늦었어요.',
        images: [],
        status: 'pending' as const,
        isReported: false,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
      },
      {
        productId: 'product-3',
        productName: '핑 ANSER2 퍼터',
        userId: 'user-3',
        userName: '이**',
        rating: 3,
        title: '보통입니다',
        content: '상품은 괜찮은데 생각보다 스크래치가 많네요.',
        images: [],
        status: 'approved' as const,
        isReported: true,
        reportReason: '부적절한 내용',
        reportedAt: new Date(),
        reportedBy: 'user-4',
        adminReply: '소중한 후기 감사합니다. 상품 상태에 대해 미리 안내드리지 못해 죄송합니다.',
        adminReplyAt: new Date(),
        repliedBy: 'admin-1',
        approvedAt: new Date(),
        approvedBy: 'admin-1',
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13'),
      }
    ];
    
    const batch = writeBatch(db);
    dummyReviews.forEach((review) => {
      const docRef = doc(collection(db, 'reviews'));
      batch.set(docRef, {
        ...review,
        createdAt: Timestamp.fromDate(review.createdAt),
        updatedAt: Timestamp.fromDate(review.updatedAt),
        approvedAt: review.approvedAt ? Timestamp.fromDate(review.approvedAt) : undefined,
        adminReplyAt: review.adminReplyAt ? Timestamp.fromDate(review.adminReplyAt) : undefined,
        reportedAt: review.reportedAt ? Timestamp.fromDate(review.reportedAt) : undefined,
      });
    });
    
    await batch.commit();
    console.log('initializeReviews: 초기 리뷰 데이터 생성 완료');
  } catch (error) {
    console.error('초기 리뷰 데이터 생성 오류:', error);
  }
}
