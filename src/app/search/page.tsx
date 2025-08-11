'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchProducts } from '@/lib/products';
import { Product, ProductFilter, ProductSort } from '@/types';
import ProductCard from '@/components/ProductCard';

// 임시 샘플 상품 데이터
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'TW717 455 10.5도 비자드 55 R',
    price: '가격문의',
    category: 'drivers',
    brand: 'titleist',
    images: ['https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=400&h=300&fit=crop'],
    description: '타이틀리스트의 프리미엄 드라이버입니다.',
    stock: 5,
    specifications: {},
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Callaway Epic Speed 드라이버',
    price: '450,000원',
    category: 'drivers',
    brand: 'callaway',
    images: ['https://images.unsplash.com/photo-1593111774240-d529f12af4ce?w=400&h=300&fit=crop'],
    description: '캘러웨이의 혁신적인 Epic Speed 드라이버입니다.',
    stock: 3,
    specifications: {},
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'TaylorMade SIM2 Max 드라이버',
    price: '380,000원',
    category: 'drivers',
    brand: 'taylormade',
    images: ['https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=400&h=300&fit=crop'],
    description: '테일러메이드의 최신 SIM2 Max 드라이버입니다.',
    stock: 7,
    specifications: {},
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Titleist AP3 아이언세트',
    price: '1,200,000원',
    category: 'irons',
    brand: 'titleist',
    images: ['https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop'],
    description: '타이틀리스트 AP3 아이언세트입니다.',
    stock: 2,
    specifications: {},
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // 필터 상태
  const [filters, setFilters] = useState<ProductFilter>({});
  const [sort, setSort] = useState<ProductSort>({ field: 'createdAt', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  // 검색 수행
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setProducts([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 실제로는 searchProducts(query) 사용
        // 현재는 샘플 데이터에서 필터링
        const filteredProducts = sampleProducts.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );

        // 필터 적용
        let finalProducts = filteredProducts;
        
        if (filters.category) {
          finalProducts = finalProducts.filter(p => p.category === filters.category);
        }
        if (filters.brand) {
          finalProducts = finalProducts.filter(p => p.brand === filters.brand);
        }
        if (filters.isWomens !== undefined) {
          finalProducts = finalProducts.filter(p => p.isWomens === filters.isWomens);
        }
        if (filters.isKids !== undefined) {
          finalProducts = finalProducts.filter(p => p.isKids === filters.isKids);
        }
        if (filters.isLeftHanded !== undefined) {
          finalProducts = finalProducts.filter(p => p.isLeftHanded === filters.isLeftHanded);
        }
        if (filters.inStock) {
          finalProducts = finalProducts.filter(p => p.stock > 0);
        }

        // 정렬 적용
        finalProducts.sort((a, b) => {
          if (sort.field === 'name') {
            return sort.direction === 'asc' 
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          } else if (sort.field === 'price') {
            const aPrice = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
            const bPrice = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
            return sort.direction === 'asc' ? aPrice - bPrice : bPrice - aPrice;
          } else {
            return sort.direction === 'asc' 
              ? a.createdAt.getTime() - b.createdAt.getTime()
              : b.createdAt.getTime() - a.createdAt.getTime();
          }
        });

        setProducts(finalProducts);
        setTotalCount(finalProducts.length);
      } catch (error) {
        console.error('검색 오류:', error);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, filters, sort]);

  const handleFilterChange = (key: keyof ProductFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSortChange = (field: ProductSort['field'], direction: ProductSort['direction']) => {
    setSort({ field, direction });
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">검색</h1>
          <p className="text-gray-600">검색어를 입력해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 검색 결과 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">검색 결과</h1>
        <p className="text-gray-600">
          "<span className="font-semibold">{query}</span>"에 대한 검색 결과 {totalCount}개
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 필터 사이드바 */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">필터</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden text-gray-500"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z"/>
                </svg>
              </button>
            </div>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* 카테고리 필터 */}
              <div>
                <h4 className="font-medium mb-3">카테고리</h4>
                <div className="space-y-2">
                  {['drivers', 'irons', 'putters', 'wedges', 'woods', 'utilities'].map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category}
                        onChange={() => handleFilterChange('category', category)}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {category === 'drivers' ? '드라이버' :
                         category === 'irons' ? '아이언' :
                         category === 'putters' ? '퍼터' :
                         category === 'wedges' ? '웨지' :
                         category === 'woods' ? '우드' :
                         category === 'utilities' ? '유틸리티' : category}
                      </span>
                    </label>
                  ))}
                  <button
                    onClick={() => handleFilterChange('category', undefined)}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    전체
                  </button>
                </div>
              </div>

              {/* 브랜드 필터 */}
              <div>
                <h4 className="font-medium mb-3">브랜드</h4>
                <div className="space-y-2">
                  {['titleist', 'callaway', 'taylormade', 'honma', 'bridgestone'].map(brand => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        checked={filters.brand === brand}
                        onChange={() => handleFilterChange('brand', brand)}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {brand === 'titleist' ? '타이틀리스트' :
                         brand === 'callaway' ? '캘러웨이' :
                         brand === 'taylormade' ? '테일러메이드' :
                         brand === 'honma' ? '혼마' :
                         brand === 'bridgestone' ? '브리지스톤' : brand}
                      </span>
                    </label>
                  ))}
                  <button
                    onClick={() => handleFilterChange('brand', undefined)}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    전체
                  </button>
                </div>
              </div>

              {/* 특수 카테고리 필터 */}
              <div>
                <h4 className="font-medium mb-3">특수 카테고리</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isWomens === true}
                      onChange={(e) => handleFilterChange('isWomens', e.target.checked ? true : undefined)}
                      className="mr-2"
                    />
                    <span className="text-sm">여성용</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isKids === true}
                      onChange={(e) => handleFilterChange('isKids', e.target.checked ? true : undefined)}
                      className="mr-2"
                    />
                    <span className="text-sm">주니어용</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isLeftHanded === true}
                      onChange={(e) => handleFilterChange('isLeftHanded', e.target.checked ? true : undefined)}
                      className="mr-2"
                    />
                    <span className="text-sm">왼손잡이용</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock === true}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked ? true : undefined)}
                      className="mr-2"
                    />
                    <span className="text-sm">재고 있음</span>
                  </label>
                </div>
              </div>

              {/* 필터 초기화 */}
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="flex-1">
          {/* 정렬 옵션 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                총 {totalCount}개 상품
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">정렬:</span>
                <select
                  value={`${sort.field}-${sort.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-') as [ProductSort['field'], ProductSort['direction']];
                    handleSortChange(field, direction);
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="createdAt-desc">최신순</option>
                  <option value="createdAt-asc">오래된순</option>
                  <option value="name-asc">이름순 (가-하)</option>
                  <option value="name-desc">이름순 (하-가)</option>
                  <option value="price-asc">가격 낮은순</option>
                  <option value="price-desc">가격 높은순</option>
                </select>
              </div>
            </div>
          </div>

          {/* 상품 결과 */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-gray-600">검색 중...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600 mb-6">
                다른 검색어를 입력하거나 필터 조건을 조정해보세요.
              </p>
              <div className="space-x-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  필터 초기화
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  전체 상품 보기
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={{
                  id: Number(product.id),
                  name: product.name,
                  price: product.price,
                  image: product.images[0] || null
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
