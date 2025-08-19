'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

// 캘러웨이 드라이버 상품 데이터
const callawayDrivers = [
  { id: 1, name: '캘러웨이 로그 드라이버', price: '140,000원', image: '/d1.jpg', description: '캘러웨이의 최신 로그 드라이버입니다. 뛰어난 관용성과 비거리를 제공하며, 모든 골퍼에게 적합한 성능을 자랑합니다.', stock: 1 },
  { id: 2, name: 'PARADYM 10.5도 Project X HZRDUS Smoke IM10 60', price: '가격문의', image: null, description: '캘러웨이 PARADYM 드라이버입니다. 혁신적인 기술과 뛰어난 성능을 제공합니다.', stock: 2 },
  { id: 3, name: 'ROGUE ST MAX 10.5도 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null, description: '캘러웨이 ROGUE ST MAX 드라이버입니다. 최대한의 관용성을 제공합니다.', stock: 1 },
  { id: 4, name: 'EPIC MAX LS 9도 Project X HZRDUS Smoke IM10', price: '가격문의', image: null, description: '캘러웨이 EPIC MAX LS 드라이버입니다. 로우 스핀으로 최대 비거리를 실현합니다.', stock: 3 },
  { id: 5, name: 'EPIC SPEED 9도 Diamana 50 for Callaway S', price: '가격문의', image: null, description: '캘러웨이 EPIC SPEED 드라이버입니다. 스피드와 파워를 극대화합니다.', stock: 2 },
  { id: 6, name: 'EPIC SPEED 10.5도 Diamana 50 for Callaway SR', price: '가격문의', image: null, description: '캘러웨이 EPIC SPEED 드라이버 SR 플렉스입니다.', stock: 1 },
  { id: 7, name: '에픽 스피드 10.5 SR Diamana 50', price: '가격문의', image: null, description: '캘러웨이 에픽 스피드 드라이버입니다.', stock: 0 },
  { id: 8, name: '에픽 맥스 FAST 10.5 R FAST Driver Speeder Evolution', price: '가격문의', image: null, description: '캘러웨이 에픽 맥스 FAST 드라이버입니다.', stock: 2 },
  { id: 9, name: '에픽 플래시 STAR 9.5 S Speeder Evolution for CW', price: '가격문의', image: null, description: '캘러웨이 에픽 플래시 STAR 드라이버입니다.', stock: 1 },
  { id: 10, name: '캘러웨이 에픽 플래시 9.5 Speeder Evolution for CW S', price: '가격문의', image: null, description: '캘러웨이 에픽 플래시 드라이버입니다.', stock: 3 },
  { id: 11, name: 'ROGUE STAR 10.5도 Speeder EVOLUTION R', price: '가격문의', image: null, description: '캘러웨이 ROGUE STAR 드라이버입니다.', stock: 2 },
  { id: 12, name: '로그 ST MAX FAST 10.5 S Speeder NX 40', price: '가격문의', image: null, description: '캘러웨이 로그 ST MAX FAST 드라이버입니다.', stock: 1 },
  { id: 13, name: 'XR16 10.5도 SR', price: '가격문의', image: null, description: '캘러웨이 XR16 드라이버입니다.', stock: 0 }
];

export default function CallawayDriverProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [quantity, setQuantity] = useState(1);
  
  // 해당 ID의 캘러웨이 드라이버 상품 찾기
  const product = callawayDrivers.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">상품을 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 캘러웨이 드라이버 상품이 존재하지 않습니다.</p>
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
      router.push('/login');
      return;
    }
    
    if (product.stock === 0) {
      alert('품절된 상품입니다.');
      return;
    }
    
    if (product.price === '가격문의') {
      alert('가격 문의 상품은 장바구니에 담을 수 없습니다.');
      return;
    }
    
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, '')) || 0;
    addToCart(product.id.toString(), quantity, numericPrice);
    
    alert('장바구니에 추가되었습니다.');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    if (isInWishlist(product.id.toString())) {
      removeFromWishlist(product.id.toString());
    } else {
      addToWishlist(product.id.toString());
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
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
                <span>상품 이미지 준비 중</span>
              </div>
            )}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-blue-600">{product.price}</p>
          </div>

          <div className="bg-white p-4 rounded border-l-4 border-blue-500">
            <h3 className="font-bold mb-2">상품 설명</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2 text-blue-800">추천 골퍼</h3>
            <p className="text-blue-600 text-sm">
              • 비거리 향상을 원하는 모든 레벨의 골퍼
              <br />
              • 정확성과 관용성을 중시하는 골퍼
              <br />
              • 캘러웨이 브랜드를 선호하는 골퍼
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">재고:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
              </span>
            </div>

            {product.stock > 0 && product.price !== '가격문의' && (
              <div className="flex items-center space-x-4">
                <span className="font-medium">수량:</span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 flex items-center justify-center border rounded"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 flex items-center justify-center border rounded"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            {product.price !== '가격문의' && product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                장바구니에 담기
              </button>
            )}
            
            <button
              onClick={handleWishlistToggle}
              style={{
                backgroundColor: isInWishlist(product.id.toString()) ? '#ec4899' : 'white',
                color: isInWishlist(product.id.toString()) ? 'white' : '#ec4899',
                border: `2px solid #ec4899`,
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isInWishlist(product.id.toString()) ? '관심상품 제거' : '관심상품 추가'}
            </button>
          </div>

          {product.price === '가격문의' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                📞 가격 문의 상품입니다. 전화나 이메일로 문의 부탁드립니다.
                <br />
                전화: 010-7236-8400 | 이메일: crover.kk@gmail.com
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 브랜드 정보 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">캘러웨이 (Callaway)</h2>
        <p className="text-gray-700 leading-relaxed">
          캘러웨이는 혁신적인 골프 기술의 선두주자로, 1982년부터 골퍼들에게 최고 품질의 골프 장비를 제공해왔습니다. 
          드라이버, 아이언, 퍼터 등 모든 카테고리에서 최신 기술을 적용하여 골퍼들의 경기력 향상에 기여하고 있습니다.
          특히 AI 기술과 첨단 소재를 활용한 제품 개발로 골프 업계에 혁신을 이끌고 있습니다.
        </p>
      </div>
    </div>
  );
}
