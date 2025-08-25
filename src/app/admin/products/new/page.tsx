'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addProduct } from '@/lib/products';
import { uploadMultipleProductImages, formatFileSize, isValidImageFile } from '@/lib/imageUpload';
import { Category, Brand, CategoryPageMap } from '@/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AdminProductCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '' as Brand | '',
    description: '',
    detailedDescription: '',
    stock: 0,
    cover: false,
    productCode: '',
    specifications: {} as { [key: string]: string },
    images: [] as string[],
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    targetPages: [] as string[],
  });

  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // 모달 상태 관리
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '' as 'imageSelect' | 'urlInput' | 'specAdd' | 'specValue',
    title: '',
    placeholder: '',
    options: [] as string[],
    callback: null as ((value: string) => void) | null,
    fieldName: '' as 'description' | 'detailedDescription',
    specKey: ''
  });

  // 메인 카테고리별 페이지 매핑
  const categoryPageMap: CategoryPageMap = {
    drivers: {
      label: '드라이버',
      pages: [
        { path: 'drivers', label: '전체 드라이버' },
        { path: 'drivers/titleist', label: '타이틀리스트 드라이버' },
        { path: 'drivers/callaway', label: '캘러웨이 드라이버' },
        { path: 'drivers/taylormade', label: '테일러메이드 드라이버' },
        { path: 'drivers/honma', label: '혼마 드라이버' },
        { path: 'drivers/xxio', label: '젝시오 드라이버' },
        { path: 'drivers/bridgestone', label: '브리지스톤 드라이버' },
        { path: 'drivers/others', label: '기타 드라이버' },
      ]
    },
    woods: {
      label: '우드',
      pages: [
        { path: 'woods', label: '전체 우드' },
        { path: 'woods/titleist', label: '타이틀리스트 우드' },
        { path: 'woods/callaway', label: '캘러웨이 우드' },
        { path: 'woods/taylormade', label: '테일러메이드 우드' },
        { path: 'woods/honma', label: '혼마 우드' },
        { path: 'woods/xxio', label: '젝시오 우드' },
        { path: 'woods/bridgestone', label: '브리지스톤 우드' },
        { path: 'woods/others', label: '기타 우드' },
      ]
    },
    utilities: {
      label: '유틸리티',
      pages: [
        { path: 'utilities', label: '전체 유틸리티' },
        { path: 'utilities/titleist', label: '타이틀리스트 유틸리티' },
        { path: 'utilities/callaway', label: '캘러웨이 유틸리티' },
        { path: 'utilities/taylormade', label: '테일러메이드 유틸리티' },
        { path: 'utilities/honma', label: '혼마 유틸리티' },
        { path: 'utilities/xxio', label: '젝시오 유틸리티' },
        { path: 'utilities/bridgestone', label: '브리지스톤 유틸리티' },
        { path: 'utilities/others', label: '기타 유틸리티' },
      ]
    },
    wedges: {
      label: '웨지',
      pages: [
        { path: 'wedges', label: '전체 웨지' },
        { path: 'wedges/titleist', label: '타이틀리스트 웨지' },
        { path: 'wedges/callaway', label: '캘러웨이 웨지' },
        { path: 'wedges/taylormade', label: '테일러메이드 웨지' },
        { path: 'wedges/honma', label: '혼마 웨지' },
        { path: 'wedges/xxio', label: '젝시오 웨지' },
        { path: 'wedges/bridgestone', label: '브리지스톤 웨지' },
        { path: 'wedges/others', label: '기타 웨지' },
      ]
    },
    putters: {
      label: '퍼터',
      pages: [
        { path: 'putters', label: '전체 퍼터' },
        { path: 'putters/titleist', label: '타이틀리스트 퍼터' },
        { path: 'putters/callaway', label: '캘러웨이 퍼터' },
        { path: 'putters/taylormade', label: '테일러메이드 퍼터' },
        { path: 'putters/honma', label: '혼마 퍼터' },
        { path: 'putters/xxio', label: '젝시오 퍼터' },
        { path: 'putters/bridgestone', label: '브리지스톤 퍼터' },
        { path: 'putters/others', label: '기타 퍼터' },
      ]
    },
    'left-handed': {
      label: '왼손용',
      pages: [
        { path: 'left-handed', label: '전체 왼손용' },
        { path: 'left-handed/titleist', label: '타이틀리스트 왼손용' },
        { path: 'left-handed/callaway', label: '캘러웨이 왼손용' },
        { path: 'left-handed/taylormade', label: '테일러메이드 왼손용' },
        { path: 'left-handed/honma', label: '혼마 왼손용' },
        { path: 'left-handed/xxio', label: '젝시오 왼손용' },
        { path: 'left-handed/bridgestone', label: '브리지스톤 왼손용' },
        { path: 'left-handed/others', label: '기타 왼손용' },
      ]
    },
    womens: {
      label: '여성용',
      pages: [
        { path: 'womens', label: '전체 여성용' },
        { path: 'womens/titleist', label: '타이틀리스트 여성용' },
        { path: 'womens/callaway', label: '캘러웨이 여성용' },
        { path: 'womens/taylormade', label: '테일러메이드 여성용' },
        { path: 'womens/honma', label: '혼마 여성용' },
        { path: 'womens/xxio', label: '젝시오 여성용' },
        { path: 'womens/bridgestone', label: '브리지스톤 여성용' },
        { path: 'womens/others', label: '기타 여성용' },
      ]
    }
  };

  const brands: Brand[] = ['titleist', 'taylormade', 'callaway', 'honma', 'bridgestone', 'others'];

  // 모달 헬퍼 함수들
  const openModal = (
    type: 'imageSelect' | 'urlInput' | 'specAdd' | 'specValue',
    title: string,
    placeholder: string = '',
    options: string[] = [],
    callback: (value: string) => void,
    fieldName: 'description' | 'detailedDescription' = 'description',
    specKey: string = ''
  ) => {
    setModalState({
      isOpen: true,
      type,
      title,
      placeholder,
      options,
      callback,
      fieldName,
      specKey
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: 'imageSelect',
      title: '',
      placeholder: '',
      options: [],
      callback: null,
      fieldName: 'description',
      specKey: ''
    });
  };

  const handleModalSubmit = (value: string) => {
    if (modalState.callback) {
      modalState.callback(value);
    }
    closeModal();
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!isValidImageFile(file)) {
        alert(`${file.name}은(는) 지원되지 않는 파일 형식입니다. (지원: JPG, PNG, WebP, GIF)`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}은(는) 파일 크기가 너무 큽니다. (최대 5MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // 선택된 파일 제거
  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 파일 업로드 및 URL 추가
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }

    if (!formData.name.trim()) {
      alert('상품명을 먼저 입력해주세요. (파일명 생성에 필요)');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls = await uploadMultipleProductImages(selectedFiles, formData.name);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      setSelectedFiles([]); // 업로드 완료 후 선택된 파일 초기화
      alert(`${uploadedUrls.length}개의 이미지가 성공적으로 업로드되었습니다.`);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImages(false);
    }
  };

  // 메인 카테고리 선택 핸들러
  const handleMainCategoryChange = (categoryKey: string) => {
    setSelectedMainCategory(categoryKey);
    setFormData({ ...formData, targetPages: [] }); // 페이지 선택 초기화
  };

  // 페이지 선택 토글 핸들러
  const handlePageToggle = (pagePath: string) => {
    const currentPages = formData.targetPages;
    const isSelected = currentPages.includes(pagePath);
    
    if (isSelected) {
      setFormData({
        ...formData,
        targetPages: currentPages.filter(p => p !== pagePath)
      });
    } else {
      setFormData({
        ...formData,
        targetPages: [...currentPages, pagePath]
      });
    }
  };

  // 전체 선택/해제
  const handleSelectAllPages = () => {
    if (!selectedMainCategory) return;
    
    const categoryPages = categoryPageMap[selectedMainCategory].pages;
    const allPaths = categoryPages.map(p => p.path);
    const isAllSelected = allPaths.every(path => formData.targetPages.includes(path));
    
    if (isAllSelected) {
      // 전체 해제
      setFormData({
        ...formData,
        targetPages: formData.targetPages.filter(p => !allPaths.includes(p))
      });
    } else {
      // 전체 선택
      const newTargetPages = [...new Set([...formData.targetPages, ...allPaths])];
      setFormData({
        ...formData,
        targetPages: newTargetPages
      });
    }
  };

  // targetPages에서 메인 카테고리 추론
  const inferCategoryFromTargetPages = (targetPages: string[]): Category => {
    // 첫 번째 선택된 페이지에서 카테고리 추론
    const firstPage = targetPages[0];
    if (!firstPage) return 'drivers'; // 기본값
    
    if (firstPage.includes('drivers')) return 'drivers';
    if (firstPage.includes('woods')) return 'woods';
    if (firstPage.includes('utilities')) return 'utilities';
    if (firstPage.includes('wedges')) return 'wedges';
    if (firstPage.includes('putters')) return 'putters';
    if (firstPage.includes('irons')) return 'irons';
    
    return 'drivers'; // 기본값
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.brand) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.targetPages.length === 0) {
      alert('상품이 표시될 페이지를 하나 이상 선택해주세요.');
      return;
    }

    const inferredCategory = inferCategoryFromTargetPages(formData.targetPages);

    setLoading(true);
    try {
      await addProduct({
        name: formData.name,
        price: formData.price,
        category: inferredCategory,
        brand: formData.brand as Brand,
        description: formData.description,
        detailedDescription: formData.detailedDescription,
        stock: formData.stock,
        cover: formData.cover,
        productCode: formData.productCode,
        specifications: formData.specifications,
        images: formData.images.length > 0 ? formData.images : ['/placeholder.jpg'],
        isWomens: formData.isWomens,
        isKids: formData.isKids,
        isLeftHanded: formData.isLeftHanded,
        targetPages: formData.targetPages,
      });

      alert('상품이 등록되었습니다.');
      router.push('/admin/products');
    } catch (error) {
      console.error('상품 등록 실패:', error);
      alert('상품 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const handleImageUrlRemove = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSpecificationAdd = () => {
    openModal(
      'specAdd',
      '스펙 이름 입력',
      '예: 샤프트, 길이, 무게',
      [],
      (key: string) => {
        if (key.trim()) {
          const specKey = key.trim();
          openModal(
            'specValue',
            `${specKey}의 값 입력`,
            '예: 카본, 44인치, 300g',
            [],
            (value: string) => {
              if (value.trim()) {
                setFormData({
                  ...formData,
                  specifications: { ...formData.specifications, [specKey]: value.trim() },
                });
              }
            },
            'description',
            specKey
          );
        }
      }
    );
  };

  const handleSpecificationRemove = (key: string) => {
    const { [key]: _, ...rest } = formData.specifications;
    setFormData({ ...formData, specifications: rest });
  };

  // 이미지 URL을 텍스트에 삽입하는 헬퍼 함수
  const insertImageToText = (fieldName: 'description' | 'detailedDescription', imageUrl: string) => {
    const imageTag = `<img src="${imageUrl}" alt="상품 이미지" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
    const currentText = formData[fieldName];
    const newText = currentText ? `${currentText}\n\n${imageTag}` : imageTag;
    setFormData({ ...formData, [fieldName]: newText });
  };

  // 기존 이미지를 텍스트에 삽입
  const handleInsertExistingImage = (fieldName: 'description' | 'detailedDescription') => {
    if (formData.images.length === 0) {
      alert('먼저 상품 이미지를 업로드해주세요.');
      return;
    }

    const imageOptions = formData.images.map((url, index) => `${index + 1}번: ${url.split('/').pop()}`);
    
    openModal(
      'imageSelect',
      '삽입할 이미지를 선택하세요',
      '',
      imageOptions,
      (selection: string) => {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < formData.images.length) {
          insertImageToText(fieldName, formData.images[index]);
        }
      },
      fieldName
    );
  };

  // 새 이미지 URL을 텍스트에 삽입
  const handleInsertNewImageUrl = (fieldName: 'description' | 'detailedDescription') => {
    openModal(
      'urlInput',
      '이미지 URL 입력',
      'https://example.com/image.jpg',
      [],
      (imageUrl: string) => {
        if (imageUrl.trim()) {
          insertImageToText(fieldName, imageUrl.trim());
        }
      },
      fieldName
    );
  };

  // 새 이미지 파일을 업로드하고 텍스트에 삽입
  const handleUploadAndInsertImage = async (fieldName: 'description' | 'detailedDescription') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!isValidImageFile(file)) {
        alert('지원되지 않는 파일 형식입니다. (지원: JPG, PNG, WebP, GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기가 너무 큽니다. (최대 5MB)');
        return;
      }

      if (!formData.name.trim()) {
        alert('상품명을 먼저 입력해주세요.');
        return;
      }

      try {
        setUploadingImages(true);
        const uploadedUrls = await uploadMultipleProductImages([file], formData.name);
        const imageUrl = uploadedUrls[0];
        
        // 업로드된 이미지를 상품 이미지 목록에 추가
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
        
        // 텍스트에 이미지 삽입
        insertImageToText(fieldName, imageUrl);
        
        alert('이미지가 업로드되고 텍스트에 삽입되었습니다.');
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
      } finally {
        setUploadingImages(false);
      }
    };
    input.click();
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/admin/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#666',
              textDecoration: 'none'
            }}
          >
            ← 상품 목록으로 돌아가기
          </Link>
        </div>

        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          새 상품 등록
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* 기본 정보 */}
          <div>
            <h3 style={{ 
              fontWeight: 'bold', 
              marginBottom: '15px',
              fontSize: '18px',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px'
            }}>
              기본 정보
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  상품명 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  가격 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => {
                    // 숫자와 쉼표만 허용
                    let value = e.target.value.replace(/[^\d,]/g, '');
                    
                    // 쉼표 제거 후 숫자만 추출
                    const numbers = value.replace(/,/g, '');
                    
                    // 숫자가 있으면 천 단위 구분자 추가
                    if (numbers) {
                      const formatted = parseInt(numbers).toLocaleString('ko-KR');
                      setFormData({ ...formData, price: formatted });
                    } else {
                      setFormData({ ...formData, price: '' });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  placeholder="예: 140,000"
                  required
                />
              </div>

              {/* 상품 표시 페이지 선택 */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  상품 표시 페이지 <span style={{ color: '#dc3545' }}>*</span>
                </label>

                {/* 메인 카테고리 선택 */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '400',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    메인 카테고리 선택
                </label>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                    gap: '8px',
                    marginBottom: '15px' 
                  }}>
                    {Object.entries(categoryPageMap).map(([key, category]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleMainCategoryChange(key)}
                        style={{
                          padding: '8px',
                          border: selectedMainCategory === key ? '2px solid #007bff' : '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: selectedMainCategory === key ? '#e3f2fd' : '#fff',
                          color: selectedMainCategory === key ? '#007bff' : '#666',
                          fontSize: '12px',
                          fontWeight: selectedMainCategory === key ? 'bold' : 'normal',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 선택된 카테고리의 세부 페이지들 */}
                {selectedMainCategory && (
                  <div style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '15px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '10px' 
                    }}>
                      <h5 style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        color: '#333',
                        margin: 0
                      }}>
                        {categoryPageMap[selectedMainCategory].label} 페이지 선택
                      </h5>
                      <button
                        type="button"
                        onClick={handleSelectAllPages}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          color: '#007bff',
                          backgroundColor: 'transparent',
                          border: '1px solid #007bff',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        {categoryPageMap[selectedMainCategory].pages.every(page => 
                          formData.targetPages.includes(page.path)
                        ) ? '전체 해제' : '전체 선택'}
                      </button>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                      gap: '6px' 
                    }}>
                      {categoryPageMap[selectedMainCategory].pages.map((page) => (
                        <label 
                          key={page.path} 
                  style={{
                            display: 'flex', 
                            alignItems: 'center',
                            padding: '6px',
                            backgroundColor: '#fff',
                    border: '1px solid #ddd',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.targetPages.includes(page.path)}
                            onChange={() => handlePageToggle(page.path)}
                            style={{ marginRight: '6px' }}
                          />
                          <span>{page.label}</span>
                        </label>
                      ))}
                    </div>

                    {formData.targetPages.filter(path => 
                      categoryPageMap[selectedMainCategory].pages.some(page => page.path === path)
                    ).length > 0 && (
                      <div style={{ 
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: '#e8f5e8',
                        border: '1px solid #4caf50',
                        borderRadius: '3px'
                      }}>
                        <p style={{ fontSize: '12px', color: '#2e7d32', margin: 0 }}>
                          ✅ 선택된 페이지: {formData.targetPages.filter(path => 
                            categoryPageMap[selectedMainCategory].pages.some(page => page.path === path)
                          ).length}개
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {formData.targetPages.length === 0 && (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#dc3545',
                    fontStyle: 'italic',
                    margin: '8px 0 0 0'
                  }}>
                    상품이 표시될 페이지를 하나 이상 선택해주세요.
                  </p>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  브랜드 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value as Brand })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                >
                  <option value="">선택하세요</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
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
                  재고 수량
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  min="0"
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  커버
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.cover}
                    onChange={(e) => setFormData({ ...formData, cover: e.target.checked })}
                    style={{ 
                      marginRight: '8px',
                      transform: 'scale(1.2)'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    커버 포함
                  </span>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  상품 코드
                </label>
                <input
                  type="text"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  placeholder="예: PRD001"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 상품 설명 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                상품 설명
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleInsertExistingImage('description')}
                  disabled={formData.images.length === 0}
                  style={{
                    fontSize: '12px',
                    color: formData.images.length === 0 ? '#ccc' : '#007bff',
                    backgroundColor: 'transparent',
                    border: '1px solid',
                    borderColor: formData.images.length === 0 ? '#ccc' : '#007bff',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: formData.images.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                  title="상품 이미지에서 선택"
                >
                  📷 기존 이미지
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadAndInsertImage('description')}
                  disabled={uploadingImages || !formData.name.trim()}
                  style={{
                    fontSize: '12px',
                    color: (!formData.name.trim() || uploadingImages) ? '#ccc' : '#28a745',
                    backgroundColor: 'transparent',
                    border: '1px solid',
                    borderColor: (!formData.name.trim() || uploadingImages) ? '#ccc' : '#28a745',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: (!formData.name.trim() || uploadingImages) ? 'not-allowed' : 'pointer'
                  }}
                  title="새 이미지 업로드"
                >
                  📤 업로드
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertNewImageUrl('description')}
                  style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    backgroundColor: 'transparent',
                    border: '1px solid #6c757d',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                  title="이미지 URL 직접 입력"
                >
                  🔗 URL
                </button>
              </div>
            </div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'monospace'
              }}
              placeholder="상품에 대한 간단한 설명을 입력하세요..."
            />
            <p style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: '5px',
              fontStyle: 'italic'
            }}>
              💡 이미지를 삽입하려면 위의 버튼들을 사용하세요. HTML 태그가 지원됩니다.
            </p>
          </div>

          {/* 상세 정보 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                상세 정보
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleInsertExistingImage('detailedDescription')}
                  disabled={formData.images.length === 0}
                  style={{
                    fontSize: '12px',
                    color: formData.images.length === 0 ? '#ccc' : '#007bff',
                    backgroundColor: 'transparent',
                    border: '1px solid',
                    borderColor: formData.images.length === 0 ? '#ccc' : '#007bff',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: formData.images.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                  title="상품 이미지에서 선택"
                >
                  📷 기존 이미지
                </button>
                <button
                  type="button"
                  onClick={() => handleUploadAndInsertImage('detailedDescription')}
                  disabled={uploadingImages || !formData.name.trim()}
                  style={{
                    fontSize: '12px',
                    color: (!formData.name.trim() || uploadingImages) ? '#ccc' : '#28a745',
                    backgroundColor: 'transparent',
                    border: '1px solid',
                    borderColor: (!formData.name.trim() || uploadingImages) ? '#ccc' : '#28a745',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: (!formData.name.trim() || uploadingImages) ? 'not-allowed' : 'pointer'
                  }}
                  title="새 이미지 업로드"
                >
                  📤 업로드
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertNewImageUrl('detailedDescription')}
                  style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    backgroundColor: 'transparent',
                    border: '1px solid #6c757d',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                  title="이미지 URL 직접 입력"
                >
                  🔗 URL
                </button>
              </div>
            </div>
            <textarea
              value={formData.detailedDescription}
              onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
              rows={8}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'monospace'
              }}
              placeholder="상품의 상세한 정보, 스펙, 특징 등을 입력하세요..."
            />
            <p style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: '5px',
              fontStyle: 'italic'
            }}>
              💡 이미지를 삽입하려면 위의 버튼들을 사용하세요. HTML 태그가 지원됩니다.
            </p>
          </div>

          {/* 이미지 관리 */}
          <div>
            <h3 style={{ 
              fontWeight: 'bold', 
              marginBottom: '15px',
              fontSize: '18px',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px'
            }}>
              상품 이미지
            </h3>

            {/* 파일 업로드 섹션 */}
            <div style={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: '#f9f9f9'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                marginBottom: '15px',
                color: '#333'
              }}>
                📁 파일 업로드
              </h4>
              
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px dashed #007bff',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '5px',
                  fontStyle: 'italic'
                }}>
                  지원 형식: JPG, PNG, WebP, GIF | 최대 크기: 5MB | 여러 파일 선택 가능
                </p>
              </div>

              {/* 선택된 파일 목록 */}
              {selectedFiles.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                    선택된 파일 ({selectedFiles.length}개)
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}>
                        <span style={{ fontSize: '14px' }}>
                          {file.name} ({formatFileSize(file.size)})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleFileRemove(index)}
                          style={{
                            color: '#dc3545',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          제거
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 업로드 버튼 */}
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={selectedFiles.length === 0 || uploadingImages || !formData.name.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: uploadingImages ? '#ccc' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: uploadingImages ? 'not-allowed' : 'pointer',
                  opacity: selectedFiles.length === 0 || !formData.name.trim() ? 0.6 : 1
                }}
              >
                {uploadingImages ? '업로드 중...' : `${selectedFiles.length}개 파일 업로드`}
              </button>
            </div>

            {/* URL 직접 입력 섹션 */}
            <div style={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '20px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  🔗 URL 직접 입력
                </h4>
              <button
                type="button"
                onClick={handleImageUrlAdd}
                style={{
                  fontSize: '14px',
                  color: '#007bff',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                  + URL 추가
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.images.map((url, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}>
                  <input
                    type="text"
                    value={url}
                    readOnly
                    style={{
                      flex: 1,
                        padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f5',
                      fontSize: '14px'
                    }}
                  />
                    {url && (
                      <img 
                        src={url} 
                        alt="미리보기" 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  <button
                    type="button"
                    onClick={() => handleImageUrlRemove(index)}
                    style={{
                      color: '#dc3545',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px'
                  }}>
                    이미지가 없습니다. 파일을 업로드하거나 URL을 추가해주세요.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 스펙 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                상품 스펙
              </label>
              <button
                type="button"
                onClick={handleSpecificationAdd}
                style={{
                  fontSize: '14px',
                  color: '#007bff',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                + 스펙 추가
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    value={key}
                    readOnly
                    style={{
                      width: '33%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f5',
                      fontSize: '14px'
                    }}
                  />
                  <input
                    type="text"
                    value={value}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f5',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSpecificationRemove(key)}
                    style={{
                      color: '#dc3545',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
              {Object.keys(formData.specifications).length === 0 && (
                <p style={{ fontSize: '14px', color: '#666' }}>스펙을 추가하려면 위의 버튼을 클릭하세요.</p>
              )}
            </div>
          </div>

          



          {/* 버튼 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '10px', 
            paddingTop: '20px', 
            borderTop: '1px solid #e0e0e0' 
          }}>
            <Link
              href="/admin/products"
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
                backgroundColor: '#f9f9f9',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#fff',
                backgroundColor: loading ? '#ccc' : '#007bff',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '등록 중...' : '상품 등록'}
            </button>
          </div>
        </form>
      </div>

      {/* 커스텀 모달 */}
      {modalState.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#333',
              textAlign: 'center'
            }}>
              {modalState.title}
            </h3>

            {modalState.type === 'imageSelect' ? (
              // 이미지 선택 모달
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                  삽입할 이미지를 선택하세요:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {modalState.options.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleModalSubmit((index + 1).toString())}
                      style={{
                        padding: '12px',
                        border: '2px solid #e1e5e9',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#3742fa';
                        e.currentTarget.style.backgroundColor = '#f8f9ff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#e1e5e9';
                        e.currentTarget.style.backgroundColor = '#fff';
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // 텍스트 입력 모달
              <CustomModalInput 
                onSubmit={handleModalSubmit}
                onCancel={closeModal}
                placeholder={modalState.placeholder}
              />
            )}

            {modalState.type === 'imageSelect' && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    color: '#666',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 모달 입력 컴포넌트
function CustomModalInput({ 
  onSubmit, 
  onCancel, 
  placeholder 
}: { 
  onSubmit: (value: string) => void;
  onCancel: () => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputValue);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        autoFocus
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #e1e5e9',
          borderRadius: '8px',
          fontSize: '16px',
          marginBottom: '20px',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#3742fa'}
        onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
      />
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#3742fa',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2f3542'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3742fa'}
        >
          확인
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            color: '#666',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          취소
        </button>
      </div>
    </form>
  );
}
