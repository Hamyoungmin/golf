'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import Pagination from './Pagination';

interface Product {
  id: number | string;
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
  const [currentPage, setCurrentPage] = useState(1);
  
  const productsPerPage = 20;
  const totalPages = Math.ceil(totalCount / productsPerPage);
  
  // 현재 페이지에 표시할 상품들 계산
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

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
      
      <div className="product-controls">
        <div className="product-count">
          <strong>{category}</strong> &quot;{totalCount}&quot;
        </div>
      </div>
      
      <div className="product-grid">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} category={category} />
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
