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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">리뷰 관리</h1>
        <p className="text-gray-600">고객 리뷰를 관리하고 승인/거부 처리를 할 수 있습니다.</p>
      </div>

      {/* 상태별 탭 */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  selectedStatus === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
                <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  {status.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                      {getStatusText(review.status)}
                    </span>
                    {review.isReported && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        <FlagIcon className="w-3 h-3 mr-1" />
                        신고됨
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{review.createdAt}</span>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{review.productName}</h3>
                    <p className="text-sm text-gray-600">작성자: {review.customerName}</p>
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="flex mr-2">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-600">({review.rating}/5)</span>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                    <p className="text-gray-700">{review.content}</p>
                  </div>

                  {review.hasImages && (
                    <div className="mb-3">
                      <span className="inline-flex items-center text-sm text-blue-600">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        이미지 첨부됨
                      </span>
                    </div>
                  )}

                  {review.adminReply && (
                    <div className="bg-gray-50 p-3 rounded-lg mt-3">
                      <div className="flex items-center mb-1">
                        <ChatBubbleLeftIcon className="w-4 h-4 mr-1 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">관리자 답글</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.adminReply}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {review.status === 'pending' && (
                    <>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                        <CheckIcon className="w-4 h-4 inline mr-1" />
                        승인
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                        <XMarkIcon className="w-4 h-4 inline mr-1" />
                        거부
                      </button>
                    </>
                  )}
                  
                  {review.status === 'approved' && !review.adminReply && (
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                      <ChatBubbleLeftIcon className="w-4 h-4 inline mr-1" />
                      답글
                    </button>
                  )}

                  {review.isReported && (
                    <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors">
                      신고 처리
                    </button>
                  )}

                  <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">리뷰가 없습니다</h3>
          <p className="text-gray-600">선택한 상태에 해당하는 리뷰가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
