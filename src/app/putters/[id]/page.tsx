'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

// 퍼터 상품 데이터
const putterProducts = [
  { 
    id: 1, 
    name: '퍼터 핑 ANSER2 34인치', 
    price: '130,000원', 
    image: '/p1.jpg', 
    description: '핑의 ANSER2 34인치 퍼터입니다. 클래식한 블레이드 스타일의 디자인과 뛰어난 밸런스로 정확한 거리감과 방향성을 제공합니다. 골프 역사상 가장 성공적인 퍼터 디자인 중 하나인 ANSER의 계보를 이어받은 프리미엄 퍼터입니다.', 
    stock: 8 
  },
  { id: 2, name: 'PING ANSER 2', price: '가격문의', image: null, description: 'PING ANSER 2 퍼터입니다.', stock: 2 },
  { id: 3, name: 'TaylorMade Spider Tour', price: '가격문의', image: null, description: 'TaylorMade Spider Tour 퍼터입니다.', stock: 1 },
  { id: 4, name: 'Odyssey WHITE HOT OG', price: '가격문의', image: null, description: 'Odyssey WHITE HOT OG 퍼터입니다.', stock: 4 },
  { id: 5, name: 'SCOTTY CAMERON Special Select', price: '가격문의', image: null, description: 'SCOTTY CAMERON Special Select 퍼터입니다.', stock: 2 },
  { id: 6, name: 'PING PLD Milled', price: '가격문의', image: null, description: 'PING PLD Milled 퍼터입니다.', stock: 1 },
  { id: 7, name: 'TaylorMade TP Collection', price: '가격문의', image: null, description: 'TaylorMade TP Collection 퍼터입니다.', stock: 3 },
  { id: 8, name: 'Odyssey Tri-Hot 5K', price: '가격문의', image: null, description: 'Odyssey Tri-Hot 5K 퍼터입니다.', stock: 2 },
  { id: 9, name: 'SCOTTY CAMERON Phantom X', price: '가격문의', image: null, description: 'SCOTTY CAMERON Phantom X 퍼터입니다.', stock: 1 },
  { id: 10, name: 'PING Heppler', price: '가격문의', image: null, description: 'PING Heppler 퍼터입니다.', stock: 3 }
];

export default function PutterProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [quantity, setQuantity] = useState(1);
  
  // 해당 ID의 퍼터 상품 찾기
  const product = putterProducts.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">상품을 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 퍼터 상품이 존재하지 않습니다.</p>
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
      return;
    }

    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: '퍼터'
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
            <p className="text-2xl font-semibold text-blue-600">{product.price}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">상품 설명</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
              
              <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                <h4 className="font-semibold text-gray-800 mb-2">성능 특징</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 뛰어난 거리감과 방향성</li>
                  <li>• 클래식한 블레이드 디자인</li>
                  <li>• 부드러운 타감과 소프트 피드백</li>
                  <li>• 정교한 밀링 기술 적용</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">추천 골퍼</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-medium text-blue-600">초보자</div>
                    <div className="text-gray-600 mt-1">직관적인 사용법</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-medium text-blue-600">중급자</div>
                    <div className="text-gray-600 mt-1">정확한 거리감</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-medium text-blue-600">상급자</div>
                    <div className="text-gray-600 mt-1">정밀한 퍼팅</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">상세 스펙</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">헤드 소재:</span>
                    <span className="font-medium">303 스테인리스 스틸</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">페이스 소재:</span>
                    <span className="font-medium">밀드 페이스</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">로프트각:</span>
                    <span className="font-medium">3도</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">라이각:</span>
                    <span className="font-medium">70도</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">클럽 길이:</span>
                    <span className="font-medium">34인치</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">그립:</span>
                    <span className="font-medium">Golf Pride 360 Tour Velvet</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">구매 전 확인사항</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 개인의 퍼팅 스타일에 따라 성능이 달라질 수 있습니다</li>
                  <li>• 정확한 스펙은 매장에서 직접 확인 가능합니다</li>
                  <li>• 중고상품의 경우 실제 상태를 확인해주세요</li>
                  <li>• 교환/반품은 구매 후 7일 이내 가능합니다</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">재고:</span>
                <span className={`text-sm font-medium ${
                  product.stock > 5 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock}개 남음` : '품절'}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">수량:</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      const newQuantity = quantity - 1;
                      if (newQuantity >= 1) {
                        setQuantity(newQuantity);
                      }
                    }}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                    style={{
                      backgroundColor: quantity <= 1 || product.stock === 0 ? '#f3f4f6' : 'white',
                      color: quantity <= 1 || product.stock === 0 ? '#9ca3af' : '#374151'
                    }}
                  >
                    −
                  </button>
                  <span className="w-16 text-center font-semibold text-lg border border-gray-300 rounded-lg py-2 bg-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      const newQuantity = quantity + 1;
                      if (newQuantity <= product.stock) {
                        setQuantity(newQuantity);
                      }
                    }}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                    style={{
                      backgroundColor: quantity >= product.stock || product.stock === 0 ? '#f3f4f6' : 'white',
                      color: quantity >= product.stock || product.stock === 0 ? '#9ca3af' : '#374151'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 찜하기 버튼 */}
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={handleWishlistToggle}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: isInWishlist(product.id.toString()) ? '#ec4899' : 'white',
                  color: isInWishlist(product.id.toString()) ? 'white' : '#ec4899',
                  border: `2px solid #ec4899`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (isInWishlist(product.id.toString())) {
                    e.currentTarget.style.backgroundColor = '#db2777';
                  } else {
                    e.currentTarget.style.backgroundColor = '#fdf2f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isInWishlist(product.id.toString())) {
                    e.currentTarget.style.backgroundColor = '#ec4899';
                  } else {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <svg 
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    transform: isInWishlist(product.id.toString()) ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}
                  fill={isInWishlist(product.id.toString()) ? 'currentColor' : 'none'} 
                  stroke={isInWishlist(product.id.toString()) ? 'none' : 'currentColor'} 
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <span>
                  {isInWishlist(product.id.toString()) ? '관심상품에서 제거' : '관심상품에 추가'}
                </span>
              </button>
            </div>

            {/* 구매 버튼들 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '16px'
            }}>
              {/* 바로 구매 버튼 */}
              <button
                onClick={() => {
                  if (!user) {
                    alert('로그인이 필요합니다.');
                    return;
                  }
                  
                  if (product.stock === 0) {
                    alert('품절된 상품입니다.');
                    return;
                  }
                  
                  if (product.price === '가격문의') {
                    alert('가격 문의 후 구매 가능합니다.');
                    return;
                  }
                  
                  // 상품을 장바구니에 담고 바로 체크아웃으로 이동
                  handleAddToCart();
                }}
                disabled={product.stock === 0 || product.price === '가격문의'}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: product.stock === 0 || product.price === '가격문의' ? '#9ca3af' : '#60a5fa',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: product.stock === 0 || product.price === '가격문의' ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (product.stock > 0 && product.price !== '가격문의') {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.stock > 0 && product.price !== '가격문의') {
                    e.currentTarget.style.backgroundColor = '#60a5fa';
                  }
                }}
              >
                바로 구매
              </button>
              
              {/* 장바구니 버튼 */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || product.price === '가격문의'}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: product.stock === 0 || product.price === '가격문의' ? '#9ca3af' : '#f87171',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: product.stock === 0 || product.price === '가격문의' ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  if (product.stock > 0 && product.price !== '가격문의') {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.stock > 0 && product.price !== '가격문의') {
                    e.currentTarget.style.backgroundColor = '#f87171';
                  }
                }}
              >
                장바구니
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">상품 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">카테고리:</span>
                <span className="text-gray-800">퍼터</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상품 ID:</span>
                <span className="text-gray-800">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">재고 상태:</span>
                <span className={`font-medium ${
                  product.stock > 5 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
