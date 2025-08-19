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
  { id: 1, name: '캘러웨이 로그 드라이버', price: '140,000원', image: '/d1.jpg', description: '캘러웨이의 최신 로그 드라이버입니다. 뛰어난 관용성과 비거리를 제공하며, 모든 골퍼에게 적합한 성능을 자랑합니다. 혁신적인 AI 설계와 첨단 소재로 완성된 프리미엄 드라이버입니다.', stock: 1 },
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
                <h4 className="font-semibold text-gray-800 mb-2">캘러웨이 드라이버 특징</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI 기술을 활용한 최적화된 설계</li>
                  <li>• 뛰어난 관용성과 비거리 성능</li>
                  <li>• 프리미엄 소재와 첨단 기술 적용</li>
                  <li>• 모든 레벨의 골퍼에게 적합</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">추천 골퍼</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-medium text-blue-600">초보자</div>
                    <div className="text-gray-600 mt-1">쉬운 컨트롤</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-medium text-blue-600">중급자</div>
                    <div className="text-gray-600 mt-1">안정적 비거리</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded">
                    <div className="font-medium text-blue-600">상급자</div>
                    <div className="text-gray-600 mt-1">정밀한 샷</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">상세 스펙</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">헤드 소재:</span>
                    <span className="font-medium">티타늄</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">페이스 소재:</span>
                    <span className="font-medium">고강도 카본</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">로프트각:</span>
                    <span className="font-medium">10.5도</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">헤드 볼륨:</span>
                    <span className="font-medium">460cc</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">클럽 길이:</span>
                    <span className="font-medium">45.5인치</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-1">
                    <span className="text-gray-600">브랜드:</span>
                    <span className="font-medium">Callaway</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">캘러웨이 브랜드 혜택</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 캘러웨이 공식 A/S 서비스 제공</li>
                  <li>• 전문 피팅 서비스 이용 가능</li>
                  <li>• 프리미엄 샤프트 옵션 선택</li>
                  <li>• 캘러웨이 멤버십 혜택 제공</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">구매 전 확인사항</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 개인의 스윙 스타일에 따라 성능이 달라질 수 있습니다</li>
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