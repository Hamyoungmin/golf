'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

export default function RecentlyViewedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    recentlyViewedItems, 
    loading, 
    removeFromRecentlyViewed, 
    removeMultipleFromRecentlyViewed
  } = useRecentlyViewed();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  const handleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === recentlyViewedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(recentlyViewedItems.map(item => item.id));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }

    if (confirm(`선택한 ${selectedItems.length}개 상품을 최근 본 상품에서 제거하시겠습니까?`)) {
      const success = await removeMultipleFromRecentlyViewed(selectedItems);
      if (success) {
        setSelectedItems([]);
        alert('선택한 상품이 최근 본 상품에서 제거되었습니다.');
      } else {
        alert('선택한 상품 제거 중 오류가 발생했습니다.');
      }
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (confirm('이 상품을 최근 본 상품에서 제거하시겠습니까?')) {
      const success = await removeFromRecentlyViewed(productId);
      if (success) {
        setSelectedItems(prev => prev.filter(id => id !== productId));
        alert('상품이 최근 본 상품에서 제거되었습니다.');
      } else {
        alert('상품 제거 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        alert('이미 관심상품에 추가된 상품입니다.');
        return;
      }
      
      const success = await addToWishlist(product.id);
      if (success) {
        alert(`${product.name}이(가) 관심상품에 추가되었습니다.`);
      } else {
        alert('관심상품 추가 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('관심상품 추가 오류:', error);
      alert('관심상품 추가 중 오류가 발생했습니다.');
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (product.price === '가격문의') {
      alert('가격 문의 상품은 장바구니에 담을 수 없습니다.');
      return;
    }

    if (product.stock === 0) {
      alert('재고가 부족합니다.');
      return;
    }

    try {
      // 가격을 숫자로 변환 (예: "450,000원" -> 450000)
      const numericPrice = parseInt(product.price.replace(/[^0-9]/g, '')) || 0;
      
      if (numericPrice === 0) {
        alert('상품 가격 정보가 올바르지 않습니다.');
        return;
      }

      await addToCart(product.id, 1, numericPrice);
      alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
      router.push('/cart');
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">최근 본 상품을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '90%', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '40px',
        backgroundColor: '#fff'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          최근 본 상품
        </h1>

        {/* 최근 본 상품 목록 */}
        {recentlyViewedItems.length === 0 ? (
          <div>
            {/* 상단 구분선 */}
            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              margin: '20px 0' 
            }}></div>
            
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#333', 
                marginBottom: '15px' 
              }}>
                최근 본 상품이 없습니다.
              </h3>
              <p style={{ 
                color: '#666', 
                marginBottom: '30px',
                fontSize: '14px'
              }}>
                상품을 둘러보시면 최근 본 상품에 자동으로 추가됩니다.
              </p>
              <Link 
                href="/drivers"
                style={{
                  display: 'inline-block',
                  padding: '12px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                상품 둘러보기
              </Link>
            </div>
            
            {/* 하단 구분선 */}
            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              margin: '20px 0' 
            }}></div>
          </div>
        ) : (
          <>
            {/* 상단 구분선 */}
            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              margin: '20px 0' 
            }}></div>
            
            {/* 선택/삭제 컨트롤 */}
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '15px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === recentlyViewedItems.length}
                      onChange={handleSelectAll}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>전체 선택</span>
                  </label>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    총 {recentlyViewedItems.length}개 상품 중 <strong>{selectedItems.length}개</strong> 선택
                  </span>
                </div>
                <button
                  onClick={handleRemoveSelected}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #dc3545',
                    backgroundColor: 'white',
                    color: '#dc3545',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  선택 삭제
                </button>
              </div>
            </div>

            {/* 상품 목록 */}
            <div style={{ display: 'grid', gap: '20px' }}>
              {recentlyViewedItems.map((product) => (
                <div key={product.id} style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '4px', 
                  padding: '20px',
                  backgroundColor: '#fff'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    {/* 체크박스 */}
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(product.id)}
                        onChange={() => handleSelectItem(product.id)}
                        style={{ marginRight: '0' }}
                      />
                    </label>

                    {/* 상품 이미지 */}
                    <div style={{ flexShrink: 0 }}>
                      <Link href={`/products/${product.id}`}>
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={80}
                            height={80}
                            style={{ 
                              width: '80px', 
                              height: '80px', 
                              objectFit: 'cover', 
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#999'
                          }}>
                            이미지 없음
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* 상품 정보 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          marginBottom: '8px',
                          color: '#333'
                        }}>
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: '#ff6b35',
                        marginBottom: '8px'
                      }}>
                        {product.price}
                      </p>
                      
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                        브랜드: {product.brand} | 
                        {product.stock > 0 ? (
                          <span style={{ color: '#2563eb', marginLeft: '5px', fontSize: '16px', fontWeight: 'bold' }}>재고 있음</span>
                        ) : (
                          <span style={{ color: '#dc3545', marginLeft: '5px' }}>품절</span>
                        )}
                      </div>

                      {/* 액션 버튼들 */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {product.price === '가격문의' ? (
                          <button 
                            onClick={() => alert('가격 문의는 고객센터로 연락해주세요.')}
                            style={{
                              padding: '8px 16px',
                              border: '1px solid #007bff',
                              backgroundColor: 'white',
                              color: '#007bff',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            가격 문의
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: product.stock === 0 ? '#ccc' : '#ff6b35',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            장바구니 담기
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          style={{
                            padding: '8px 16px',
                            border: isInWishlist(product.id) ? '1px solid #dc3545' : '1px solid #007bff',
                            backgroundColor: 'white',
                            color: isInWishlist(product.id) ? '#dc3545' : '#007bff',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          {isInWishlist(product.id) ? '찜 해제' : '찜하기'}
                        </button>
                        
                        <Link
                          href={`/products/${product.id}`}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #666',
                            backgroundColor: 'white',
                            color: '#666',
                            borderRadius: '4px',
                            fontSize: '14px',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          상품 보기
                        </Link>

                        <button
                          onClick={() => handleRemoveItem(product.id)}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #dc3545',
                            backgroundColor: 'white',
                            color: '#dc3545',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          제거
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 구분선 */}
            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              margin: '30px 0 20px 0' 
            }}></div>
            
            {/* 하단 버튼 */}
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <Link 
                href="/drivers"
                style={{
                  display: 'inline-block',
                  padding: '12px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                더 많은 상품 보러가기
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
