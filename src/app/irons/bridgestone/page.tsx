'use client';

import { useState, useEffect } from 'react';
import ProductList from '@/components/ProductList';
import { getProductsForPage } from '@/lib/products';
import { formatPrice } from '@/utils/priceUtils';
import { Product } from '@/types';

export default function BridgestoneIrons() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // 'irons/bridgestone' 페이지에 표시될 상품들 가져오기
        const bridgestoneProducts = await getProductsForPage('irons/bridgestone');
        setProducts(bridgestoneProducts);
      } catch (error) {
        console.error('브리지스톤 아이언 상품 로딩 실패:', error);
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
    price: formatPrice(product.price),
    image: product.images?.[0] || '/placeholder.jpg',
    stock: product.stock // 재고 정보 포함
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
      title="브리지스톤 아이언"
      subtitle="| BRIDGESTONE IRONS"
      products={formattedProducts}
      totalCount={products.length}
      category="브리지스톤 아이언"
    />
  );
}
