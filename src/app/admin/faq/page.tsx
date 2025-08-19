'use client';

import React, { useState } from 'react';
import { 
  QuestionMarkCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function FAQPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 더미 FAQ 데이터
  const faqs = [
    {
      id: 1,
      category: '주문/결제',
      question: '주문 취소는 어떻게 하나요?',
      answer: '주문 완료 후 결제 전까지는 마이페이지에서 직접 취소 가능하며, 결제 완료 후에는 고객센터로 연락 주시기 바랍니다.',
      isVisible: true,
      order: 1,
      views: 1247
    },
    {
      id: 2,
      category: '배송',
      question: '배송비는 얼마인가요?',
      answer: '기본 배송비는 3,000원이며, 5만원 이상 구매 시 무료배송입니다. 제주도는 추가 3,000원, 도서산간은 추가 5,000원입니다.',
      isVisible: true,
      order: 2,
      views: 856
    },
    {
      id: 3,
      category: '상품',
      question: '중고 상품의 상태는 어떤가요?',
      answer: '모든 중고 상품은 전문가가 검수하여 상태를 확인한 후 판매하며, 상품별로 상세한 상태 정보를 제공합니다.',
      isVisible: true,
      order: 3,
      views: 432
    },
    {
      id: 4,
      category: '교환/환불',
      question: '교환이나 환불이 가능한가요?',
      answer: '상품 수령 후 7일 이내에 교환/환불 신청이 가능하며, 상품에 이상이 없어야 합니다.',
      isVisible: true,
      order: 4,
      views: 678
    },
    {
      id: 5,
      category: '회원',
      question: '회원가입 시 필요한 서류가 있나요?',
      answer: '사업자 회원가입 시 사업자등록증과 샵 내부/간판 사진이 필요합니다.',
      isVisible: false,
      order: 5,
      views: 234
    }
  ];

  const categories = ['all', '주문/결제', '배송', '상품', '교환/환불', '회원', '기타'];

  const filteredFAQs = faqs.filter(faq => 
    selectedCategory === 'all' || faq.category === selectedCategory
  );

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">FAQ 관리</h1>
            <p className="text-gray-600">자주 묻는 질문과 답변을 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 inline mr-2" />
            새 FAQ 추가
          </button>
        </div>
      </div>

      {/* FAQ 작성 폼 */}
      {showForm && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">새 FAQ 추가</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문
                </label>
                <input
                  type="text"
                  placeholder="자주 묻는 질문을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  답변
                </label>
                <textarea
                  rows={4}
                  placeholder="질문에 대한 답변을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    순서
                  </label>
                  <input
                    type="number"
                    defaultValue="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    <span className="text-sm text-gray-700">즉시 게시</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? '전체' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ 목록 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">FAQ 목록</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {faq.category}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    faq.isVisible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {faq.isVisible ? '게시중' : '비공개'}
                  </span>
                  <span className="text-xs text-gray-500">조회수: {faq.views}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronUpIcon className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  <button className="text-blue-600 hover:text-blue-900">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <QuestionMarkCircleIcon className="w-4 h-4 mr-2 text-blue-500" />
                  Q. {faq.question}
                </h4>
              </div>
              <div className="ml-6">
                <p className="text-sm text-gray-600">A. {faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
