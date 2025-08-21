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
import { useFAQ, FAQItem } from '@/contexts/FAQContext';

export default function FAQPage() {
  const { faqs, addFaq, updateFaq, deleteFaq, toggleVisibility, moveFaq } = useFAQ();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    category: '주문/결제',
    question: '',
    answer: '',
    order: 1,
    isVisible: true
  });

  // 이미지 업로드 처리 함수
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // FAQ 관리 함수들
  const resetForm = () => {
    setFormData({
      category: '주문/결제',
      question: '',
      answer: '',
      order: 1,
      isVisible: true
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingFaq(null);
    setShowForm(false);
  };

  const handleAddFaq = () => {
    addFaq({
      category: formData.category,
      question: formData.question,
      answer: formData.answer,
      isVisible: formData.isVisible,
      order: formData.order,
      imageUrl: imagePreview || null
    });
    resetForm();
    alert('FAQ가 추가되었습니다.');
  };

  const handleEditFaq = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      isVisible: faq.isVisible
    });
    if (faq.imageUrl) {
      setImagePreview(faq.imageUrl);
    }
    setShowForm(true);
  };

  const handleUpdateFaq = () => {
    if (!editingFaq) return;
    
    updateFaq(editingFaq.id, {
      category: formData.category,
      question: formData.question,
      answer: formData.answer,
      order: formData.order,
      isVisible: formData.isVisible,
      imageUrl: imagePreview
    });
    resetForm();
    alert('FAQ가 수정되었습니다.');
  };

  const handleDeleteFaq = (id: number) => {
    if (confirm('이 FAQ를 삭제하시겠습니까?')) {
      deleteFaq(id);
      alert('FAQ가 삭제되었습니다.');
    }
  };



  const categories = ['all', '주문/결제', '배송', '상품', '교환/환불', '회원', '기능', '시스템', '기타'];

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
            {editingFaq ? 'FAQ 수정' : '새 FAQ 추가'}
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
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
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
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
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
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
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
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  이미지 첨부 (선택사항)
                </label>
                <div style={{ 
                  border: '2px dashed #ddd', 
                  borderRadius: '4px', 
                  padding: '20px', 
                  textAlign: 'center' as const,
                  backgroundColor: '#fafafa'
                }}>
                  {imagePreview ? (
                    <div>
                      <img 
                        src={imagePreview} 
                        alt="미리보기" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '4px',
                          marginBottom: '10px'
                        }} 
                      />
                      <div>
                        <button
                          type="button"
                          onClick={removeImage}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#dc3545',
                            backgroundColor: 'transparent',
                            border: '1px solid #dc3545',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          이미지 제거
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="faq-image-upload"
                      />
                      <label
                        htmlFor="faq-image-upload"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          fontSize: '14px',
                          color: '#007bff',
                          backgroundColor: 'transparent',
                          border: '1px solid #007bff',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        📷 이미지 선택
                      </label>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        margin: '10px 0 0 0'
                      }}>
                        JPG, PNG 파일만 업로드 가능 (최대 5MB)
                      </p>
                    </div>
                  )}
                </div>
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
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 1})}
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
                    <input 
                      type="checkbox" 
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({...formData, isVisible: e.target.checked})}
                      style={{ marginRight: '8px' }} 
                    />
                    <span style={{ fontSize: '14px' }}>즉시 게시</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={resetForm}
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
                <button 
                  onClick={editingFaq ? handleUpdateFaq : handleAddFaq}
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
                  {editingFaq ? '수정' : '추가'}
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
                  <button 
                    onClick={() => moveFaq(faq.id, 'up')}
                    disabled={index === 0}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: index === 0 ? '#ccc' : '#666',
                      backgroundColor: 'transparent',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: index === 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ↑
                  </button>
                  <button 
                    onClick={() => moveFaq(faq.id, 'down')}
                    disabled={index === filteredFAQs.length - 1}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: index === filteredFAQs.length - 1 ? '#ccc' : '#666',
                      backgroundColor: 'transparent',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: index === filteredFAQs.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ↓
                  </button>
                  <button 
                    onClick={() => toggleVisibility(faq.id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: faq.isVisible ? '#28a745' : '#6c757d',
                      backgroundColor: 'transparent',
                      border: `1px solid ${faq.isVisible ? '#28a745' : '#6c757d'}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {faq.isVisible ? '숨김' : '공개'}
                  </button>
                  <button 
                    onClick={() => handleEditFaq(faq)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#007bff',
                      backgroundColor: 'transparent',
                      border: '1px solid #007bff',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    수정
                  </button>
                  <button 
                    onClick={() => handleDeleteFaq(faq.id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#dc3545',
                      backgroundColor: 'transparent',
                      border: '1px solid #dc3545',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
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
                  lineHeight: '1.4',
                  marginBottom: faq.imageUrl ? '10px' : '0'
                }}>
                  A. {faq.answer}
                </p>
                {faq.imageUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={faq.imageUrl} 
                      alt="FAQ 이미지" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0'
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
