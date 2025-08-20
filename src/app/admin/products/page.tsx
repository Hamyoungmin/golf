'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import DataTable from '@/components/admin/DataTable';
import { getProducts, deleteProduct } from '@/lib/products';
import { ProductFilter, Category, Brand, Product } from '@/types';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ProductFilter>({});
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories: Category[] = ['drivers', 'irons', 'putters', 'wedges', 'woods', 'utilities'];
  const brands: Brand[] = ['titleist', 'taylormade', 'callaway', 'honma', 'bridgestone', 'others'];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productList = await getProducts(filter, undefined, 20);
      setProducts(productList);
      setTotalPages(Math.ceil(productList.length / 20));
    } catch (error) {
      console.error('상품 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteProduct(id);
      await fetchProducts();
      alert('상품이 삭제되었습니다.');
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(Number(price));
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return <span className="text-red-600 font-medium">품절</span>;
    } else if (stock < 10) {
      return <span className="text-yellow-600 font-medium">부족 ({stock})</span>;
    }
    return <span className="text-green-600">{stock}</span>;
  };

  const columns = [
    {
      key: 'images',
      header: '이미지',
      render: (product: Product) => (
        <img 
          src={product.images[0] || '/placeholder.jpg'} 
          alt={product.name}
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    {
      key: 'name',
      header: '상품명',
      render: (product: Product) => (
        <div>
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">{product.category} / {product.brand}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: '가격',
      render: (product: Product) => formatPrice(product.price),
    },
    {
      key: 'stock',
      header: '재고',
      render: (product: Product) => getStockStatus(product.stock),
    },
    {
      key: 'options',
      header: '옵션',
      render: (product: Product) => (
        <div className="flex gap-1">
          {product.isWomens && <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">여성</span>}
          {product.isKids && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">키즈</span>}
          {product.isLeftHanded && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">왼손</span>}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: '등록일',
      render: (product: Product) => new Date(product.createdAt).toLocaleDateString('ko-KR'),
    },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 style={{ 
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>
            상품 관리
          </h1>
          <Link
            href="/admin/products/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#fff',
              backgroundColor: '#007bff',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            + 새 상품 등록
          </Link>
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
          상품 검색
        </h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="상품명, 카테고리, 브랜드로 검색..."
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
          <button
            onClick={() => setShowFilter(!showFilter)}
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
            필터 {showFilter ? '숨기기' : '보기'}
          </button>
        </div>

        {showFilter && (
          <div style={{ 
            marginTop: '15px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px', 
            paddingTop: '15px', 
            borderTop: '1px solid #e0e0e0' 
          }}>
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
                value={filter.category || ''}
                onChange={(e) => setFilter({ ...filter, category: e.target.value as Category || undefined })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">전체</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
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
                브랜드
              </label>
              <select
                value={filter.brand || ''}
                onChange={(e) => setFilter({ ...filter, brand: e.target.value as Brand || undefined })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">전체</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
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
                재고 상태
              </label>
              <select
                value={filter.inStock === undefined ? '' : filter.inStock.toString()}
                onChange={(e) => setFilter({ ...filter, inStock: e.target.value === '' ? undefined : e.target.value === 'true' })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">전체</option>
                <option value="true">재고 있음</option>
                <option value="false">품절</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 상품 테이블 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          상품 목록 ({filteredProducts.length}개)
        </h3>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}>
          <DataTable
            data={filteredProducts}
            columns={columns}
            loading={loading}
            emptyMessage="등록된 상품이 없습니다."
            actions={(product) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => router.push(`/admin/products/${product.id}/edit`)}
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
                  onClick={() => handleDelete(product.id)}
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
            )}
          />
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                color: currentPage === 1 ? '#999' : '#333',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: page === currentPage ? '#007bff' : '#fff',
                  color: page === currentPage ? '#fff' : '#333',
                  cursor: 'pointer'
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                color: currentPage === totalPages ? '#999' : '#333',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              다음
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
