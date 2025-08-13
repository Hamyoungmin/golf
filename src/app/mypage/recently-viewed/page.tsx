'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Product } from '@/types';

export default function RecentlyViewedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    recentlyViewedItems, 
    loading, 
    removeFromRecentlyViewed, 
    removeMultipleFromRecentlyViewed,
    clearRecentlyViewed,
    refreshRecentlyViewed 
  } = useRecentlyViewed();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(recentlyViewedItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  // 개별 선택/해제
  const handleSelectItem = (productId: string) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  // 선택된 항목들을 선택한 상태와 동기화
  useEffect(() => {
    setSelectAll(selectedItems.length > 0 && selectedItems.length === recentlyViewedItems.length);
  }, [selectedItems, recentlyViewedItems]);

  // 선택 항목 삭제
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }

    if (confirm(`선택한 ${selectedItems.length}개의 상품을 최근 본 상품에서 삭제하시겠습니까?`)) {
      const success = await removeMultipleFromRecentlyViewed(selectedItems);
      if (success) {
        setSelectedItems([]);
        alert('선택한 상품들이 삭제되었습니다.');
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 전체 삭제
  const handleClearAll = async () => {
    if (recentlyViewedItems.length === 0) {
      alert('삭제할 상품이 없습니다.');
      return;
    }

    if (confirm('모든 최근 본 상품을 삭제하시겠습니까?')) {
      const success = await clearRecentlyViewed();
      if (success) {
        setSelectedItems([]);
        alert('모든 최근 본 상품이 삭제되었습니다.');
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 관심상품 추가
  const handleAddToWishlist = async (productId: string, productName: string) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      if (isInWishlist(productId)) {
        alert('이미 관심상품에 추가된 상품입니다.');
        return;
      }
      
      const success = await addToWishlist(productId);
      if (success) {
        alert(`${productName}이(가) 관심상품에 추가되었습니다.`);
      } else {
        alert('관심상품 추가 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('관심상품 추가 오류:', error);
      alert('관심상품 추가 중 오류가 발생했습니다.');
    }
  };

  const formatPrice = (price: string) => {
    if (price === '가격문의') return price;
    // 이미 형식화된 가격이면 그대로 반환
    if (price.includes('원')) return price;
    // 숫자만 있는 경우 형식화
    const numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
    if (isNaN(numericPrice)) return price;
    return new Intl.NumberFormat('ko-KR').format(numericPrice) + '원';
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 relative overflow-hidden">
      {/* 골프 장식 요소들 */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-orange-200 to-amber-300 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full opacity-30 blur-xl"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-25 blur-lg"></div>
      
      <div className="container mx-auto px-4 py-8 relative">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              {/* 골프공 장식 */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-orange-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-400 rounded-full opacity-70"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-700 via-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            최근 본 상품
          </h1>
          <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            최근에 조회한 골프 용품들을 확인하세요
          </p>
          
          {/* 뒤로가기 버튼 */}
          <div className="mt-6">
            <Link 
              href="/mypage"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 font-bold rounded-2xl border border-gray-300 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
              마이페이지로 돌아가기
            </Link>
          </div>
        </div>

        {/* 관리 버튼들 */}
        {recentlyViewedItems.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-3xl p-6 shadow-xl mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-orange-600 border-orange-300 rounded focus:ring-orange-500"
                  />
                  <span className="font-semibold text-gray-700">전체 선택</span>
                </label>
                <span className="text-sm text-gray-500">
                  총 {recentlyViewedItems.length}개 | 선택됨 {selectedItems.length}개
                </span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedItems.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  선택 삭제
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  전체 삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 상품 목록 */}
        {recentlyViewedItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-16 text-center shadow-2xl">
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              {/* 골프공 장식 */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-orange-300 flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-400 rounded-full opacity-70"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">최근 본 상품이 없습니다</h3>
            <p className="text-gray-600 mb-8 text-lg">골프 용품을 둘러보시고 마음에 드는 제품을 찾아보세요!</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              골프 용품 쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recentlyViewedItems.map((product) => (
              <div key={product.id} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-orange-300 group">
                {/* 선택 체크박스 */}
                <div className="absolute top-4 left-4 z-10">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => handleSelectItem(product.id)}
                      className="w-5 h-5 text-orange-600 border-orange-300 rounded focus:ring-orange-500 bg-white/90 backdrop-blur-sm"
                    />
                  </label>
                </div>

                {/* 상품 이미지 */}
                <div className="relative">
                  <Link href={`/products/${product.id}`}>
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=600&h=400&fit=crop'}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  
                  {/* 오버레이 버튼들 */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex gap-3">
                      <Link 
                        href={`/products/${product.id}`}
                        className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleAddToWishlist(product.id, product.name)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                          isInWishlist(product.id) 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-white/90 text-gray-700 hover:bg-white'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {product.brand} | {product.category}
                    </span>
                  </div>
                  
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-lg text-gray-800 mb-3 line-clamp-2 hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-orange-600">
                      {formatPrice(product.price)}
                    </span>
                    
                    <button
                      onClick={() => removeFromRecentlyViewed(product.id)}
                      className="w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                      title="최근 본 상품에서 제거"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
