'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

// 드라이버 상품 데이터
const driverProducts = [
  { id: 1, name: '캘러웨이 로그 드라이버', price: '140,000원', image: '/d1.jpg', description: '캘러웨이의 최신 로그 드라이버입니다.' },
  { id: 2, name: 'TR20 9.5도 비자드 43 S', price: '가격문의', image: null, description: 'TR20 고성능 드라이버입니다.' },
  { id: 3, name: '703리미티드 9.5도 TRPX FLEX SX', price: '가격문의', image: null, description: '703 리미티드 에디션 드라이버입니다.' },
  { id: 4, name: '703 8.5도 디아마나 7S', price: '가격문의', image: null, description: '703 드라이버 디아마나 샤프트 버전입니다.' },
  { id: 5, name: 'KING F6 10.5도 5S', price: '가격문의', image: null, description: 'KING F6 고성능 드라이버입니다.' },
  { id: 6, name: 'RMX216 10.5도 바사라 R', price: '가격문의', image: null, description: 'RMX216 드라이버입니다.' },
  { id: 7, name: 'Z545 9.5도 RX-45 S', price: '가격문의', image: null, description: 'Z545 드라이버입니다.' },
  { id: 8, name: '투어B JGR 10.5도 TG2-5 SR', price: '가격문의', image: null, description: '투어B JGR 드라이버입니다.' },
  { id: 9, name: '투어B XD-3 9.5도 TX1 - 6S', price: '가격문의', image: null, description: '투어B XD-3 드라이버입니다.' },
  { id: 10, name: 'J 015 9.5도 디아마나 BF 6S', price: '가격문의', image: null, description: 'J 015 드라이버입니다.' },
  { id: 11, name: '스트롱럭 420 10.5도 래버 아모드 레디 로클롤 6X', price: '가격문의', image: null, description: '스트롱럭 420 드라이버입니다.' },
  { id: 12, name: '온오프 파워트렌치 10도 60 S', price: '가격문의', image: null, description: '온오프 파워트렌치 드라이버입니다.' },
  { id: 13, name: 'RMX218 9.5도 디아마나 60 S', price: '가격문의', image: null, description: 'RMX218 드라이버입니다.' },
  { id: 14, name: 'RS F 10.5도 SR', price: '가격문의', image: null, description: 'RS F 드라이버입니다.' },
  { id: 15, name: 'TW737 455 9.5도 비자드 S', price: '가격문의', image: null, description: 'TW737 455 드라이버입니다.' },
  { id: 16, name: 'TW747 460 10.5도 SR', price: '가격문의', image: null, description: 'TW747 460 드라이버입니다.' },
  { id: 17, name: 'XR16 10.5도 SR', price: '가격문의', image: null, description: 'XR16 드라이버입니다.' },
  { id: 18, name: 'TOUR B XD-3 9.5도 디아마나BF 6S', price: '가격문의', image: null, description: 'TOUR B XD-3 드라이버입니다.' },
  { id: 19, name: 'GR 10.5도 SR', price: '가격문의', image: null, description: 'GR 드라이버입니다.' },
  { id: 20, name: 'ROUGR SUBZERO 10.5도 SR', price: '가격문의', image: null, description: 'ROUGR SUBZERO 드라이버입니다.' }
];

export default function DriverProductPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [quantity, setQuantity] = useState(1);
  
  // 해당 ID의 드라이버 상품 찾기
  const product = driverProducts.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">상품을 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 드라이버 상품이 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  // 최근 본 상품에 추가
  useEffect(() => {
    addToRecentlyViewed({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: '드라이버'
    });
  }, [product, addToRecentlyViewed]);

  const handleAddToCart = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    addToCart({
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
    
    alert('장바구니에 추가되었습니다.');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: '드라이버'
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(wishlistItem);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span>이미지 없음</span>
              </div>
            )}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold text-green-600">{product.price}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">상품 설명</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">수량:</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                장바구니에 담기
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-lg border transition-colors ${
                  isInWishlist(product.id)
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isInWishlist(product.id) ? '♥' : '♡'}
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">상품 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">카테고리:</span>
                <span className="text-gray-800">드라이버</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상품 ID:</span>
                <span className="text-gray-800">{product.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
