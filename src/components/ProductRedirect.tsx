'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductRedirect() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  useEffect(() => {
    if (productId) {
      // /products/[id] 페이지로 리다이렉트
      router.replace(`/products/${productId}`);
    }
  }, [productId, router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px',
      fontSize: '16px',
      color: '#666'
    }}>
      상품 페이지로 이동 중...
    </div>
  );
}
