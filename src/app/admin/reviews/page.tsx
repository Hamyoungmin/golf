'use client';

import React, { useState, useEffect, useCallback } from 'react';
// 사용하지 않는 아이콘들 제거
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Review, ReviewStats } from '@/types';
import { 
  getAllReviews, 
  addAdminReply,
  resolveReport,
  deleteReview,
  getReviewStats,
} from '@/lib/reviews';
import { useAuth } from '@/contexts/AuthContext';
import CustomAlert from '@/components/CustomAlert';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    reportedReviews: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 알림창 상태
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: '확인',
    cancelText: '취소'
  });

  // 알림창 헬퍼 함수들
  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm',
    message: string,
    title?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setAlert({
      isOpen: true,
      type,
      title: title || '',
      message,
      onConfirm: onConfirm || closeAlert,
      onCancel: onCancel || closeAlert,
      confirmText: type === 'confirm' ? '확인' : '확인',
      cancelText: '취소'
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };



  // 데이터 로드
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
              // 실제 사용자 리뷰만 사용
      
      // 리뷰 목록 로드
      const allReviews = await getAllReviews();
      setReviews(allReviews);
      
      // 리뷰 통계 로드
      const stats = await getReviewStats();
      setReviewStats(stats);
      
      console.log('리뷰 관리 페이지: 로드 완료', allReviews.length, '개');
    } catch (error) {
      console.error('리뷰 데이터 로드 오류:', error);
      showAlert('error', '리뷰 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);



  // 답글 작성
  const handleReplyReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setReplyText('');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!user?.uid) {
      showAlert('error', '관리자 권한이 필요합니다.');
      return;
    }

    if (!replyText.trim()) {
      showAlert('warning', '답글 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const success = await addAdminReply(selectedReviewId, replyText.trim(), user.uid);
      if (success) {
        // 즉시 로컬 상태에서 답글 업데이트
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === selectedReviewId 
              ? { 
                  ...review, 
                  adminReply: replyText.trim(),
                  adminReplyAt: new Date(),
                  repliedBy: user.uid
                }
              : review
          )
        );
        
        // 모달 닫기 및 상태 초기화
        setShowReplyModal(false);
        setReplyText('');
        
        showAlert('success', '답글이 등록되었습니다.');
      } else {
        showAlert('error', '답글 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('답글 등록 오류:', error);
      showAlert('error', '답글 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 신고 처리
  const handleResolveReport = async (reviewId: string) => {
    if (!user?.uid) {
      showAlert('error', '관리자 권한이 필요합니다.');
      return;
    }

    showAlert('confirm', '이 신고를 해제하시겠습니까?', '신고 처리', async () => {
      try {
        const success = await resolveReport(reviewId, user.uid);
        if (success) {
          // 즉시 로컬 상태에서 신고 상태 해제
          setReviews(prevReviews => 
            prevReviews.map(review => 
              review.id === reviewId 
                ? { ...review, isReported: false, reportCount: 0 }
                : review
            )
          );
          
          // 통계에서 신고된 리뷰 수 감소
          setReviewStats(prevStats => ({
            ...prevStats,
            reportedReviews: Math.max(0, prevStats.reportedReviews - 1)
          }));
          
          showAlert('success', '신고가 해제되었습니다.');
        } else {
          showAlert('error', '신고 해제에 실패했습니다.');
        }
      } catch (error) {
        console.error('신고 해제 오류:', error);
        showAlert('error', '신고 해제 중 오류가 발생했습니다.');
      }
      closeAlert();
    }, closeAlert);
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId: string, title: string) => {
    showAlert('confirm', `"${title}" 리뷰를 삭제하시겠습니까?\n삭제된 리뷰는 복구할 수 없습니다.`, '리뷰 삭제', async () => {
      try {
        const success = await deleteReview(reviewId);
        if (success) {
          // 즉시 로컬 상태에서 삭제된 리뷰 제거
          setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
          
          // 통계도 즉시 업데이트
          setReviewStats(prevStats => ({
            ...prevStats,
            totalReviews: prevStats.totalReviews - 1,
            // 삭제된 리뷰의 상태에 따라 해당 카운트 감소
            approvedReviews: prevStats.approvedReviews - (reviews.find(r => r.id === reviewId)?.status === 'approved' ? 1 : 0),
            pendingReviews: prevStats.pendingReviews - (reviews.find(r => r.id === reviewId)?.status === 'pending' ? 1 : 0),
            rejectedReviews: prevStats.rejectedReviews - (reviews.find(r => r.id === reviewId)?.status === 'rejected' ? 1 : 0),
            reportedReviews: prevStats.reportedReviews - (reviews.find(r => r.id === reviewId)?.isReported ? 1 : 0)
          }));
          
          showAlert('success', '리뷰가 삭제되었습니다.');
        } else {
          showAlert('error', '리뷰 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('리뷰 삭제 오류:', error);
        showAlert('error', '리뷰 삭제 중 오류가 발생했습니다.');
      }
      closeAlert();
    }, closeAlert);
  };

  const filterOptions = [
    { value: 'all', label: '전체', count: reviewStats.totalReviews },
    { value: 'with-reply', label: '답글 있음', count: reviews.filter(r => r.adminReply).length },
    { value: 'no-reply', label: '답글 없음', count: reviews.filter(r => !r.adminReply).length },
    { value: 'reported', label: '신고됨', count: reviewStats.reportedReviews }
  ];

  const filteredReviews = reviews.filter(review => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'reported') return review.isReported;
    if (selectedFilter === 'with-reply') return !!review.adminReply;
    if (selectedFilter === 'no-reply') return !review.adminReply;
    return true;
  });



  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIconSolid
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          리뷰 관리
        </h1>
        <p style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#666'
        }}>
          고객 리뷰에 답글을 작성하고 신고된 리뷰를 관리할 수 있습니다.
        </p>



        {/* 리뷰 통계 */}
        {!loading && reviewStats.totalReviews > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {reviewStats.averageRating.toFixed(1)}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>평균 평점</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {reviewStats.totalReviews}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>총 리뷰</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {reviews.filter(r => !r.adminReply).length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>답글 없음</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {reviewStats.reportedReviews}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>신고됨</div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            fontSize: '16px',
            color: '#666'
          }}>
            ⭐ 리뷰 데이터를 불러오는 중...
      </div>
        )}

      {/* 상태별 탭 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          리뷰 상태별 필터
        </h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px'
        }}>
            {filterOptions.map(status => (
              <button
                key={status.value}
                onClick={() => setSelectedFilter(status.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedFilter === status.value ? '#fff' : '#666',
                backgroundColor: selectedFilter === status.value ? '#007bff' : '#f9f9f9',
                cursor: 'pointer'
              }}
              >
                {status.label}
              <span style={{
                padding: '2px 6px',
                borderRadius: '10px',
                backgroundColor: selectedFilter === status.value ? 'rgba(255,255,255,0.3)' : '#e0e0e0',
                fontSize: '12px'
              }}>
                  {status.count}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* 리뷰 목록 */}
      {!loading && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            리뷰 목록 ({filteredReviews.length}개)
          </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredReviews.map((review) => (
            <div key={review.id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: '#fff',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '12px',
                      backgroundColor: review.adminReply ? '#e8f5e8' : '#fff3cd',
                      color: review.adminReply ? '#2d7a2d' : '#856404'
                    }}>
                      {review.adminReply ? '답글 완료' : '답글 없음'}
                    </span>
                    {review.isReported && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: '#fee',
                        color: '#c33',
                        borderRadius: '12px'
                      }}>
                        🚩 신고됨
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {review.createdAt.toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {review.productName}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>작성자: {review.userName}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', marginRight: '8px' }}>
                      {renderStars(review.rating)}
                    </div>
                    <span style={{ fontSize: '14px', color: '#666' }}>({review.rating}/5)</span>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ fontWeight: '500', marginBottom: '4px', fontSize: '14px' }}>
                      {review.title}
                    </h4>
                    <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                      {review.content}
                    </p>
                  </div>

                  {review.images && review.images.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        fontSize: '14px', 
                        color: '#007bff'
                      }}>
                        🖼️ 이미지 {review.images.length}개 첨부됨
                      </span>
                    </div>
                  )}

                  {review.adminReply && (
                    <div style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '12px', 
                      borderRadius: '4px', 
                      marginTop: '12px' 
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '4px' 
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#666' }}>
                          💬 관리자 답글
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                        {review.adminReply}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  marginLeft: '15px' 
                }}>
                  {!review.adminReply ? (
                    <button 
                      onClick={() => handleReplyReview(review.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#fff',
                        backgroundColor: '#007bff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      💬 답글
                      </button>
                  ) : (
                    <span style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#28a745',
                      fontWeight: '500'
                    }}>
                      답글 작성 완료
                    </span>
                  )}

                  {review.isReported && (
                    <button 
                      onClick={() => handleResolveReport(review.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#fff',
                        backgroundColor: '#fd7e14',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      신고 처리
                    </button>
                  )}

                  <button 
                    onClick={() => handleDeleteReview(review.id, review.title)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#fff',
                      backgroundColor: '#6c757d',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑 삭제
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div style={{ 
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⭐</div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            리뷰가 없습니다
          </h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            선택한 상태에 해당하는 리뷰가 없습니다.
          </p>
        </div>
      )}
        </div>
      )}

      {/* 답글 작성 모달 */}
      {showReplyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              관리자 답글 작성
            </h3>
            
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="고객 리뷰에 대한 답글을 작성해주세요"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '20px'
              }}
            />
            
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={() => setShowReplyModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: submitting ? '#6c757d' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? '등록 중...' : '답글 등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 커스텀 알림창 */}
      <CustomAlert
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={alert.type === 'confirm' ? alert.onCancel : undefined}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
      />
      </div>
    </div>
  );
}
