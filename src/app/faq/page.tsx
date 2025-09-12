'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFAQ } from '@/contexts/FAQContext';

export default function FAQPage() {
  const { faqs, loading, incrementViews } = useFAQ();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 공개된 FAQ만 필터링
  const visibleFaqs = faqs.filter(faq => faq.isVisible);

  // 카테고리 목록
  const categories = ['전체', ...Array.from(new Set(visibleFaqs.map(faq => faq.category)))];

  // 필터링된 FAQ
  const filteredFAQs = visibleFaqs.filter(faq => {
    const categoryMatch = selectedCategory === '전체' || faq.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const toggleItem = async (id: string) => {
    setOpenItems(prev => {
      const isCurrentlyOpen = prev.includes(id);
      if (!isCurrentlyOpen) {
        // FAQ를 열 때만 조회수 증가
        incrementViews(id).catch(error => {
          console.error('조회수 증가 오류:', error);
        });
        return [...prev, id];
      } else {
        return prev.filter(item => item !== id);
      }
    });
  };

  const toggleAll = () => {
    if (openItems.length === filteredFAQs.length) {
      setOpenItems([]);
    } else {
      setOpenItems(filteredFAQs.map(faq => faq.id));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">FAQ를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">자주 묻는 질문</h1>
        <p className="text-gray-600">고객님들이 자주 묻는 질문들을 모았습니다.</p>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 검색바 */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="질문을 검색해보세요..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-2.5 text-gray-400">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 전체 열기/닫기 */}
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={toggleAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {openItems.length === filteredFAQs.length ? '전체 닫기' : '전체 열기'}
          </button>
        </div>
      </div>

      {/* FAQ 목록 */}
      {filteredFAQs.length === 0 ? (
        <div className="bg-white border rounded-lg p-16 text-center">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-6">다른 검색어를 입력하거나 카테고리를 변경해보세요.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('전체');
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            전체 FAQ 보기
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg">
          {filteredFAQs.map((faq, index) => (
            <div key={faq.id} className={`${index > 0 ? 'border-t' : ''}`}>
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded mr-3">
                        {faq.category}
                      </span>
                      <span className="text-blue-600 font-medium text-sm">Q.</span>
                    </div>
                    <h3 className="font-medium text-lg text-gray-900">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="ml-4">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      className={`text-gray-400 transition-transform ${openItems.includes(faq.id) ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </button>
              
              {openItems.includes(faq.id) && (
                <div className="px-6 pb-4">
                  <div className="pl-8 border-l-2 border-blue-200">
                    <div className="flex items-start mb-2">
                      <span className="text-blue-600 font-medium text-sm mr-2">A.</span>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                    {faq.imageUrl && (
                      <div className="mt-4">
                        <Image 
                          src={faq.imageUrl} 
                          alt="FAQ 이미지" 
                          width={600}
                          height={300}
                          className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 추가 도움말 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">찾으시는 답변이 없나요?</h3>
        <p className="text-blue-700 mb-4">
          더 자세한 문의사항이나 개별 상담이 필요하시면 고객센터로 연락해주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/contact"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            문의하기
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-center"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
