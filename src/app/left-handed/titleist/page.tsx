'use client';

import { useState, useEffect } from 'react';
import ProductList from '@/components/ProductList';
import { getProductsForPage } from '@/lib/products';
import { formatPrice } from '@/utils/priceUtils';
import { Product } from '@/types';

export default function TitleistLeftHanded() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const titleistProducts = await getProductsForPage('left-handed/titleist');
        setProducts(titleistProducts);
      } catch (error) {
        console.error('타이틀리스트 왼손용 상품 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    price: formatPrice(product.price),
    image: product.images?.[0] || '/placeholder-driver.jpg'
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
      title="타이틀리스트 왼손용"
      subtitle="| TITLEIST LEFT-HANDED"
      products={formattedProducts}
      totalCount={products.length}
      category="타이틀리스트 왼손용"
    />
  );
}