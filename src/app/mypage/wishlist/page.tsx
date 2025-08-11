'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';

// 임시 찜 목록 데이터 (실제로는 Firebase에서 가져와야 함)
const sampleWishlistProducts: Product[] = [
  {
    id: '1',
    name: 'TW717 455 10.5도 비자드 55 R',
    price: '가격문의',
    category: 'drivers',
    brand: 'titleist',
    images: ['https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=300&h=200&fit=crop'],
    description: '타이틀리스트의 프리미엄 드라이버입니다.',
    stock: 5,
    specifications: {},
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Callaway Epic Speed 드라이버',
    price: '450,000원',
    category: 'drivers',
    brand: 'callaway',
    images: ['https://images.unsplash.com/photo-1593111774240-d529f12af4ce?w=300&h=200&fit=crop'],
    description: '캘러웨이의 혁신적인 Epic Speed 드라이버입니다.',
    stock: 3,
    specifications: {},
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // 찜 목록 로드
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // 실제로는 Firebase에서 찜 목록을 가져와야 함
        // const wishlist = await getUserWishlist(user.uid);
        // setWishlistItems(wishlist);
        
        // 임시로 샘플 데이터 사용
        setWishlistItems(sampleWishlistProducts);
      } catch (error) {
        console.error('찜 목록 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }

    if (confirm(`선택한 ${selectedItems.length}개 상품을 찜 목록에서 제거하시겠습니까?`)) {
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      alert('선택한 상품이 찜 목록에서 제거되었습니다.');
    }
  };

  const handleRemoveItem = (productId: string) => {
    if (confirm('이 상품을 찜 목록에서 제거하시겠습니까?')) {
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      setSelectedItems(prev => prev.filter(id => id !== productId));
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.price === '가격문의') {
      alert('가격 문의 상품은 장바구니에 담을 수 없습니다.');
      return;
    }
    // 장바구니 추가 로직 (추후 구현)
    alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">찜 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">찜 목록</h1>
          <p className="text-gray-600 mt-2">관심 있는 상품을 모아보세요.</p>
        </div>
        <Link 
          href="/mypage"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← 마이페이지
        </Link>
      </div>

      {/* 찜 목록 */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white border rounded-lg p-16 text-center">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">찜한 상품이 없습니다</h3>
          <p className="text-gray-600 mb-6">마음에 드는 상품을 찜해보세요.</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <>
          {/* 선택/삭제 컨트롤 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === wishlistItems.length}
                    onChange={handleSelectAll}
                    className="mr-2"
                  />
                  <span className="text-sm">전체 선택</span>
                </label>
                <span className="text-sm text-gray-600">
                  총 {wishlistItems.length}개 상품 중 {selectedItems.length}개 선택
                </span>
              </div>
              <button
                onClick={handleRemoveSelected}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
              >
                선택 삭제
              </button>
            </div>
          </div>

          {/* 상품 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* 선택 체크박스 */}
                <div className="p-3 border-b">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => handleSelectItem(product.id)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">선택</span>
                  </label>
                </div>

                {/* 상품 이미지 */}
                <div className="relative">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-w-4 aspect-h-3 bg-gray-100">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center text-gray-400">
                          이미지 없음
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  {/* 찜 제거 버튼 */}
                  <button
                    onClick={() => handleRemoveItem(product.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>

                {/* 상품 정보 */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.brand}
                    </span>
                  </div>
                  
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-orange-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="font-semibold text-orange-600 mb-3">
                    {product.price}
                  </p>

                  {/* 재고 상태 */}
                  <div className="mb-3">
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-600">재고 있음</span>
                    ) : (
                      <span className="text-xs text-red-600">품절</span>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="space-y-2">
                    {product.price === '가격문의' ? (
                      <button 
                        className="w-full py-2 border border-blue-300 text-blue-600 rounded text-sm hover:bg-blue-50 transition-colors"
                        onClick={() => alert('가격 문의는 고객센터로 연락해주세요.')}
                      >
                        가격 문의
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        장바구니 담기
                      </button>
                    )}
                    
                    <Link
                      href={`/products/${product.id}`}
                      className="block w-full py-2 border border-gray-300 text-gray-700 rounded text-sm text-center hover:bg-gray-50 transition-colors"
                    >
                      상품 보기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 액션 버튼 */}
          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              계속 쇼핑하기
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
