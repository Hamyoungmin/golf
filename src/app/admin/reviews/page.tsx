'use client';

import React, { useState } from 'react';
import { 
  StarIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function ReviewsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 더미 리뷰 데이터
  const reviews = [
    {
      id: 1,
      productName: '캘러웨이 로그 드라이버',
      customerName: '김**',
      rating: 5,
      title: '정말 만족스러운 구매입니다!',
      content: '상태가 생각보다 훨씬 좋았고, 배송도 빨랐습니다. 골프장에서 써보니 비거리도 늘어난 것 같아요.',
      status: 'approved',
      createdAt: '2024-01-15',
      hasImages: true,
      isReported: false,
      adminReply: null
    },
    {
      id: 2,
      productName: '타이틀리스트 917 우드',
      customerName: '박**',
      rating: 4,
      title: '괜찮은 상품이에요',
      content: '중고치고는 상태가 좋습니다. 다만 배송이 조금 늦었어요.',
      status: 'pending',
      createdAt: '2024-01-14',
      hasImages: false,
      isReported: false,
      adminReply: null
    },
    {
      id: 3,
      productName: '핑 ANSER2 퍼터',
      customerName: '이**',
      rating: 3,
      title: '보통입니다',
      content: '상품은 괜찮은데 생각보다 스크래치가 많네요.',
      status: 'approved',
      createdAt: '2024-01-13',
      hasImages: true,
      isReported: true,
      adminReply: '소중한 후기 감사합니다. 상품 상태에 대해 미리 안내드리지 못해 죄송합니다.'
    },
    {
      id: 4,
      productName: '젝시오 MP1200 드라이버',
      customerName: '최**',
      rating: 5,
      title: '최고의 클럽!',
      content: '가성비 최고! 새 제품과 다를 바 없네요. 강력 추천합니다.',
      status: 'rejected',
      createdAt: '2024-01-12',
      hasImages: false,
      isReported: false,
      adminReply: null
    }
  ];

  const statuses = [
    { value: 'all', label: '전체', count: reviews.length },
    { value: 'pending', label: '승인 대기', count: reviews.filter(r => r.status === 'pending').length },
    { value: 'approved', label: '승인됨', count: reviews.filter(r => r.status === 'approved').length },
    { value: 'rejected', label: '거부됨', count: reviews.filter(r => r.status === 'rejected').length },
    { value: 'reported', label: '신고됨', count: reviews.filter(r => r.isReported).length }
  ];

  const filteredReviews = reviews.filter(review => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'reported') return review.isReported;
    return review.status === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return '승인 대기';
      case 'approved': return '승인됨';
      case 'rejected': return '거부됨';
      default: return status;
    }
  };

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
          marginBottom: '30px',
          fontSize: '14px',
          color: '#666'
        }}>
          고객 리뷰를 관리하고 승인/거부 처리를 할 수 있습니다.
        </p>

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
          {statuses.map(status => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedStatus === status.value ? '#fff' : '#666',
                backgroundColor: selectedStatus === status.value ? '#007bff' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              {status.label}
              <span style={{
                padding: '2px 6px',
                borderRadius: '10px',
                backgroundColor: selectedStatus === status.value ? 'rgba(255,255,255,0.3)' : '#e0e0e0',
                fontSize: '12px'
              }}>
                {status.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 리뷰 목록 */}
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
                      backgroundColor: 
                        review.status === 'pending' ? '#fff3cd' : 
                        review.status === 'approved' ? '#e8f5e8' : 
                        review.status === 'rejected' ? '#fee' : '#f0f0f0',
                      color: 
                        review.status === 'pending' ? '#856404' : 
                        review.status === 'approved' ? '#2d7a2d' : 
                        review.status === 'rejected' ? '#c33' : '#666'
                    }}>
                      {getStatusText(review.status)}
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
                    <span style={{ fontSize: '12px', color: '#666' }}>{review.createdAt}</span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {review.productName}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>작성자: {review.customerName}</p>
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

                  {review.hasImages && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        fontSize: '14px', 
                        color: '#007bff'
                      }}>
                        🖼️ 이미지 첨부됨
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
                  {review.status === 'pending' && (
                    <>
                      <button style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#fff',
                        backgroundColor: '#28a745',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        ✓ 승인
                      </button>
                      <button style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#fff',
                        backgroundColor: '#dc3545',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        ✗ 거부
                      </button>
                    </>
                  )}
                  
                  {review.status === 'approved' && !review.adminReply && (
                    <button style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#fff',
                      backgroundColor: '#007bff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      💬 답글
                    </button>
                  )}

                  {review.isReported && (
                    <button style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#fff',
                      backgroundColor: '#fd7e14',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      신고 처리
                    </button>
                  )}

                  <button style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#fff',
                    backgroundColor: '#6c757d',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
