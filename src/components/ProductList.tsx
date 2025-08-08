'use client';

import { useState } from 'react';
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
  
  const productsPerPage = 20;
  const totalPages = Math.ceil(totalCount / productsPerPage);
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    // 실제 정렬 로직은 여기에 구현
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 실제 페이지 변경 로직은 여기에 구현
  };

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
        <select 
          className="sort-select" 
          value={sortBy} 
          onChange={handleSortChange}
        >
          <option value="recent">등록순</option>
          <option value="popular">인기순</option>
          <option value="price-low">낮은가격순</option>
          <option value="price-high">높은가격순</option>
          <option value="reviews">상품평 많은순</option>
          <option value="name">이름순</option>
          <option value="name-desc">이름역순</option>
        </select>
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
