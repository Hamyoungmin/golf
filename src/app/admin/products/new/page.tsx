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
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          상품 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">새 상품 등록</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value as Brand })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">재고 수량</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 상품 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상품 설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="상품에 대한 상세한 설명을 입력하세요..."
            />
          </div>

          {/* 이미지 URL */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">이미지 URL</label>
              <button
                type="button"
                onClick={handleImageUrlAdd}
                className="text-sm text-green-600 hover:text-green-700"
              >
                + 이미지 추가
              </button>
            </div>
            <div className="space-y-2">
              {formData.images.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageUrlRemove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <p className="text-sm text-gray-500">이미지를 추가하려면 위의 버튼을 클릭하세요.</p>
              )}
            </div>
          </div>

          {/* 스펙 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">상품 스펙</label>
              <button
                type="button"
                onClick={handleSpecificationAdd}
                className="text-sm text-green-600 hover:text-green-700"
              >
                + 스펙 추가
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={key}
                    readOnly
                    className="w-1/3 border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                  />
                  <input
                    type="text"
                    value={value}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleSpecificationRemove(key)}
                    className="text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              ))}
              {Object.keys(formData.specifications).length === 0 && (
                <p className="text-sm text-gray-500">스펙을 추가하려면 위의 버튼을 클릭하세요.</p>
              )}
            </div>
          </div>

          {/* 옵션 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">옵션</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isWomens}
                  onChange={(e) => setFormData({ ...formData, isWomens: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">여성용</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isKids}
                  onChange={(e) => setFormData({ ...formData, isKids: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">키즈용</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isLeftHanded}
                  onChange={(e) => setFormData({ ...formData, isLeftHanded: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">왼손용</span>
              </label>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link
              href="/admin/products"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '등록 중...' : '상품 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
