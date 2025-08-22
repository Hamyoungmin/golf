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
  const { faqs, loading, addFaq, updateFaq, deleteFaq, toggleVisibility, moveFaq, batchDeleteFaqs, batchUpdateVisibility } = useFAQ();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaqs, setSelectedFaqs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'order' | 'views' | 'createdAt' | 'updatedAt' | 'category'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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

  const handleAddFaq = async () => {
    try {
      await addFaq({
      category: formData.category,
      question: formData.question,
      answer: formData.answer,
      isVisible: formData.isVisible,
      order: formData.order,
      imageUrl: imagePreview || null
    });
    resetForm();
    alert('FAQ가 추가되었습니다.');
    } catch (error) {
      console.error('FAQ 추가 오류:', error);
      alert('FAQ 추가 중 오류가 발생했습니다.');
    }
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

  const handleUpdateFaq = async () => {
    if (!editingFaq) return;
    
    try {
      await updateFaq(editingFaq.id, {
      category: formData.category,
      question: formData.question,
      answer: formData.answer,
      order: formData.order,
      isVisible: formData.isVisible,
      imageUrl: imagePreview
    });
    resetForm();
    alert('FAQ가 수정되었습니다.');
    } catch (error) {
      console.error('FAQ 수정 오류:', error);
      alert('FAQ 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (confirm('이 FAQ를 삭제하시겠습니까?')) {
      try {
        await deleteFaq(id);
      alert('FAQ가 삭제되었습니다.');
      } catch (error) {
        console.error('FAQ 삭제 오류:', error);
        alert('FAQ 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 일괄 관리 함수들
  const toggleSelectFaq = (id: string) => {
    setSelectedFaqs(prev => {
      if (prev.includes(id)) {
        return prev.filter(faqId => faqId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedFaqs.length === filteredFAQs.length) {
      setSelectedFaqs([]);
    } else {
      setSelectedFaqs(filteredFAQs.map(faq => faq.id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFaqs.length === 0) {
      alert('삭제할 FAQ를 선택해주세요.');
      return;
    }
    
    if (confirm(`선택된 ${selectedFaqs.length}개의 FAQ를 삭제하시겠습니까?`)) {
      try {
        await batchDeleteFaqs(selectedFaqs);
        setSelectedFaqs([]);
        alert(`${selectedFaqs.length}개의 FAQ가 삭제되었습니다.`);
      } catch (error) {
        console.error('일괄 삭제 오류:', error);
        alert('FAQ 일괄 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleBatchVisibility = async (isVisible: boolean) => {
    if (selectedFaqs.length === 0) {
      alert('변경할 FAQ를 선택해주세요.');
      return;
    }
    
    try {
      await batchUpdateVisibility(selectedFaqs, isVisible);
      setSelectedFaqs([]);
      alert(`${selectedFaqs.length}개의 FAQ가 ${isVisible ? '공개' : '비공개'}로 변경되었습니다.`);
    } catch (error) {
      console.error('일괄 가시성 변경 오류:', error);
      alert('FAQ 일괄 가시성 변경 중 오류가 발생했습니다.');
    }
  };

  // 데이터 내보내기/가져오기 함수들
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(faqs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `faq_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    const csvHeader = 'ID,카테고리,질문,답변,공개여부,순서,조회수,생성일,수정일\n';
    const csvData = faqs.map(faq => [
      faq.id,
      `"${faq.category}"`,
      `"${faq.question.replace(/"/g, '""')}"`,
      `"${faq.answer.replace(/"/g, '""')}"`,
      faq.isVisible ? '공개' : '비공개',
      faq.order,
      faq.views,
      faq.createdAt || '',
      faq.updatedAt || ''
    ].join(',')).join('\n');
    
    const csvContent = csvHeader + csvData;
    const BOM = '\uFEFF';
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(BOM + csvContent);
    
    const exportFileDefaultName = `faq_data_${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (!Array.isArray(importedData)) {
          alert('올바른 JSON 파일이 아닙니다.');
          return;
        }
        
        // 데이터 유효성 검사
        const isValidData = importedData.every(item => 
          item.hasOwnProperty('question') && 
          item.hasOwnProperty('answer') && 
          item.hasOwnProperty('category')
        );
        
        if (!isValidData) {
          alert('올바른 FAQ 데이터 형식이 아닙니다.');
          return;
        }
        
        if (confirm(`${importedData.length}개의 FAQ를 가져오시겠습니까? 기존 데이터는 유지됩니다.`)) {
          // Firebase에서는 자동으로 순서 생성
          const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) : 0;
          
          try {
            for (let i = 0; i < importedData.length; i++) {
              const item = importedData[i];
              const newFaq = {
                category: item.category || '기타',
                question: item.question,
                answer: item.answer,
                order: item.order || (maxOrder + i + 1),
                isVisible: item.isVisible !== undefined ? item.isVisible : true
              };
              await addFaq(newFaq);
            }
            
            alert(`${importedData.length}개의 FAQ가 성공적으로 가져와졌습니다.`);
          } catch (error) {
            console.error('FAQ 가져오기 오류:', error);
            alert('FAQ 가져오기 중 오류가 발생했습니다.');
          }
        }
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    
    // 파일 입력 초기화
    event.target.value = '';
  };



  const categories = ['all', '주문/결제', '배송', '상품', '교환/환불', '회원', '기능', '시스템', '기타'];

  const filteredFAQs = faqs.filter(faq => {
    const categoryMatch = selectedCategory === 'all' || faq.category === selectedCategory;
    const searchMatch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'order':
        aValue = a.order;
        bValue = b.order;
        break;
      case 'views':
        aValue = a.views;
        bValue = b.views;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || '').getTime();
        bValue = new Date(b.createdAt || '').getTime();
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt || '').getTime();
        bValue = new Date(b.updatedAt || '').getTime();
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      default:
        aValue = a.order;
        bValue = b.order;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 필터가 변경될 때 선택된 FAQ 초기화
  React.useEffect(() => {
    setSelectedFaqs([]);
  }, [selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1400px', 
        margin: '20px auto', 
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}>
        <div style={{ textAlign: 'center' as const }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#666', fontSize: '16px' }}>FAQ 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '20px auto', 
      padding: '0 20px'
    }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '12px', 
        padding: '30px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
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
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#fff',
              backgroundColor: '#007bff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 123, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 123, 255, 0.3)';
            }}
          >
            + 새 FAQ 추가
          </button>
        </div>

      {/* FAQ 통계 대시보드 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          FAQ 통계
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px'
        }}>
          {/* 전체 FAQ 수 */}
          <div style={{
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
              {faqs.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>전체 FAQ</div>
          </div>
          
          {/* 공개 FAQ 수 */}
          <div style={{
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
              {faqs.filter(faq => faq.isVisible).length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>공개 FAQ</div>
          </div>
          
          {/* 비공개 FAQ 수 */}
          <div style={{
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d', marginBottom: '5px' }}>
              {faqs.filter(faq => !faq.isVisible).length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>비공개 FAQ</div>
          </div>
          
          {/* 총 조회수 */}
          <div style={{
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd7e14', marginBottom: '5px' }}>
              {faqs.reduce((total, faq) => total + faq.views, 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>총 조회수</div>
          </div>
          
          {/* 평균 조회수 */}
          <div style={{
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center' as const
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#20c997', marginBottom: '5px' }}>
              {faqs.length > 0 ? Math.round(faqs.reduce((total, faq) => total + faq.views, 0) / faqs.length) : 0}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>평균 조회수</div>
          </div>
        </div>
        
        {/* 카테고리별 통계 */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            marginBottom: '10px',
            color: '#495057'
          }}>
            카테고리별 FAQ 분포
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '10px'
          }}>
            {categories.filter(cat => cat !== 'all').map(category => {
              const categoryFaqs = faqs.filter(faq => faq.category === category);
              const categoryViews = categoryFaqs.reduce((total, faq) => total + faq.views, 0);
              return (
                <div key={category} style={{
                  padding: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  backgroundColor: '#fff'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    {category}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {categoryFaqs.length}개 • {categoryViews.toLocaleString()} 조회
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 데이터 관리 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          데이터 관리
        </h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* 내보내기 버튼들 */}
          <button
            onClick={handleExportJSON}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              border: '1px solid #28a745',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#28a745',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            📄 JSON 내보내기
          </button>
          
          <button
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              border: '1px solid #17a2b8',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#17a2b8',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            📊 CSV 내보내기
          </button>
          
          {/* 가져오기 */}
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: 'none' }}
              id="faq-import-input"
            />
            <label
              htmlFor="faq-import-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                border: '1px solid #fd7e14',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#fd7e14',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              📥 JSON 가져오기
            </label>
          </div>
          
          <div style={{ 
            marginLeft: '20px',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            💡 데이터를 백업하거나 다른 시스템에서 FAQ를 가져올 수 있습니다
          </div>
        </div>
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

      {/* 검색 및 필터 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          검색 및 필터
        </h3>
        
        {/* 검색바 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="FAQ 질문이나 답변에서 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '12px',
                paddingTop: '10px',
                paddingBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            />
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
              fontSize: '16px'
            }}>
              🔍
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#666',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* 카테고리 필터 및 정렬 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          alignItems: 'start'
        }}>
          {/* 카테고리 필터 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              카테고리
            </label>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
              gap: '8px'
        }}>
          {categories.map(category => (
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
                    cursor: 'pointer',
                    transition: 'all 0.2s'
              }}
            >
              {category === 'all' ? '전체' : category}
            </button>
          ))}
        </div>
          </div>
          
          {/* 정렬 기준 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              정렬 기준
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: '#fff'
              }}
            >
              <option value="order">순서</option>
              <option value="views">조회수</option>
              <option value="createdAt">생성일</option>
              <option value="updatedAt">수정일</option>
              <option value="category">카테고리</option>
            </select>
          </div>
          
          {/* 정렬 순서 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              정렬 순서
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                backgroundColor: '#fff'
              }}
            >
              <option value="asc">오름차순</option>
              <option value="desc">내림차순</option>
            </select>
          </div>
        </div>
        
        {/* 검색 결과 정보 */}
        {(searchTerm || selectedCategory !== 'all') && (
          <div style={{ 
            marginTop: '15px',
            padding: '8px 12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span>총 {faqs.length}개 중 {filteredFAQs.length}개 FAQ가 표시됩니다</span>
            {searchTerm && (
              <span style={{ marginLeft: '10px' }}>
                검색어: "<strong>{searchTerm}</strong>"
              </span>
            )}
            {searchTerm || selectedCategory !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                style={{
                  marginLeft: '10px',
                  padding: '2px 6px',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '12px',
                  color: '#007bff',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                초기화
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* FAQ 목록 */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          fontSize: '18px',
            margin: 0
        }}>
          FAQ 목록 ({filteredFAQs.length}개)
        </h3>
          
          {/* 일괄 작업 버튼들 */}
          {filteredFAQs.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '14px',
                color: '#666',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={selectedFaqs.length === filteredFAQs.length && filteredFAQs.length > 0}
                  onChange={toggleSelectAll}
                  style={{ marginRight: '8px' }}
                />
                전체 선택 ({selectedFaqs.length}/{filteredFAQs.length})
              </label>
              
              {selectedFaqs.length > 0 && (
                <>
                  <div style={{ 
                    width: '1px', 
                    height: '20px', 
                    backgroundColor: '#ddd' 
                  }} />
                  <button
                    onClick={() => handleBatchVisibility(true)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#28a745',
                      backgroundColor: 'transparent',
                      border: '1px solid #28a745',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    일괄 공개
                  </button>
                  <button
                    onClick={() => handleBatchVisibility(false)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#6c757d',
                      backgroundColor: 'transparent',
                      border: '1px solid #6c757d',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    일괄 비공개
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#dc3545',
                      backgroundColor: 'transparent',
                      border: '1px solid #dc3545',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    일괄 삭제
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {filteredFAQs.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center' as const,
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤔</div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: '#495057'
            }}>
              FAQ가 없습니다
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6c757d',
              marginBottom: '24px'
            }}>
              {searchTerm || selectedCategory !== 'all' 
                ? '검색 조건에 맞는 FAQ가 없습니다. 다른 조건으로 검색해보세요.'
                : '첫 번째 FAQ를 작성해보세요!'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#fff',
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                첫 FAQ 작성하기
              </button>
            )}
          </div>
        ) : (
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
                  <input
                    type="checkbox"
                    checked={selectedFaqs.includes(faq.id)}
                    onChange={() => toggleSelectFaq(faq.id)}
                    style={{ 
                      marginRight: '8px',
                      transform: 'scale(1.2)'
                    }}
                  />
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
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    📅 {new Date(faq.createdAt || '').toLocaleDateString('ko-KR')}
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
        )}
      </div>
      </div>
    </div>
  );
}
