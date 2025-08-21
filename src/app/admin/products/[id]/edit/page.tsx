'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct, updateProduct } from '@/lib/products';
import { uploadMultipleProductImages, formatFileSize, isValidImageFile } from '@/lib/imageUpload';
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
    stock: 0,
    specifications: {} as { [key: string]: string },
    images: [] as string[],
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    targetPages: [] as string[],
  });

  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const brands: Brand[] = ['titleist', 'taylormade', 'callaway', 'honma', 'xxio', 'bridgestone', 'others'];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
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
          stock: productData.stock,
          specifications: productData.specifications || {},
          images: productData.images || [],
          isWomens: productData.isWomens,
          isKids: productData.isKids,
          isLeftHanded: productData.isLeftHanded,
          targetPages: productData.targetPages || [],
        });
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
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.brand) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      await updateProduct(productId, {
        name: formData.name,
        price: formData.price,
        brand: formData.brand as Brand,
        description: formData.description,
        stock: formData.stock,
        specifications: formData.specifications,
        images: formData.images.length > 0 ? formData.images : ['/placeholder.jpg'],
        isWomens: formData.isWomens,
        isKids: formData.isKids,
        isLeftHanded: formData.isLeftHanded,
        // targetPages와 category는 수정하지 않음 (기존 값 유지)
      });

      alert('상품이 수정되었습니다.');
      router.push('/admin/products');
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert('상품 수정에 실패했습니다.');
    } finally {
      setSaving(false);
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

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      if (isValidImageFile(file)) {
        if (file.size <= 5 * 1024 * 1024) { // 5MB 제한
          validFiles.push(file);
        } else {
          invalidFiles.push(`${file.name} (파일 크기가 5MB를 초과합니다)`);
        }
      } else {
        invalidFiles.push(`${file.name} (지원하지 않는 파일 형식입니다)`);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`다음 파일들을 업로드할 수 없습니다:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    // input 초기화
    e.target.value = '';
  };

  // 선택된 파일 제거
  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 파일 업로드
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls = await uploadMultipleProductImages(selectedFiles, formData.name);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      setSelectedFiles([]);
      alert(`${uploadedUrls.length}개의 이미지가 업로드되었습니다.`);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImages(false);
    }
  };

  // 스펙 추가
  const handleSpecificationAdd = () => {
    const key = prompt('스펙 이름을 입력하세요 (예: 샤프트):');
    if (key) {
      const value = prompt(`${key}의 값을 입력하세요:`);
      if (value) {
        setFormData({
          ...formData,
          specifications: { ...formData.specifications, [key]: value },
        });
      }
    }
  };

  // 스펙 제거
  const handleSpecificationRemove = (key: string) => {
    const { [key]: _, ...rest } = formData.specifications;
    setFormData({ ...formData, specifications: rest });
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
                value={formData.name}
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
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                브랜드 <span style={{ color: '#ff4757' }}>*</span>
              </label>
              <select
                value={formData.brand}
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
                value={formData.stock}
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


        </div>

        {/* 상품 설명 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
            상품 설명
          </h2>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder="상품에 대한 상세한 설명을 입력하세요..."
          />
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
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>파일 업로드</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="image-file-input"
              />
              <label
                htmlFor="image-file-input"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f1f2f6',
                  border: '2px dashed #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#666',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e1e5e9';
                  e.currentTarget.style.borderColor = '#3742fa';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f2f6';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                📁 이미지 파일 선택 (JPG, PNG, GIF, WebP - 최대 5MB)
              </label>
              
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={uploadingImages}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: uploadingImages ? '#ddd' : '#3742fa',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: uploadingImages ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {uploadingImages ? '업로드 중...' : `${selectedFiles.length}개 파일 업로드`}
                </button>
              )}
            </div>
            
            {/* 선택된 파일 목록 */}
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '5px', color: '#666' }}>선택된 파일:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}>
                      <span>{file.name} ({formatFileSize(file.size)})</span>
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        style={{
                          color: '#ff4757',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
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
            {saving ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}