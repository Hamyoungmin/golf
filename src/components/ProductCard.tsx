'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProductReservationStatus } from '@/lib/productReservations';
import { getProduct, getProductWishlistCount } from '@/lib/products';

interface Product {
  id: number | string;
  name: string;
  price: string;
  image: string | null;
}

interface ProductCardProps {
  product: Product;
  category?: string;
}

const ProductCard = ({ product, category }: ProductCardProps) => {
  const [stock, setStock] = useState<number>(0);
  const [views, setViews] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isReserved, setIsReserved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 모든 상품을 /products/[id] 경로로 통일
  const getCategoryPath = () => {
    return 'products';
  };

  // 상품 정보와 상태 확인
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // 상품 정보 가져오기 (재고와 조회수 포함)
        const productData = await getProduct(String(product.id));
        if (productData) {
          setStock(productData.stock);
          setViews(productData.views || 0);
        }

        // 위시리스트 개수 가져오기
        const wishlistCountData = await getProductWishlistCount(String(product.id));
        setWishlistCount(wishlistCountData);

        // 예약 상태 확인
        const reservationStatus = await getProductReservationStatus(String(product.id));
        setIsReserved(reservationStatus.isReserved);
      } catch (error) {
        console.error('상품 데이터 가져오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [product.id]);

  // 상태 텍스트 결정
  const getStatusText = () => {
    if (loading) return '';
    if (stock === 0) return '재고 없음';
    if (isReserved) return '예약중';
    return '';
  };

  const getStatusColor = () => {
    if (stock === 0) return '#dc3545'; // 빨간색
    if (isReserved) return '#fd7e14'; // 주황색
    return '#666';
  };

  const categoryPath = getCategoryPath();
  const statusText = getStatusText();

  return (
    <div className="product-card" style={{ position: 'relative', cursor: 'pointer' }}>
      <Link href={`/${categoryPath}/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-image">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              width={250}
              height={200}
              style={{objectFit: 'cover'}}
            />
          ) : (
            <span>이미지 없음</span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-price">{product.price}</p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginTop: '10px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {loading ? '...' : wishlistCount}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                {loading ? '...' : views}
              </span>
              {statusText && (
                <span style={{ 
                  color: getStatusColor(),
                  fontWeight: '600',
                  fontSize: '13px'
                }}>
                  {statusText}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;