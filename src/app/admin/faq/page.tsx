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
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '8px'
            }}>
              FAQ 관리
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: 0
            }}>
              자주 묻는 질문과 답변을 관리합니다.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
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
            + 새 FAQ 추가
          </button>
        </div>

      {/* FAQ 작성 폼 */}
      {showForm && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            새 FAQ 추가
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  카테고리
                </label>
                <select style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  질문
                </label>
                <input
                  type="text"
                  placeholder="자주 묻는 질문을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  답변
                </label>
                <textarea
                  rows={4}
                  placeholder="질문에 대한 답변을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    순서
                  </label>
                  <input
                    type="number"
                    defaultValue="1"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '25px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '14px' }}>즉시 게시</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#666',
                    backgroundColor: '#f9f9f9',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#fff',
                  backgroundColor: '#007bff',
                  cursor: 'pointer'
                }}>
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          카테고리 필터
        </h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px'
        }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedCategory === category ? '#fff' : '#666',
                backgroundColor: selectedCategory === category ? '#007bff' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              {category === 'all' ? '전체' : category}
            </button>
          ))}
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
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}>
          {filteredFAQs.map((faq, index) => (
            <div key={faq.id} style={{ 
              padding: '20px',
              borderBottom: index < filteredFAQs.length - 1 ? '1px solid #e0e0e0' : 'none'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: '12px',
                    backgroundColor: '#e8f4fd',
                    color: '#0c5460'
                  }}>
                    {faq.category}
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: '12px',
                    backgroundColor: faq.isVisible ? '#e8f5e8' : '#f0f0f0',
                    color: faq.isVisible ? '#2d7a2d' : '#666'
                  }}>
                    {faq.isVisible ? '게시중' : '비공개'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    👁 {faq.views}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: '#666',
                    backgroundColor: 'transparent',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    ↑
                  </button>
                  <button style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: '#666',
                    backgroundColor: 'transparent',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    ↓
                  </button>
                  <button style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: '#007bff',
                    backgroundColor: 'transparent',
                    border: '1px solid #007bff',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    수정
                  </button>
                  <button style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: '#dc3545',
                    backgroundColor: 'transparent',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    삭제
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  display: 'flex', 
                  alignItems: 'center',
                  margin: 0
                }}>
                  ❓ Q. {faq.question}
                </h4>
              </div>
              <div style={{ marginLeft: '20px' }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  A. {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
