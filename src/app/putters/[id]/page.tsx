'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { getProduct } from '@/lib/products';
import { Product } from '@/types';

export default function PutterProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProduct(productId);
        
        if (productData) {
          setProduct(productData);
          if (user?.uid) {
            addToRecentlyViewed(user.uid, productId);
          }
        } else {
          router.push('/putters');
        }
      } catch (error) {
        console.error('상품 로딩 실패:', error);
        router.push('/putters');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, user?.uid, addToRecentlyViewed, router]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user?.uid && productId) {
        const inWishlist = await isInWishlist(user.uid, productId);
        setIsWishlisted(inWishlist);
      }
    };

    checkWishlistStatus();
  }, [user?.uid, productId, isInWishlist]);

  const handleAddToCart = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (product && product.stock > 0) {
      addToCart({
        productId: product.id,
        quantity: quantity,
        selectedOptions: {}
      });
      alert('장바구니에 추가되었습니다.');
    } else {
      alert('재고가 부족합니다.');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!product) return;

    try {
      if (isWishlisted) {
        await removeFromWishlist(user.uid, product.id);
        setIsWishlisted(false);
        alert('위시리스트에서 제거되었습니다.');
      } else {
        await addToWishlist(user.uid, product.id);
        setIsWishlisted(true);
        alert('위시리스트에 추가되었습니다.');
      }
    } catch (error) {
      console.error('위시리스트 처리 실패:', error);
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>상품 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        
        <div>
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            width={500}
            height={400}
            style={{
              width: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
          />
        </div>

        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
            {product.name}
          </h1>
          
          <p style={{ fontSize: '24px', color: '#e74c3c', fontWeight: 'bold', marginBottom: '20px' }}>
            {product.price}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <p><strong>브랜드:</strong> {product.brand}</p>
            <p><strong>카테고리:</strong> {product.category}</p>
            <p><strong>재고:</strong> {product.stock > 0 ? `${product.stock}개` : '품절'}</p>
            {product.cover !== undefined && (
              <p><strong>커버:</strong> {product.cover ? '포함' : '미포함'}</p>
            )}
            {product.productCode && (
              <p><strong>상품코드:</strong> {product.productCode}</p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>상품 설명:</p>
            <p style={{ lineHeight: '1.6' }}>{product.description}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>수량:</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              style={{
                width: '80px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: product.stock > 0 ? '#3498db' : '#bdc3c7',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: product.stock > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              {product.stock > 0 ? '장바구니 담기' : '품절'}
            </button>
            
            <button
              onClick={handleWishlistToggle}
              style={{
                padding: '12px',
                backgroundColor: isWishlisted ? '#e74c3c' : '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {isWishlisted ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>

      {Object.keys(product.specifications).length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>상품 사양</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}