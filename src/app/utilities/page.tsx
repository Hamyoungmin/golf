'use client';

import { useState, useEffect } from 'react';
import ProductList from '@/components/ProductList';
import { getProductsForPage } from '@/lib/products';
import { Product } from '@/types';

export default function Utilities() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // 'utilities' 페이지에 표시될 상품들 가져오기
        const utilityProducts = await getProductsForPage('utilities');
        setProducts(utilityProducts);
      } catch (error) {
        console.error('유틸리티 상품 로딩 실패:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>유틸리티 상품을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <ProductList 
      title="유틸리티"
      subtitle="| Utilities"
      products={products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0] || null
      }))}
      totalCount={products.length}
      category="유틸리티"
    />
  );
}