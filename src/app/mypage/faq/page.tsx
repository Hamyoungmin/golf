'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFAQ } from '@/contexts/FAQContext';

export default function MyPageFAQPage() {
  const { faqs, incrementViews } = useFAQ();
  
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

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const isCurrentlyOpen = prev.includes(id);
      if (!isCurrentlyOpen) {
        // FAQ를 열 때만 조회수 증가
        incrementViews(id);
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
      setOpenItems(filteredFAQs.map(faq => String(faq.id)));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        {/* 헤더 - 기존 마이페이지 스타일과 일관성 유지 */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Link 
              href="/mypage" 
              style={{ 
                textDecoration: 'none', 
                color: '#666',
                fontSize: '14px',
                marginRight: '10px'
              }}
            >
              ← 마이페이지로 돌아가기
            </Link>
          </div>
          <h1 style={{ 
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            marginBottom: '8px'
          }}>
            자주 묻는 질문
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            궁금한 내용을 빠르게 찾아보세요.
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            FAQ 검색
          </h3>
          
          {/* 검색바 */}
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="질문을 검색해보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* 카테고리 필터 */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px'
          }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: selectedCategory === category ? '#fff' : '#666',
                  backgroundColor: selectedCategory === category ? '#007bff' : '#f9f9f9',
                  cursor: 'pointer'
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* 전체 열기/닫기 */}
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={toggleAll}
              style={{
                fontSize: '13px',
                color: '#007bff',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {openItems.length === filteredFAQs.length ? '전체 닫기' : '전체 열기'}
            </button>
          </div>
        </div>

        {/* FAQ 목록 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            FAQ 목록 ({filteredFAQs.length}개)
          </h3>

          {filteredFAQs.length === 0 ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center' as const,
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
              <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                검색 결과가 없습니다
              </h4>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                다른 검색어를 입력하거나 카테고리를 변경해보세요.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('전체');
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#fff',
                  backgroundColor: '#007bff',
                  cursor: 'pointer'
                }}
              >
                전체 FAQ 보기
              </button>
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: '#fff'
            }}>
              {filteredFAQs.map((faq, index) => (
                <div key={faq.id} style={{ 
                  borderBottom: index < filteredFAQs.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <button
                    onClick={() => toggleItem(String(faq.id))}
                    style={{
                      width: '100%',
                      padding: '15px',
                      textAlign: 'left' as const,
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: '500',
                            borderRadius: '8px',
                            backgroundColor: '#e8f4fd',
                            color: '#0c5460',
                            marginRight: '8px'
                          }}>
                            {faq.category}
                          </span>
                          <span style={{ color: '#007bff', fontWeight: '500', fontSize: '13px' }}>Q.</span>
                        </div>
                        <h4 style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          margin: 0,
                          color: '#333'
                        }}>
                          {faq.question}
                        </h4>
                      </div>
                      <div style={{ marginLeft: '15px' }}>
                        <span style={{ 
                          fontSize: '18px',
                          color: '#666',
                          transform: openItems.includes(String(faq.id)) ? 'rotate(180deg)' : 'rotate(0deg)',
                          display: 'inline-block',
                          transition: 'transform 0.2s'
                        }}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </button>
                  
                  {openItems.includes(String(faq.id)) && (
                    <div style={{ padding: '0 15px 15px 15px' }}>
                      <div style={{ paddingLeft: '20px', borderLeft: '2px solid #e8f4fd' }}>
                        <div style={{ display: 'flex', alignItems: 'start', marginBottom: '8px' }}>
                          <span style={{ color: '#007bff', fontWeight: '500', fontSize: '13px', marginRight: '8px' }}>A.</span>
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: '#666',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap' as const
                        }}>
                          {faq.answer}
                        </div>
                        {faq.imageUrl && (
                          <div style={{ marginTop: '10px' }}>
                            <Image 
                              src={faq.imageUrl} 
                              alt="FAQ 이미지" 
                              width={400}
                              height={200}
                              style={{ 
                                maxWidth: '100%', 
                                height: 'auto',
                                maxHeight: '200px',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0',
                                objectFit: 'contain'
                              }}
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
        </div>

        {/* 추가 도움말 */}
        <div style={{ 
          padding: '20px',
          backgroundColor: '#f8f9ff',
          border: '1px solid #e0e8ff',
          borderRadius: '4px'
        }}>
          <h4 style={{ 
            fontSize: '16px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '10px',
            margin: 0
          }}>
            💡 찾으시는 답변이 없나요?
          </h4>
          <p style={{ 
            fontSize: '14px',
            color: '#666',
            marginBottom: '15px',
            margin: '10px 0 15px 0'
          }}>
            더 자세한 문의사항이나 개별 상담이 필요하시면 고객센터로 연락해주세요.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/contact"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              문의하기
            </Link>
            <Link
              href="/mypage"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                border: '1px solid #007bff',
                color: '#007bff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              마이페이지로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
