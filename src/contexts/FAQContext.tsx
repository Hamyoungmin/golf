'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  isVisible: boolean;
  order: number;
  views: number;
  imageUrl?: string | null;
}

interface FAQContextType {
  faqs: FAQItem[];
  addFaq: (faq: Omit<FAQItem, 'id' | 'views'>) => void;
  updateFaq: (id: number, faq: Partial<FAQItem>) => void;
  deleteFaq: (id: number) => void;
  toggleVisibility: (id: number) => void;
  moveFaq: (id: number, direction: 'up' | 'down') => void;
  incrementViews: (id: number) => void;
}

const FAQContext = createContext<FAQContextType | undefined>(undefined);

// 초기 FAQ 데이터
const initialFaqs: FAQItem[] = [
  {
    id: 1,
    category: '주문/결제',
    question: '주문은 어떻게 하나요?',
    answer: `주문 방법은 다음과 같습니다:

1. 원하시는 상품을 선택하여 장바구니에 담습니다
2. 장바구니에서 주문할 상품을 확인합니다
3. 주문/결제 페이지에서 배송지 정보를 입력합니다
4. 결제 방법을 선택하고 결제를 완료합니다

로그인 후 주문하시면 더욱 편리합니다.`,
    isVisible: true,
    order: 1,
    views: 1247
  },
  {
    id: 2,
    category: '주문/결제',
    question: '결제 방법은 어떤 것들이 있나요?',
    answer: `다음과 같은 결제 방법을 제공합니다:

• 무통장 입금
• 신용카드 결제
• 카카오페이

무통장 입금의 경우 입금 확인 후 배송이 시작됩니다.`,
    isVisible: true,
    order: 2,
    views: 856
  },
  {
    id: 3,
    category: '주문/결제',
    question: '주문 취소는 어떻게 하나요?',
    answer: `주문 취소는 다음과 같이 가능합니다:

• 결제 완료 전: 마이페이지에서 직접 취소 가능
• 결제 완료 후: 고객센터로 연락 필요
• 배송 시작 후: 취소 불가 (반품/교환으로 처리)

취소 요청은 가급적 빠른 시일 내에 해주세요.`,
    isVisible: true,
    order: 3,
    views: 432
  },
  {
    id: 4,
    category: '배송',
    question: '배송비는 얼마인가요?',
    answer: `배송비는 다음과 같습니다:

• 3만원 이상 주문: 무료배송
• 3만원 미만 주문: 3,000원

제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.`,
    isVisible: true,
    order: 4,
    views: 678
  },
  {
    id: 5,
    category: '배송',
    question: '배송기간은 얼마나 걸리나요?',
    answer: `일반적인 배송기간은 다음과 같습니다:

• 결제 완료 후 2-3일 내 배송 (영업일 기준)
• 무통장 입금의 경우 입금 확인 후 2-3일
• 주말 및 공휴일은 배송되지 않습니다

급하신 경우 고객센터로 연락주세요.`,
    isVisible: true,
    order: 5,
    views: 234
  },
  {
    id: 6,
    category: '배송',
    question: '배송지 변경이 가능한가요?',
    answer: `배송지 변경은 다음과 같은 경우에 가능합니다:

• 배송 시작 전: 마이페이지에서 변경 가능
• 배송 시작 후: 택배사 직접 연락 필요

배송 시작 후에는 변경이 어려우니 주문 시 정확한 주소를 입력해주세요.`,
    isVisible: true,
    order: 6,
    views: 189
  },
  {
    id: 7,
    category: '반품/교환',
    question: '반품이나 교환이 가능한가요?',
    answer: `반품/교환은 다음 조건에서 가능합니다:

• 상품 수령 후 7일 이내
• 상품의 포장, 라벨이 훼손되지 않은 경우
• 사용하지 않은 새 상품

단, 맞춤 제작 상품이나 개인 위생용품은 반품/교환이 불가합니다.`,
    isVisible: true,
    order: 7,
    views: 156
  },
  {
    id: 8,
    category: '반품/교환',
    question: '반품 배송비는 누가 부담하나요?',
    answer: `반품 배송비 부담은 다음과 같습니다:

• 단순 변심: 고객 부담
• 상품 불량/오배송: 판매자 부담

반품 시 반품 배송비를 선불로 지불하신 후, 판매자 귀책사유인 경우 환불 시 함께 돌려드립니다.`,
    isVisible: true,
    order: 8,
    views: 98
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

사업자 회원만 가입 가능합니다.`,
    isVisible: true,
    order: 9,
    views: 134
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

이메일이 오지 않으면 스팸함도 확인해보세요.`,
    isVisible: false,
    order: 10,
    views: 67
  },
  {
    id: 11,
    category: '상품',
    question: '상품 문의는 어떻게 하나요?',
    answer: `상품 문의는 다음과 같은 방법으로 가능합니다:

• 상품 상세 페이지에서 "가격 문의" 버튼 클릭
• 고객센터 전화 문의
• 이메일 문의

상품별 재고, 가격, 사양 등을 문의하실 수 있습니다.`,
    isVisible: true,
    order: 11,
    views: 245,
    imageUrl: 'https://via.placeholder.com/400x200/f0f0f0/666?text=상품+문의+방법'
  },
  {
    id: 12,
    category: '기타',
    question: '영업시간은 언제인가요?',
    answer: `영업시간은 다음과 같습니다:

• 평일: 오전 9시 ~ 오후 6시
• 토요일: 오전 9시 ~ 오후 1시
• 일요일 및 공휴일: 휴무

고객센터도 동일한 시간에 운영됩니다.`,
    isVisible: true,
    order: 12,
    views: 178
  },
  {
    id: 13,
    category: '기능',
    question: '가격 문의 기능은 어떻게 사용하나요?',
    answer: `가격 문의 기능 사용 방법:

1. 원하는 상품의 상세 페이지로 이동합니다
2. "가격 문의" 버튼을 클릭합니다
3. 문의 내용을 작성하여 전송합니다
4. 업체에서 등록하신 이메일로 답변을 보내드립니다

대량 구매나 특별 할인에 대해서도 문의 가능합니다.`,
    isVisible: true,
    order: 13,
    views: 89,
    imageUrl: 'https://via.placeholder.com/400x200/e8f4fd/0c5460?text=가격+문의+버튼+위치'
  },
  {
    id: 14,
    category: '기능',
    question: '찜하기 기능은 어떻게 사용하나요?',
    answer: `찜하기 기능 사용 방법:

• 관심 상품의 하트 아이콘(♡)을 클릭하면 찜 목록에 추가됩니다
• 마이페이지 > 찜 목록에서 저장된 상품들을 확인할 수 있습니다
• 찜한 상품은 가격 변동이나 재입고 시 알림을 받을 수 있습니다

로그인 후 이용 가능합니다.`,
    isVisible: true,
    order: 14,
    views: 123
  },
  {
    id: 15,
    category: '시스템',
    question: '사이트 접속이 안 될 때는 어떻게 하나요?',
    answer: `접속 문제 해결 방법:

1. 브라우저 새로고침 (Ctrl+F5)
2. 브라우저 캐시 및 쿠키 삭제
3. 다른 브라우저로 접속 시도
4. 인터넷 연결 상태 확인

위 방법으로도 해결되지 않으면 고객센터로 연락주세요.`,
    isVisible: true,
    order: 15,
    views: 45
  },
  {
    id: 16,
    category: '시스템',
    question: '로그인이 안 될 때는 어떻게 하나요?',
    answer: `로그인 문제 해결 방법:

• 이메일과 비밀번호를 정확히 입력했는지 확인
• 대소문자 구분에 주의
• Caps Lock이 켜져있는지 확인
• "비밀번호 찾기"를 통한 재설정

계속 문제가 발생하면 고객센터로 문의해주세요.`,
    isVisible: true,
    order: 16,
    views: 78
  }
];

export function FAQProvider({ children }: { children: ReactNode }) {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);

  const addFaq = (newFaq: Omit<FAQItem, 'id' | 'views'>) => {
    const maxId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) : 0;
    const faq: FAQItem = {
      ...newFaq,
      id: maxId + 1,
      views: 0
    };
    setFaqs(prev => [...prev, faq]);
  };

  const updateFaq = (id: number, updatedFaq: Partial<FAQItem>) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, ...updatedFaq } : faq
    ));
  };

  const deleteFaq = (id: number) => {
    setFaqs(prev => prev.filter(faq => faq.id !== id));
  };

  const toggleVisibility = (id: number) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, isVisible: !faq.isVisible } : faq
    ));
  };

  const moveFaq = (id: number, direction: 'up' | 'down') => {
    setFaqs(prev => {
      const currentIndex = prev.findIndex(faq => faq.id === id);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newFaqs = [...prev];
      [newFaqs[currentIndex], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[currentIndex]];
      return newFaqs;
    });
  };

  const incrementViews = (id: number) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, views: faq.views + 1 } : faq
    ));
  };

  return (
    <FAQContext.Provider value={{
      faqs,
      addFaq,
      updateFaq,
      deleteFaq,
      toggleVisibility,
      moveFaq,
      incrementViews
    }}>
      {children}
    </FAQContext.Provider>
  );
}

export function useFAQ() {
  const context = useContext(FAQContext);
  if (context === undefined) {
    throw new Error('useFAQ must be used within a FAQProvider');
  }
  return context;
}
