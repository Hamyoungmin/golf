'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

// 임시 FAQ 데이터
const sampleFAQs: FAQItem[] = [
  {
    id: 1,
    category: '주문/결제',
    question: '주문은 어떻게 하나요?',
    answer: `주문 방법은 다음과 같습니다:

1. 원하시는 상품을 선택하여 장바구니에 담습니다
2. 장바구니에서 주문할 상품을 확인합니다
3. 주문/결제 페이지에서 배송지 정보를 입력합니다
4. 결제 방법을 선택하고 결제를 완료합니다

로그인 후 주문하시면 더욱 편리합니다.`
  },
  {
    id: 2,
    category: '주문/결제',
    question: '결제 방법은 어떤 것들이 있나요?',
    answer: `다음과 같은 결제 방법을 제공합니다:

• 무통장 입금
• 신용카드 결제
• 카카오페이

무통장 입금의 경우 입금 확인 후 배송이 시작됩니다.`
  },
  {
    id: 3,
    category: '주문/결제',
    question: '주문 취소는 어떻게 하나요?',
    answer: `주문 취소는 다음과 같이 가능합니다:

• 결제 완료 전: 마이페이지에서 직접 취소 가능
• 결제 완료 후: 고객센터로 연락 필요
• 배송 시작 후: 취소 불가 (반품/교환으로 처리)

취소 요청은 가급적 빠른 시일 내에 해주세요.`
  },
  {
    id: 4,
    category: '배송',
    question: '배송비는 얼마인가요?',
    answer: `배송비는 다음과 같습니다:

• 3만원 이상 주문: 무료배송
• 3만원 미만 주문: 3,000원

제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.`
  },
  {
    id: 5,
    category: '배송',
    question: '배송기간은 얼마나 걸리나요?',
    answer: `일반적인 배송기간은 다음과 같습니다:

• 결제 완료 후 2-3일 내 배송 (영업일 기준)
• 무통장 입금의 경우 입금 확인 후 2-3일
• 주말 및 공휴일은 배송되지 않습니다

급하신 경우 고객센터로 연락주세요.`
  },
  {
    id: 6,
    category: '배송',
    question: '배송지 변경이 가능한가요?',
    answer: `배송지 변경은 다음과 같은 경우에 가능합니다:

• 배송 시작 전: 마이페이지에서 변경 가능
• 배송 시작 후: 택배사 직접 연락 필요

배송 시작 후에는 변경이 어려우니 주문 시 정확한 주소를 입력해주세요.`
  },
  {
    id: 7,
    category: '반품/교환',
    question: '반품이나 교환이 가능한가요?',
    answer: `반품/교환은 다음 조건에서 가능합니다:

• 상품 수령 후 7일 이내
• 상품의 포장, 라벨이 훼손되지 않은 경우
• 사용하지 않은 새 상품

단, 맞춤 제작 상품이나 개인 위생용품은 반품/교환이 불가합니다.`
  },
  {
    id: 8,
    category: '반품/교환',
    question: '반품 배송비는 누가 부담하나요?',
    answer: `반품 배송비 부담은 다음과 같습니다:

• 단순 변심: 고객 부담
• 상품 불량/오배송: 판매자 부담

반품 시 반품 배송비를 선불로 지불하신 후, 판매자 귀책사유인 경우 환불 시 함께 돌려드립니다.`
  },
  {
    id: 9,
    category: '회원',
    question: '회원가입은 어떻게 하나요?',
    answer: `회원가입 절차는 다음과 같습니다:

1. 회원가입 페이지에서 필수 정보를 입력합니다
2. 사업자등록증과 샵 사진을 업로드합니다
3. 이용약관 및 개인정보처리방침에 동의합니다
4. 가입 완료 후 승인까지 1-2일 소요됩니다

사업자 회원만 가입 가능합니다.`
  },
  {
    id: 10,
    category: '회원',
    question: '비밀번호를 잊었어요.',
    answer: `비밀번호 분실 시 다음과 같이 처리해주세요:

1. 로그인 페이지에서 "비밀번호 찾기"를 클릭합니다
2. 가입 시 등록한 이메일을 입력합니다
3. 이메일로 임시 비밀번호가 발송됩니다
4. 로그인 후 마이페이지에서 비밀번호를 변경하세요

이메일이 오지 않으면 스팸함도 확인해보세요.`
  },
  {
    id: 11,
    category: '상품',
    question: '상품 문의는 어떻게 하나요?',
    answer: `상품 문의는 다음과 같은 방법으로 가능합니다:

• 상품 상세 페이지에서 "가격 문의" 버튼 클릭
• 고객센터 전화 문의
• 이메일 문의

상품별 재고, 가격, 사양 등을 문의하실 수 있습니다.`
  },
  {
    id: 12,
    category: '기타',
    question: '영업시간은 언제인가요?',
    answer: `영업시간은 다음과 같습니다:

• 평일: 오전 9시 ~ 오후 6시
• 토요일: 오전 9시 ~ 오후 1시
• 일요일 및 공휴일: 휴무

고객센터도 동일한 시간에 운영됩니다.`
  }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 카테고리 목록
  const categories = ['전체', ...Array.from(new Set(sampleFAQs.map(faq => faq.category)))];

  // 필터링된 FAQ
  const filteredFAQs = sampleFAQs.filter(faq => {
    const categoryMatch = selectedCategory === '전체' || faq.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (openItems.length === filteredFAQs.length) {
      setOpenItems([]);
    } else {
      setOpenItems(filteredFAQs.map(faq => faq.id));
    }
  };

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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    ? 'bg-orange-500 text-white'
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
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
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
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded mr-3">
                        {faq.category}
                      </span>
                      <span className="text-orange-600 font-medium text-sm">Q.</span>
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
                  <div className="pl-8 border-l-2 border-orange-200">
                    <div className="flex items-start mb-2">
                      <span className="text-orange-600 font-medium text-sm mr-2">A.</span>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
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
