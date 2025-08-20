'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addProduct } from '@/lib/products';
import { Category, Brand } from '@/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AdminProductCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '' as Category | '',
    brand: '' as Brand | '',
    description: '',
    stock: 0,
    specifications: {} as { [key: string]: string },
    images: [] as string[],
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
  });

  const categories: Category[] = ['drivers', 'irons', 'putters', 'wedges', 'woods', 'utilities'];
  const brands: Brand[] = ['titleist', 'taylormade', 'callaway', 'honma', 'bridgestone', 'others'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category || !formData.brand) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await addProduct({
        name: formData.name,
        price: formData.price,
        category: formData.category as Category,
        brand: formData.brand as Brand,
        description: formData.description,
        stock: formData.stock,
        specifications: formData.specifications,
        images: formData.images.length > 0 ? formData.images : ['/placeholder.jpg'],
        isWomens: formData.isWomens,
        isKids: formData.isKids,
        isLeftHanded: formData.isLeftHanded,
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

  const handleSpecificationRemove = (key: string) => {
    const { [key]: _, ...rest } = formData.specifications;
    setFormData({ ...formData, specifications: rest });
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
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                  카테고리 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
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
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
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
            </div>
          </div>

          {/* 상품 설명 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              상품 설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="상품에 대한 상세한 설명을 입력하세요..."
            />
          </div>

          {/* 이미지 URL */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                이미지 URL
              </label>
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
                + 이미지 추가
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.images.map((url, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    value={url}
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
                <p style={{ fontSize: '14px', color: '#666' }}>이미지를 추가하려면 위의 버튼을 클릭하세요.</p>
              )}
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

          {/* 옵션 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              옵션
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={formData.isWomens}
                  onChange={(e) => setFormData({ ...formData, isWomens: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>여성용</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={formData.isKids}
                  onChange={(e) => setFormData({ ...formData, isKids: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>키즈용</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={formData.isLeftHanded}
                  onChange={(e) => setFormData({ ...formData, isLeftHanded: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>왼손용</span>
              </label>
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
    </div>
  );
}
