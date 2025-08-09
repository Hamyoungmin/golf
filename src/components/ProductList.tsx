'use client';

import { useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import Pagination from './Pagination';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string | null;
}

interface ProductListProps {
  title: string;
  subtitle: string;
  products: Product[];
  totalCount: number;
  category: string;
}

const ProductList = ({ title, subtitle, products, totalCount, category }: ProductListProps) => {
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const productsPerPage = 20;
  const totalPages = Math.ceil(totalCount / productsPerPage);
  
  const sortOptions = [
    { value: 'recent', label: '등록순' },
    { value: 'popular', label: '인기순' },
    { value: 'price-low', label: '낮은가격순' },
    { value: 'price-high', label: '높은가격순' },
    { value: 'reviews', label: '상품평 많은순' },
    { value: 'name', label: '이름순' },
    { value: 'name-desc', label: '이름역순' }
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setIsDropdownOpen(false);
    // 실제 정렬 로직은 여기에 구현
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 실제 페이지 변경 로직은 여기에 구현
  };

  // 외부 클릭 및 스크롤 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      setIsDropdownOpen(false);
    };

    const handleResize = () => {
      setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); // true for capture phase
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 빈 의존성 배열로 변경

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      
      <div className="product-controls">
        <div className="product-count">
          <strong>{category}</strong> "{totalCount}"
        </div>
        <div className="custom-dropdown" ref={dropdownRef}>
          <button 
            className="sort-select-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{sortOptions.find(option => option.value === sortBy)?.label}</span>
            <svg 
              className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none"
            >
              <path 
                d="M3 4.5L6 7.5L9 4.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <ul className="sort-dropdown-menu">
              {sortOptions.map((option, index) => (
                <li 
                  key={option.value} 
                  className={`sort-dropdown-item ${index === 0 ? 'first' : ''}`}
                  onClick={() => handleSortChange(option.value)}
                >
                  <span className={sortBy === option.value ? 'active' : ''}>
                    {option.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductList;
