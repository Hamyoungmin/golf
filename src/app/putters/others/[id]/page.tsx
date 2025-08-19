'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

// 기타 퍼터 상품 데이터
const othersPutters = [
  { id: 1, name: '퍼터 핑 ANSER2 34인치', price: '130,000원', image: '/p1.jpg', description: '핑 ANSER2 퍼터입니다. 클래식한 블레이드 스타일의 퍼터로, 뛰어난 정확성과 일관된 롤을 제공합니다. 34인치 길이로 표준 체형의 골퍼에게 적합하며, 프로 골퍼들이 선호하는 클래식한 디자인입니다.', stock: 2 },
  { id: 2, name: 'PING PLD ANSER 2D 블레이드 스틸샤프트', price: '가격문의', image: null, description: '핑 PLD ANSER 2D 퍼터입니다. 프리미엄 라인의 정밀한 블레이드 퍼터입니다.', stock: 1 },
  { id: 3, name: 'PING PLD OSLO 3 말렛 스틸샤프트', price: '가격문의', image: null, description: '핑 PLD OSLO 3 말렛 퍼터입니다. 높은 관용성을 제공하는 말렛 스타일입니다.', stock: 3 },
  { id: 4, name: 'PING VAULT 2.0 DALE ANSER 블레이드 스틸샤프트', price: '가격문의', image: null, description: '핑 VAULT 2.0 퍼터입니다. 클래식한 ANSER 스타일의 고급 퍼터입니다.', stock: 2 },
  { id: 5, name: 'PING HEPPLER PIPER C 말렛 스틸샤프트', price: '가격문의', image: null, description: '핑 HEPPLER PIPER C 퍼터입니다. 현대적인 말렛 디자인의 고성능 퍼터입니다.', stock: 1 },
  { id: 6, name: 'PING HEPPLER TOMCAT 14 말렛 스틸샤프트', price: '가격문의', image: null, description: '핑 HEPPLER TOMCAT 14 퍼터입니다. 독특한 디자인의 말렛 퍼터입니다.', stock: 2 },
  { id: 7, name: 'CLEVELAND HUNTINGTON BEACH SOFT 1 블레이드 스틸샤프트', price: '가격문의', image: null, description: '클리브랜드 HUNTINGTON BEACH SOFT 퍼터입니다. 부드러운 타감의 블레이드 퍼터입니다.', stock: 0 },
  { id: 8, name: 'CLEVELAND TFI 2135 CERO 말렛 스틸샤프트', price: '가격문의', image: null, description: '클리브랜드 TFI 2135 CERO 퍼터입니다. 혁신적인 기술이 적용된 말렛 퍼터입니다.', stock: 3 },
  { id: 9, name: 'MIZUNO M.CRAFT III 블레이드 스틸샤프트', price: '가격문의', image: null, description: '미즈노 M.CRAFT III 퍼터입니다. 일본의 정교한 기술이 담긴 블레이드 퍼터입니다.', stock: 1 },
  { id: 10, name: 'MIZUNO M.CRAFT IV 말렛 스틸샤프트', price: '가격문의', image: null, description: '미즈노 M.CRAFT IV 퍼터입니다. 프리미엄 말렛 스타일의 고급 퍼터입니다.', stock: 2 },
  { id: 11, name: 'YAMAHA RMX PUTTER 01 블레이드 스틸샤프트', price: '가격문의', image: null, description: '야마하 RMX PUTTER 01입니다. 혁신적인 기술이 적용된 블레이드 퍼터입니다.', stock: 1 },
  { id: 12, name: 'YAMAHA RMX PUTTER 02 말렛 스틸샤프트', price: '가격문의', image: null, description: '야마하 RMX PUTTER 02입니다. 뛰어난 성능의 말렛 퍼터입니다.', stock: 3 },
  { id: 13, name: 'COBRA KING VINTAGE PUTTER SUPER SPORT 35 말렛 스틸샤프트', price: '가격문의', image: null, description: '코브라 킹 빈티지 퍼터입니다. 클래식한 디자인의 말렛 퍼터입니다.', stock: 2 },
  { id: 14, name: 'COBRA KING VINTAGE PUTTER COPPER 말렛 스틸샤프트', price: '가격문의', image: null, description: '코브라 킹 빈티지 구리 마감 퍼터입니다. 고급스러운 디자인을 자랑합니다.', stock: 1 },
  { id: 15, name: 'BETTINARDI INOVAI 2.0 블레이드 스틸샤프트', price: '가격문의', image: null, description: '베티나르디 INOVAI 2.0 퍼터입니다. 장인 정신이 담긴 프리미엄 블레이드 퍼터입니다.', stock: 0 },
  { id: 16, name: 'LAB GOLF DF3 BROOMSTICK PUTTER 말렛 스틸샤프트', price: '가격문의', image: null, description: 'LAB GOLF DF3 브룸스틱 퍼터입니다. 혁신적인 브룸스틱 스타일의 말렛 퍼터입니다.', stock: 2 }
];

export default function OthersPutterProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  
  const [quantity, setQuantity] = useState(1);
  
  // 해당 ID의 기타 퍼터 상품 찾기
  const product = othersPutters.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">상품을 찾을 수 없습니다</h1>
          <p className="text-gray-600">요청하신 기타 퍼터 상품이 존재하지 않습니다.</p>
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
                <h4 className="font-semibold text-gray-800 mb-2">기타 브랜드 퍼터 특징</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 다양한 브랜드의 검증된 기술과 디자인</li>
                  <li>• 정밀한 가공과 균형 잡힌 무게 배분</li>
                  <li>• 일관된 롤과 정확한 거리감 제공</li>
                  <li>• 블레이드와 말렛 스타일 다양하게 선택</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">퍼터 스타일별 특징</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-medium text-blue-600">블레이드 스타일</div>
                    <div className="text-gray-600 mt-1">정밀한 거리감</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-medium text-blue-600">말렛 스타일</div>
                    <div className="text-gray-600 mt-1">높은 관용성</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">상세 스펙</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">카테고리:</span>
                    <span className="font-medium">퍼터</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">브랜드:</span>
                    <span className="font-medium">기타</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">길이:</span>
                    <span className="font-medium">34인치</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">헤드 소재:</span>
                    <span className="font-medium">스테인리스 스틸</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">상품 ID:</span>
                    <span className="font-medium">{product.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">상태:</span>
                    <span className="font-medium">중고</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">기타 브랜드 혜택</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 합리적인 가격의 중고 골프용품</li>
                  <li>• 상품 상태 철저 검수</li>
                  <li>• 다양한 브랜드 선택 가능</li>
                  <li>• 전문가 검증 완료</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">퍼터 선택 가이드</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 블레이드 스타일: 정밀한 거리감과 컨트롤 중시</li>
                  <li>• 말렛 스타일: 높은 관용성과 안정성 중시</li>
                  <li>• 퍼터 길이는 개인의 자세와 체형에 맞춰 선택</li>
                  <li>• 그립감과 헤드 무게감이 개인 취향에 맞는지 확인</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">구매 전 확인사항</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 개인의 퍼팅 스타일에 따라 성능이 달라질 수 있습니다</li>
                  <li>• 정확한 스펙은 매장에서 직접 확인 가능합니다</li>
                  <li>• 중고상품의 경우 헤드와 샤프트 상태를 확인해주세요</li>
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
              >
                <svg 
                  style={{ 
                    width: '20px', 
                    height: '20px'
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
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px'
            }}>
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
                  
                  // 바로구매 로직 - 실제 구현 시 결제 페이지로 이동
                  alert('바로구매 기능은 준비 중입니다.');
                }}
                disabled={product.stock === 0 || product.price === '가격문의'}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: product.stock === 0 || product.price === '가격문의' ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: product.stock === 0 || product.price === '가격문의' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg 
                  style={{ 
                    width: '20px', 
                    height: '20px'
                  }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span>바로구매</span>
              </button>

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
                  
                  handleAddToCart();
                }}
                disabled={product.stock === 0 || product.price === '가격문의'}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  backgroundColor: product.stock === 0 || product.price === '가격문의' ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: product.stock === 0 || product.price === '가격문의' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg 
                  style={{ 
                    width: '20px', 
                    height: '20px'
                  }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.188.188-.293.442-.293.707V19a1 1 0 001 1h1m9-6v6a1 1 0 01-1 1H9a1 1 0 01-1-1v-6m8 0V9a1 1 0 00-1-1H9a1 1 0 00-1 1v4.01"/>
                </svg>
                <span>장바구니</span>
              </button>
            </div>

            {product.price === '가격문의' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  📞 가격 문의 상품입니다. 전화나 이메일로 문의 부탁드립니다.
                  <br />
                  전화: 010-7236-8400 | 이메일: crover.kk@gmail.com
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기타 브랜드 정보 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">기타 브랜드 퍼터</h2>
        <p className="text-gray-700 leading-relaxed">
          골프상회에서는 다양한 브랜드의 고품질 중고 퍼터를 합리적인 가격에 제공합니다. 
          모든 상품은 전문가가 철저히 검수하여 품질을 보장하며, 각 브랜드의 고유한 기술과 특성을 경험할 수 있습니다.
          핑(PING), 클리브랜드(CLEVELAND), 미즈노(MIZUNO), 야마하(YAMAHA), 코브라(COBRA), 베티나르디(BETTINARDI) 등 
          다양한 브랜드의 퍼터를 만나보세요. 정밀한 가공과 균형 잡힌 무게 배분으로 일관된 퍼팅을 도와드립니다.
        </p>
      </div>
    </div>
  );
}
