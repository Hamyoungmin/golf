'use client';

import { useState, useEffect } from 'react';
import ProductList from '@/components/ProductList';
import { getProductsForPage } from '@/lib/products';
import { Product } from '@/types';

export default function PingDrivers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // 'drivers/ping' 페이지에 표시될 상품들 가져오기
        const pingProducts = await getProductsForPage('drivers/ping');
        setProducts(pingProducts);
      } catch (error) {
        console.error('핑 드라이버 상품 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Product 타입을 ProductList가 기대하는 형태로 변환
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
      title="핑 드라이버"
      subtitle="| PING DRIVERS"
      products={formattedProducts}
      totalCount={products.length}
      category="핑 드라이버"
    />
  );
}
