'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  addFAQ,
  updateFAQ,
  deleteFAQ,
  incrementFAQViews,
  subscribeToFAQs,
  batchDeleteFAQs,
  batchUpdateFAQVisibility,
  updateFAQOrder,
  seedInitialFAQData,
  resetAllFAQViews,
  setFAQViews
} from '@/lib/faq';

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  isVisible: boolean;
  order: number;
  views: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FAQContextType {
  faqs: FAQItem[];
  loading: boolean;
  addFaq: (faq: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'> & { views?: number }) => Promise<void>;
  updateFaq: (id: string, faq: Partial<FAQItem>) => Promise<void>;
  deleteFaq: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
  moveFaq: (id: string, direction: 'up' | 'down') => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  batchDeleteFaqs: (ids: string[]) => Promise<void>;
  batchUpdateVisibility: (ids: string[], isVisible: boolean) => Promise<void>;
  resetAllViews: () => Promise<void>;
  setViews: (id: string, views: number) => Promise<void>;
}

const FAQContext = createContext<FAQContextType | undefined>(undefined);

export function FAQProvider({ children }: { children: ReactNode }) {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 실시간 구독 설정 및 초기 데이터 시드 (클라이언트 사이드에서만)
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const initializeFAQs = async () => {
      try {
        setLoading(true);
        
        // 초기 데이터 시드 (데이터가 없을 때만)
        await seedInitialFAQData();
        
        // 실시간 구독 설정
        unsubscribe = subscribeToFAQs((updatedFaqs) => {
          setFaqs(updatedFaqs);
          setLoading(false);
        });
      } catch (error) {
        console.error('FAQ 초기화 오류:', error);
        setLoading(false);
        // 에러 발생 시 빈 배열로 설정
        setFaqs([]);
      }
    };

    initializeFAQs();

    // 클린업 함수
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // FAQ 추가
  const handleAddFaq = async (newFaq: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'> & { views?: number }) => {
    try {
      await addFAQ(newFaq);
    } catch (error) {
      console.error('FAQ 추가 오류:', error);
      throw error;
    }
  };

  // FAQ 업데이트
  const handleUpdateFaq = async (id: string, updatedFaq: Partial<FAQItem>) => {
    try {
      await updateFAQ(id, updatedFaq);
    } catch (error) {
      console.error('FAQ 업데이트 오류:', error);
      throw error;
    }
  };

  // FAQ 삭제
  const handleDeleteFaq = async (id: string) => {
    try {
      await deleteFAQ(id);
    } catch (error) {
      console.error('FAQ 삭제 오류:', error);
      throw error;
    }
  };

  // 가시성 토글
  const handleToggleVisibility = async (id: string) => {
    try {
      const faq = faqs.find(f => f.id === id);
      if (faq) {
        await updateFAQ(id, { isVisible: !faq.isVisible });
      }
    } catch (error) {
      console.error('FAQ 가시성 토글 오류:', error);
      throw error;
    }
  };

  // FAQ 순서 이동
  const handleMoveFaq = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = faqs.findIndex(faq => faq.id === id);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= faqs.length) return;

      const currentFaq = faqs[currentIndex];
      const targetFaq = faqs[newIndex];

      // 순서 값 교체
      await Promise.all([
        updateFAQOrder(currentFaq.id, targetFaq.order),
        updateFAQOrder(targetFaq.id, currentFaq.order)
      ]);
    } catch (error) {
      console.error('FAQ 순서 이동 오류:', error);
      throw error;
    }
  };

  // 조회수 증가
  const handleIncrementViews = async (id: string) => {
    try {
      await incrementFAQViews(id);
    } catch (error) {
      console.error('조회수 증가 오류:', error);
      throw error;
    }
  };

  // 일괄 삭제
  const handleBatchDeleteFaqs = async (ids: string[]) => {
    try {
      await batchDeleteFAQs(ids);
    } catch (error) {
      console.error('일괄 삭제 오류:', error);
      throw error;
    }
  };

  // 일괄 가시성 업데이트
  const handleBatchUpdateVisibility = async (ids: string[], isVisible: boolean) => {
    try {
      await batchUpdateFAQVisibility(ids, isVisible);
    } catch (error) {
      console.error('일괄 가시성 업데이트 오류:', error);
      throw error;
    }
  };

  // 모든 조회수 초기화
  const handleResetAllViews = async () => {
    try {
      await resetAllFAQViews();
    } catch (error) {
      console.error('조회수 초기화 오류:', error);
      throw error;
    }
  };

  // 특정 FAQ 조회수 설정
  const handleSetViews = async (id: string, views: number) => {
    try {
      await setFAQViews(id, views);
    } catch (error) {
      console.error('조회수 설정 오류:', error);
      throw error;
    }
  };



  return (
    <FAQContext.Provider value={{
      faqs,
      loading,
      addFaq: handleAddFaq,
      updateFaq: handleUpdateFaq,
      deleteFaq: handleDeleteFaq,
      toggleVisibility: handleToggleVisibility,
      moveFaq: handleMoveFaq,
      incrementViews: handleIncrementViews,
      batchDeleteFaqs: handleBatchDeleteFaqs,
      batchUpdateVisibility: handleBatchUpdateVisibility,
      resetAllViews: handleResetAllViews,
      setViews: handleSetViews
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
