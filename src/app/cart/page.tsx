'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { CartItem, Product } from '@/types';

// 임시 상품 데이터 매핑 (실제로는 Firebase에서 가져와야 함)
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'TW717 455 10.5도 비자드 55 R',
    price: '가격문의',
    category: 'drivers',
    brand: 'titleist',
    images: ['https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=300&h=200&fit=crop'],
    description: '',
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
    description: '',
    stock: 3,
    specifications: {},
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    cartItems, 
    cartTotal, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart,
    loading 
  } = useCart();

  const [cartItemsWithProducts, setCartItemsWithProducts] = useState<(CartItem & { product: Product })[]>([]);

  // 장바구니 아이템에 상품 정보 매핑
  useEffect(() => {
    const itemsWithProducts = cartItems.map(cartItem => {
      const product = sampleProducts.find(p => p.id === cartItem.productId);
      return {
        ...cartItem,
        product: product || {
          id: cartItem.productId,
          name: '상품 정보를 찾을 수 없습니다',
          price: '0원',
          category: '',
          brand: '',
          images: [],
          description: '',
          stock: 0,
          specifications: {},
          isWomens: false,
          isKids: false,
          isLeftHanded: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      };
    });
    setCartItemsWithProducts(itemsWithProducts);
  }, [cartItems]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateCartItemQuantity(productId, newQuantity);
    } catch (error) {
      console.error('수량 변경 오류:', error);
      alert('수량 변경 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (confirm('해당 상품을 장바구니에서 제거하시겠습니까?')) {
      try {
        await removeFromCart(productId);
      } catch (error) {
        console.error('상품 제거 오류:', error);
        alert('상품 제거 중 오류가 발생했습니다.');
      }
    }
  };

  const handleClearCart = async () => {
    if (confirm('장바구니를 비우시겠습니까?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('장바구니 비우기 오류:', error);
        alert('장바구니 비우기 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCheckout = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    router.push('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">장바구니를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">장바구니</h1>

      {cartItemsWithProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="m1 1 4 4 1 6 8 0 9-10H6"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-gray-600">장바구니가 비어있습니다</h2>
          <p className="text-gray-500 mb-6">원하는 상품을 장바구니에 담아보세요.</p>
          <Link 
            href="/" 
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 아이템 목록 */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">상품 목록 ({cartItemsWithProducts.length}개)</h2>
              <button
                onClick={handleClearCart}
                className="text-gray-500 hover:text-red-500 text-sm"
              >
                전체 삭제
              </button>
            </div>

            <div className="space-y-4">
              {cartItemsWithProducts.map((item) => (
                <div key={item.productId} className="bg-white border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* 상품 이미지 */}
                    <div className="w-full sm:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            <Link 
                              href={`/products/${item.productId}`}
                              className="hover:text-orange-500"
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.product.brand} | {item.product.category}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* 수량 조절 */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">수량:</span>
                          <div className="flex items-center border rounded">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="w-12 text-center py-1 border-x">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* 가격 */}
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            개당: {formatPrice(item.price)}
                          </div>
                          <div className="text-lg font-semibold text-orange-600">
                            합계: {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">주문 요약</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>상품 총액</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>{cartTotal >= 30000 ? '무료' : '3,000원'}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 결제금액</span>
                  <span className="text-orange-600">
                    {formatPrice(cartTotal + (cartTotal >= 30000 ? 0 : 3000))}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>• 3만원 이상 주문 시 무료배송</p>
                <p>• 주문 후 2-3일 내 배송</p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                주문하기
              </button>

              <Link
                href="/"
                className="block w-full text-center border border-gray-300 py-3 rounded-lg mt-3 hover:bg-gray-50 transition-colors"
              >
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
