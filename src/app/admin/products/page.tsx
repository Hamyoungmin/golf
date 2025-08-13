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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">상품 관리</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          새 상품 등록
        </Link>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="상품명, 카테고리, 브랜드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            필터
          </button>
        </div>

        {showFilter && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter({ ...filter, category: e.target.value as Category || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">전체</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">브랜드</label>
              <select
                value={filter.brand || ''}
                onChange={(e) => setFilter({ ...filter, brand: e.target.value as Brand || undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">전체</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">재고 상태</label>
              <select
                value={filter.inStock === undefined ? '' : filter.inStock.toString()}
                onChange={(e) => setFilter({ ...filter, inStock: e.target.value === '' ? undefined : e.target.value === 'true' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
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
      <div className="bg-white shadow rounded-lg">
        <DataTable
          data={filteredProducts}
          columns={columns}
          loading={loading}
          emptyMessage="등록된 상품이 없습니다."
          actions={(product) => (
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                className="text-blue-600 hover:text-blue-900"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        />
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-green-50 border-green-500 text-green-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              다음
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
