'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

// 우드 상품 데이터
const woodProducts = [
  { id: 1, name: '타이틀리스트 917 우드', price: '150,000원', image: '/o2.png', description: '타이틀리스트의 917 시리즈 우드입니다.' },
  { id: 2, name: 'RMX218 15도 모듀스 120 X', price: '가격문의', image: null, description: 'RMX218 15도 우드입니다.' },
  { id: 3, name: 'G425 MAX 15도 알타 CB 60 SR', price: '가격문의', image: null, description: 'G425 MAX 우드입니다.' },
  { id: 4, name: 'SIM MAX 15도 벤타스 TR 6 S', price: '가격문의', image: null, description: 'SIM MAX 우드입니다.' },
  { id: 5, name: 'MAVRIK 18도 Project X 6.0', price: '가격문의', image: null, description: 'MAVRIK 우드입니다.' },
  { id: 6, name: 'M6 19도 퓨젼 4 S', price: '가격문의', image: null, description: 'M6 우드입니다.' },
  { id: 7, name: 'RMX216 18도 바사라 S', price: '가격문의', image: null, description: 'RMX216 우드입니다.' },
  { id: 8, name: 'G410 21도 알타 CB 65 S', price: '가격문의', image: null, description: 'G410 우드입니다.' },
  { id: 9, name: 'TW737 18도 투어AD 7S', price: '가격문의', image: null, description: 'TW737 우드입니다.' },
  { id: 10, name: 'SIM 19도 텐세이 AV 75 S', price: '가격문의', image: null, description: 'SIM 우드입니다.' },
  { id: 11, name: 'RMX118 15도 투어AD MJ 7S', price: '가격문의', image: null, description: 'RMX118 우드입니다.' },
  { id: 12, name: 'KING F9 SPEEDBACK 15도 퓨젼 5 S', price: '가격문의', image: null, description: 'KING F9 SPEEDBACK 우드입니다.' },
  { id: 13, name: 'TW747 455 18도 디아마나 7S', price: '가격문의', image: null, description: 'TW747 455 우드입니다.' },
  { id: 14, name: 'G425 LST 15도 투어 173-65 S', price: '가격문의', image: null, description: 'G425 LST 우드입니다.' },
  { id: 15, name: 'M4 19도 퓨젼 5 SR', price: '가격문의', image: null, description: 'M4 우드입니다.' },
  { id: 16, name: 'RMX220 21도 투어AD DI 7S', price: '가격문의', image: null, description: 'RMX220 우드입니다.' },
  { id: 17, name: 'SIM2 MAX 18도 벤타스 5 S', price: '가격문의', image: null, description: 'SIM2 MAX 우드입니다.' },
  { id: 18, name: 'STEALTH 19도 텐세이 1K 6S', price: '가격문의', image: null, description: 'STEALTH 우드입니다.' },
  { id: 19, name: 'G430 MAX 15도 알타 CB 60 S', price: '가격문의', image: null, description: 'G430 MAX 우드입니다.' },
  { id: 20, name: 'RMX VD 18도 디아마나 70 S', price: '가격문의', image: null, description: 'RMX VD 우드입니다.' }
];

export default function WoodProductPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [quantity, setQuantity] = useState(1);
  
  // 해당 ID의 우드 상품 찾기
  const product = woodProducts.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">상품을 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 우드 상품이 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  // 최근 본 상품에 추가
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id.toString());
    }
  }, [product?.id, addToRecentlyViewed]);

  const handleAddToCart = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, '')) || 0;
    addToCart(product.id.toString(), quantity, numericPrice);
    
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
      category: '우드'
    };

    if (isInWishlist(product.id.toString())) {
      removeFromWishlist(product.id.toString());
    } else {
      addToWishlist(product.id.toString());
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
                  isInWishlist(product.id.toString())
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isInWishlist(product.id.toString()) ? '♥' : '♡'}
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">상품 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">카테고리:</span>
                <span className="text-gray-800">우드</span>
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
