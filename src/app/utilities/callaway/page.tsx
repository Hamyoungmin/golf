'use client';

import { useState, useEffect } from 'react';
import ProductList from '@/components/ProductList';
import { getProductsForPage } from '@/lib/products';
import { Product } from '@/types';

export default function CallawayUtilities() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const callawayProducts = await getProductsForPage('utilities/callaway');
        setProducts(callawayProducts);
      } catch (error) {
        console.error('캘러웨이 유틸리티 상품 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    price: `₩${Number(product.price).toLocaleString()}`,
    image: product.images?.[0] || '/placeholder.jpg'
  }));

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        상품을 불러오는 중...
      </div>
    );
  }

  return (
    <ProductList 
      title="캘러웨이 유틸리티"
      subtitle="| CALLAWAY UTILITIES"
      products={formattedProducts}
      totalCount={products.length}
      category="캘러웨이 유틸리티"
    />
  );
}