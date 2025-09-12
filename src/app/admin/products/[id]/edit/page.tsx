'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct, updateProduct } from '@/lib/products';
import { uploadMultipleProductImages, formatFileSize, isValidImageFile } from '@/lib/imageUpload';
import { unformatPrice } from '@/utils/priceUtils';
import { Category, Brand, Product } from '@/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
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

  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [compressing, setCompressing] = useState(false);

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

  const brands: Brand[] = ['titleist', 'taylormade', 'callaway', 'honma', 'xxio', 'bridgestone', 'others'];

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

  // 카테고리 페이지 매핑 정의
  interface CategoryPageMap {
    [key: string]: {
      label: string;
      pages: { path: string; label: string }[];
    };
  }

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
    irons: {
      label: '아이언',
      pages: [
        { path: 'irons', label: '전체 아이언' },
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
    'heads-parts': {
      label: '헤드&단품',
      pages: [
        { path: 'heads-parts', label: '전체 헤드&단품' },
        { path: 'heads-parts/heads', label: '헤드' },
        { path: 'heads-parts/parts', label: '단품' },
      ]
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId, fetchProduct]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const productData = await getProduct(productId);
      if (productData) {
        setProduct(productData);
        setFormData({
          name: productData.name,
          price: productData.price,
          brand: productData.brand as Brand,
          description: productData.description,
          detailedDescription: productData.detailedDescription || '',
          stock: productData.stock,
          cover: productData.cover || false,
          productCode: productData.productCode || '',
          specifications: productData.specifications || {},
          images: productData.images || [],
          isWomens: productData.isWomens,
          isKids: productData.isKids,
          isLeftHanded: productData.isLeftHanded,
          targetPages: productData.targetPages || [],
        });
        
        // targetPages에서 메인 카테고리 추론하여 설정
        if (productData.targetPages && productData.targetPages.length > 0) {
          const firstPage = productData.targetPages[0];
          if (firstPage.includes('drivers')) setSelectedMainCategory('drivers');
          else if (firstPage.includes('woods')) setSelectedMainCategory('woods');
          else if (firstPage.includes('utilities')) setSelectedMainCategory('utilities');
          else if (firstPage.includes('wedges')) setSelectedMainCategory('wedges');
          else if (firstPage.includes('putters')) setSelectedMainCategory('putters');
          else if (firstPage.includes('irons')) setSelectedMainCategory('irons');
          else if (firstPage.includes('heads-parts')) setSelectedMainCategory('heads-parts');
          else if (firstPage.includes('womens')) setSelectedMainCategory('womens');
          else if (firstPage.includes('left-handed')) setSelectedMainCategory('left-handed');
        }
      } else {
        alert('상품을 찾을 수 없습니다.');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('상품 정보 로딩 실패:', error);
      alert('상품 정보를 불러오는데 실패했습니다.');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  // 메인 카테고리 선택 핸들러
  const handleMainCategoryChange = (categoryKey: string) => {
    setSelectedMainCategory(categoryKey);
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

    setSaving(true);
    let finalImages = [...formData.images]; // 기존 이미지들

    try {
      // 🚀 선택된 파일들이 있으면 자동으로 업로드
      if (selectedFiles.length > 0) {
        console.log(`📤 ${selectedFiles.length}개 이미지 자동 업로드 시작...`);
        
        // 업로드 진행률 표시
        setUploadingImages(true);
        setUploadProgress({ current: 0, total: selectedFiles.length, fileName: '' });
        
        const uploadedUrls = await uploadMultipleProductImages(
          selectedFiles, 
          formData.name,
          (current, total, fileName) => {
            setUploadProgress({ current, total, fileName });
            console.log(`📤 업로드 진행: ${current}/${total} - ${fileName}`);
          }
        );
        
        // 업로드된 이미지들을 기존 이미지들과 합치기
        finalImages = [...finalImages, ...uploadedUrls];
        console.log(`✅ ${uploadedUrls.length}개 이미지 업로드 완료!`);
        
        // 선택된 파일들 초기화
        setSelectedFiles([]);
        setUploadProgress({ current: 0, total: 0, fileName: '' });
      }

      // 🛍️ 상품 데이터 저장
      console.log('💾 상품 데이터 저장 중...');
      await updateProduct(productId, {
        name: formData.name,
        price: unformatPrice(formData.price) || '0',
        brand: formData.brand as Brand,
        description: formData.description,
        detailedDescription: formData.detailedDescription,
        stock: formData.stock,
        cover: formData.cover,
        productCode: formData.productCode,
        specifications: formData.specifications,
        images: finalImages.length > 0 ? finalImages : ['/placeholder.jpg'],
        isWomens: formData.isWomens,
        isKids: formData.isKids,
        isLeftHanded: formData.isLeftHanded,
        targetPages: formData.targetPages,
      });

      alert('✅ 상품이 성공적으로 수정되었습니다!');
      router.push('/admin/products');
      
    } catch (error) {
      console.error('❌ 상품 수정 실패:', error);
      
      let errorMessage = '상품 수정에 실패했습니다.';
      if (error instanceof Error) {
        if (error.message.includes('업로드 타임아웃')) {
          errorMessage = '이미지 업로드 시간이 초과되었습니다. 파일 크기를 줄이거나 개별로 시도해주세요.';
        } else if (error.message.includes('파일 크기')) {
          errorMessage = '파일 업로드에 실패했습니다. 네트워크 연결을 확인해주세요.';
        } else if (error.message.includes('이미지 파일만')) {
          errorMessage = '이미지 파일만 업로드 가능합니다.';
        }
      }
      alert(errorMessage);
      
    } finally {
      setSaving(false);
      setUploadingImages(false);
      setUploadProgress({ current: 0, total: 0, fileName: '' });
    }
  };



  // 이미지 URL 추가
  const handleImageUrlAdd = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  // 이미지 URL 제거
  const handleImageUrlRemove = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  // 파일 유효성 검사 함수
  const validateFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!isValidImageFile(file)) {
        alert(`${file.name}은(는) 지원되지 않는 파일 형식입니다. (지원: JPG, PNG, WebP, GIF)`);
        return false;
      }
      // 파일 크기 제한 제거 - 무제한 업로드 허용
      return true;
    });
    return validFiles;
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = validateFiles(files);
      setSelectedFiles(prev => [...prev, ...validFiles]);

    // input 초기화
    e.target.value = '';
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files) return;

    const validFiles = validateFiles(files);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // 선택된 파일 제거
  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 스펙 추가
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

  // 스펙 제거
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

      // 파일 크기 제한 제거 - 무제한 업로드 허용

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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        상품 정보를 불러오는 중...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '30px' }}>
        <Link
          href="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#666',
            textDecoration: 'none',
            fontSize: '14px',
            marginBottom: '10px'
          }}
        >
          <ArrowLeftIcon style={{ width: '16px', height: '16px', marginRight: '4px' }} />
          상품 목록으로 돌아가기
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
          상품 수정
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
            기본 정보
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                상품명 <span style={{ color: '#ff4757' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3742fa'}
                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                가격 <span style={{ color: '#ff4757' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.price || ''}
                onChange={(e) => {
                  // 숫자와 쉼표만 허용
                  const value = e.target.value.replace(/[^\d,]/g, '');
                  
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
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3742fa'}
                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                placeholder="예: 140,000"
                required
              />
            </div>
          </div>

          {/* 상품 표시 페이지 설정 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px',
              fontWeight: '500',
              color: '#333'
            }}>
              상품 표시 페이지 <span style={{ color: '#ff4757' }}>*</span>
            </label>
            
            {/* 메인 카테고리 선택 버튼들 */}
            <div style={{ marginBottom: '15px' }}>
              <p style={{ 
                fontSize: '13px', 
                color: '#666', 
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                카테고리 선택:
              </p>
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
                      border: selectedMainCategory === key ? '2px solid #3742fa' : '2px solid #e1e5e9',
                      borderRadius: '8px',
                      backgroundColor: selectedMainCategory === key ? '#f1f2f6' : '#fff',
                      color: selectedMainCategory === key ? '#3742fa' : '#666',
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
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#f8f9fa'
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
                      padding: '6px 12px',
                      fontSize: '12px',
                      color: '#3742fa',
                      backgroundColor: 'transparent',
                      border: '1px solid #3742fa',
                      borderRadius: '6px',
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
                  gap: '8px' 
                }}>
                  {categoryPageMap[selectedMainCategory].pages.map((page) => (
                    <label 
                      key={page.path} 
                      style={{
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#fff',
                        border: '1px solid #e1e5e9',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.targetPages.includes(page.path)}
                        onChange={() => handlePageToggle(page.path)}
                        style={{ marginRight: '8px' }}
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
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '6px'
                  }}>
                    <p style={{ fontSize: '12px', color: '#155724', margin: 0 }}>
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
                color: '#ff4757',
                fontStyle: 'italic',
                margin: '8px 0 0 0'
              }}>
                상품이 표시될 페이지를 하나 이상 선택해주세요.
              </p>
            )}

            {/* 현재 선택된 모든 페이지 표시 */}
            {formData.targetPages.length > 0 && (
              <div style={{ 
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#e3f2fd',
                border: '1px solid #90caf9',
                borderRadius: '8px'
              }}>
                <p style={{ 
                  fontSize: '13px', 
                  fontWeight: 'bold',
                  color: '#1565c0',
                  margin: '0 0 5px 0'
                }}>
                  현재 선택된 페이지들:
                </p>
                <div style={{ fontSize: '12px', color: '#1565c0' }}>
                  {formData.targetPages.map((path, index) => (
                    <span key={path}>
                      {path}
                      {index < formData.targetPages.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                브랜드 <span style={{ color: '#ff4757' }}>*</span>
              </label>
              <select
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value as Brand })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
                required
              >
                <option value="">브랜드를 선택하세요</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                재고 수량
              </label>
              <input
                type="number"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
                min="0"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                커버 유무
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <input
                  type="checkbox"
                  checked={formData.cover || false}
                  onChange={(e) => setFormData({ ...formData, cover: e.target.checked })}
                  style={{ 
                    marginRight: '10px',
                    transform: 'scale(1.2)'
                  }}
                />
                <span style={{ fontSize: '16px', color: '#666' }}>
                  커버 포함
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                상품 코드
              </label>
              <input
                type="text"
                value={formData.productCode || ''}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                placeholder="예: PRD001"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e1e5e9',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3742fa'}
                onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
              />
            </div>
          </div>


        </div>

        {/* 상품 설명 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', margin: 0 }}>
              상품 설명
            </h2>
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
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'monospace'
            }}
            placeholder="상품에 대한 간단한 설명을 입력하세요..."
          />
          <p style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '10px',
            fontStyle: 'italic'
          }}>
            💡 이미지를 삽입하려면 위의 버튼들을 사용하세요. HTML 태그가 지원됩니다.
          </p>
        </div>

        {/* 상세 정보 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', margin: 0 }}>
              상세 정보
            </h2>
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
            value={formData.detailedDescription || ''}
            onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
            rows={8}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'monospace'
            }}
            placeholder="상품의 상세한 정보, 스펙, 특징 등을 입력하세요..."
          />
          <p style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '10px',
            fontStyle: 'italic'
          }}>
            💡 이미지를 삽입하려면 위의 버튼들을 사용하세요. HTML 태그가 지원됩니다.
          </p>
        </div>

        {/* 상품 이미지 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
            상품 이미지
          </h2>
          
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
              <div 
                style={{
                  border: '2px dashed #007bff',
                  borderRadius: '8px',
                  padding: '30px',
                  textAlign: 'center',
                  backgroundColor: '#f8f9ff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
              <input
                type="file"
                multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                  id="imageUploadEdit"
                />
                <label htmlFor="imageUploadEdit" style={{ 
                  cursor: 'pointer',
                  display: 'block',
                  width: '100%'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: '#007bff',
                    marginBottom: '8px'
                  }}>
                    여러 이미지 파일을 선택하세요
                  </div>
                  <div style={{ 
                  fontSize: '14px',
                  color: '#666',
                    marginBottom: '10px'
                  }}>
                    클릭하거나 파일을 드래그하세요
                  </div>
              </label>
              </div>
              <div style={{ 
                marginTop: '10px',
                padding: '15px',
                backgroundColor: '#e7f3ff',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#0066cc'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>💡 다중 선택 방법:</strong><br/>
                  • <strong>드래그 앤 드롭</strong>: 파일들을 드래그해서 위 영역에 놓기<br/>
                  • <strong>Ctrl + 클릭</strong>: 개별 파일 여러 개 선택<br/>
                  • <strong>Shift + 클릭</strong>: 범위 선택<br/>
                  • <strong>Ctrl + A</strong>: 폴더 내 모든 이미지 선택
                </div>
                <div style={{ 
                  padding: '8px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  border: '1px solid #b3d9ff'
                }}>
                  <strong>📋 지원 형식:</strong> JPG, JPEG, PNG, WebP, GIF<br/>
                  <strong>📏 최대 크기:</strong> 🚀 진짜 무제한 (Vercel 제한 우회!)<br/>
                  <strong>📦 개수 제한:</strong> 무제한 (한 번에 여러 개 업로드 가능)
                </div>
              </div>
            </div>
            
            {/* 선택된 파일 목록 */}
            {selectedFiles.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: '#28a745' }}>
                  ✅ 선택된 파일 ({selectedFiles.length}개)
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      padding: '12px',
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {/* 이미지 미리보기 */}
                      <div style={{
                        width: '100%',
                        height: '120px',
                      backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      
                      {/* 파일 정보 */}
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px', wordBreak: 'break-all' }}>
                          {file.name}
                        </div>
                        <div>크기: {formatFileSize(file.size)}</div>
                      </div>
                      
                      {/* 제거 버튼 */}
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️ 제거
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 선택된 파일 안내 */}
            {selectedFiles.length > 0 && (
              <div style={{
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                textAlign: 'center'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  color: '#28a745',
                  marginBottom: '8px'
                }}>
                  📁 {selectedFiles.length}개 파일이 선택되었습니다
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  🚀 &quot;변경사항 저장&quot; 버튼을 누르면 무제한 직접 업로드가 시작됩니다
                </div>
              </div>
            )}
          </div>

          {/* URL 직접 입력 섹션 */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>이미지 URL 직접 입력</h3>
              <button
                type="button"
                onClick={handleImageUrlAdd}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2ed573',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                + URL 추가
              </button>
            </div>
            
            {/* 이미지 URL 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formData.images.map((url, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={url}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageUrlRemove(index)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ff4757',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
              
              {formData.images.length === 0 && (
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                  이미지를 추가하려면 파일 업로드 또는 URL 추가 버튼을 사용하세요.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 상품 스펙 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#333' }}>상품 스펙</h2>
            <button
              type="button"
              onClick={handleSpecificationAdd}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2ed573',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              + 스펙 추가
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(formData.specifications).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={key}
                  readOnly
                  style={{
                    width: '200px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    backgroundColor: '#f8f9fa',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setFormData({
                    ...formData,
                    specifications: { ...formData.specifications, [key]: e.target.value }
                  })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSpecificationRemove(key)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#ff4757',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
            
            {Object.keys(formData.specifications).length === 0 && (
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                스펙을 추가하려면 위의 버튼을 클릭하세요.
              </p>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px',
          padding: '20px 0'
        }}>
          <Link
            href="/admin/products"
            style={{
              padding: '12px 30px',
              backgroundColor: '#f1f2f6',
              color: '#333',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 30px',
              backgroundColor: saving ? '#ddd' : '#3742fa',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {saving ? (
              uploadingImages ? (
                uploadProgress.total > 0 ? (
                  <>🚀 무제한 직접 업로드 중... ({uploadProgress.current}/{uploadProgress.total})</>
                ) : (
                  <>🚀 무제한 업로드 준비 중...</>
                )
              ) : (
                <>💾 상품 저장 중...</>
              )
            ) : selectedFiles.length > 0 ? (
              <>🚀 변경사항 저장 + {selectedFiles.length}개 이미지 업로드</>
            ) : (
              <>📝 변경사항 저장</>
            )}
          </button>
        </div>
      </form>

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