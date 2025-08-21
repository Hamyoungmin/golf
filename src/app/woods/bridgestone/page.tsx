'use client';

import { useState, useEffect } from 'react';
import ProductList from '@/components/ProductList';
import { getProductsForPage } from '@/lib/products';
import { Product } from '@/types';

export default function BridgestoneWoods() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const bridgestoneProducts = await getProductsForPage('woods/bridgestone');
        setProducts(bridgestoneProducts);
      } catch (error) {
        console.error('브리지스톤 우드 상품 로딩 실패:', error);
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
      title="브리지스톤 우드"
      subtitle="| BRIDGESTONE WOODS"
      products={formattedProducts}
      totalCount={products.length}
      category="브리지스톤 우드"
    />
  );
}