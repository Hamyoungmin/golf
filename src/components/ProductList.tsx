'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import Pagination from './Pagination';

interface Product {
  id: number | string;
  name: string;
  price: string;
  image: string | null;
  stock?: number; // 재고 정보 추가
}

interface ProductListProps {
  title: string;
  subtitle: string;
  products: Product[];
  totalCount: number;
  category: string;
}

const ProductList = ({ title, subtitle, products, totalCount, category }: ProductListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const productsPerPage = 20;
  
  // 검색어에 따른 상품 필터링 및 재고 기준 정렬
  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // 먼저 재고 상태로 정렬 (재고 있음 > 재고 없음)
      const aStock = a.stock ?? 1; // stock이 undefined면 재고 있는 것으로 처리
      const bStock = b.stock ?? 1;
      const aHasStock = aStock > 0;
      const bHasStock = bStock > 0;
      
      if (aHasStock && !bHasStock) return -1; // a가 앞에
      if (!aHasStock && bHasStock) return 1;  // b가 앞에
      
      // 재고 상태가 같으면 이름순 정렬
      return a.name.localeCompare(b.name);
    });
  
  const filteredTotalCount = filteredProducts.length;
  const totalPages = Math.ceil(filteredTotalCount / productsPerPage);
  
  // 현재 페이지에 표시할 상품들 계산 (필터링된 상품들 기준)
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  
  // 검색어 변경 시 첫 페이지로 이동
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // 검색어 초기화
  const handleSearchClear = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      
      {/* 검색바를 독립적으로 배치 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        margin: '20px 0',
        paddingBottom: '10px'
      }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder={`${category} 검색...`}
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              padding: '12px 45px 12px 20px',
              border: '1px solid #ddd',
              borderRadius: '25px',
              width: '320px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: '#f8f9fa',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#007bff';
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd';
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.boxShadow = 'none';
            }}
          />
          
          {/* 검색 아이콘 */}
          {!searchTerm && (
            <svg 
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#999',
                pointerEvents: 'none'
              }}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          )}
          
          {/* 초기화 버튼 */}
          {searchTerm && (
            <button
              onClick={handleSearchClear}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="product-controls">
        <div className="product-count">
          <strong>{category}</strong> &quot;{searchTerm ? filteredTotalCount : totalCount}&quot;
          {searchTerm && (
            <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>
              (전체 {totalCount}개 중 검색 결과)
            </span>
          )}
        </div>
      </div>
      
      <div className="product-grid">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} category={category} />
          ))
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            gridColumn: '1 / -1', // 전체 그리드 컬럼을 차지
            color: '#666'
          }}>
            {searchTerm ? (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '16px', opacity: 0.5 }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                  검색 결과가 없습니다
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#999' }}>
                  "{searchTerm}"에 대한 {category} 상품을 찾을 수 없습니다.
                </p>
                <button
                  onClick={handleSearchClear}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  전체 상품 보기
                </button>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                  상품이 없습니다
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
                  아직 등록된 {category} 상품이 없습니다.
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      {totalPages > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ProductList;
