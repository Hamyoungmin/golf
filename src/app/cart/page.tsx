'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/contexts/SettingsContext';
import { CartItem, Product, Address } from '@/types';
import { createOrder } from '@/lib/orders';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { getProduct } from '@/lib/products';

// 실제 Firebase 데이터를 사용하도록 변경 (샘플 데이터 제거)

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
  const { settings } = useSettings();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [forceUpdate, setForceUpdate] = useState(0);

  const [cartItemsWithProducts, setCartItemsWithProducts] = useState<(CartItem & { product: Product })[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    city: '',
    state: ''
  });
  const [isAddressValid, setIsAddressValid] = useState(false);

  // 장바구니 아이템에 상품 정보 매핑
  useEffect(() => {
    // 장바구니 아이템에 상품 정보 추가 (실제 Firebase에서 가져오기)
    const loadCartProducts = async () => {
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (cartItem) => {
          const product = await getProduct(cartItem.productId);
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
        })
      );
      setCartItemsWithProducts(itemsWithProducts);
      
      // 모든 아이템을 기본 선택으로 설정
      setSelectedItems(cartItems.map(item => item.productId));
    };

    if (cartItems.length > 0) {
      loadCartProducts();
    } else {
      setCartItemsWithProducts([]);
      setSelectedItems([]);
    }
  }, [cartItems]);

  // 주소 유효성 검사
  useEffect(() => {
    const { street, city, state } = shippingAddress;
    setIsAddressValid(street.trim() !== '' && city.trim() !== '' && state.trim() !== '');
  }, [shippingAddress]);

  // 설정 업데이트 이벤트 리스너
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('🔄 CartPage: 설정 업데이트 감지 (배송비 재계산)', event.detail);
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateCartItemQuantity(productId, newQuantity);
    } catch (error) {
      console.error('수량 변경 오류:', error);
      showAlert('수량 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    showAlert('해당 상품을 장바구니에서 제거하시겠습니까?', 'confirm', {
      onConfirm: async () => {
        try {
          await removeFromCart(productId);
        } catch (error) {
          console.error('상품 제거 오류:', error);
          showAlert('상품 제거 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleClearCart = async () => {
    showAlert('장바구니를 비우시겠습니까?', 'confirm', {
      onConfirm: async () => {
        try {
          await clearCart();
        } catch (error) {
          console.error('장바구니 비우기 오류:', error);
          showAlert('장바구니 비우기 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItemsWithProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItemsWithProducts.map(item => item.productId));
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      showAlert('삭제할 상품을 선택해주세요.', 'warning');
      return;
    }

    showAlert(`선택한 ${selectedItems.length}개 상품을 장바구니에서 제거하시겠습니까?`, 'confirm', {
      onConfirm: async () => {
        try {
          for (const productId of selectedItems) {
            await removeFromCart(productId);
          }
          setSelectedItems([]);
          showAlert('선택한 상품이 장바구니에서 제거되었습니다.', 'success');
        } catch (error) {
          console.error('선택 상품 제거 오류:', error);
          showAlert('상품 제거 중 오류가 발생했습니다.', 'error');
        }
      }
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      showAlert('로그인이 필요합니다.', 'warning', {
        onConfirm: () => router.push('/login')
      });
      return;
    }

    if (selectedItems.length === 0) {
      showAlert('구매할 상품을 선택해주세요.', 'warning');
      return;
    }

    if (!isAddressValid) {
      showAlert('배송 주소를 모두 입력해주세요.', 'warning');
      return;
    }

    try {
      // 선택된 상품들만 주문
      const selectedCartItems = cartItemsWithProducts.filter(item => selectedItems.includes(item.productId));
      
      // 가격 문의 상품이 있는지 확인
      const priceInquiryItems = selectedCartItems.filter(item => item.product.price === '가격문의');
      if (priceInquiryItems.length > 0) {
        showAlert('가격 문의 상품은 주문할 수 없습니다. 해당 상품을 제거해주세요.', 'warning');
        return;
      }

      // 재고 부족 상품 확인
      const outOfStockItems = selectedCartItems.filter(item => item.product.stock === 0);
      if (outOfStockItems.length > 0) {
        showAlert('품절된 상품이 포함되어 있습니다. 해당 상품을 제거해주세요.', 'warning');
        return;
      }

      const orderItems = selectedCartItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity
      }));

      const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const shippingFee = totalAmount >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.baseShippingCost;
      const finalAmount = totalAmount + shippingFee;

      const orderData = {
        userId: user.uid,
        items: orderItems,
        totalAmount: finalAmount,
        status: 'pending' as const,
        shippingAddress,
        paymentMethod: 'bank_transfer'
      };

      const orderId = await createOrder(orderData);
      
      if (orderId) {
        // 주문된 상품들을 장바구니에서 제거
        for (const productId of selectedItems) {
          await removeFromCart(productId);
        }
        
        showAlert('주문이 성공적으로 생성되었습니다. 관리자 확인 후 결제 안내를 드리겠습니다.', 'success', {
          onConfirm: () => router.push(`/mypage/orders/${orderId}`)
        });
      } else {
        showAlert('주문 생성 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('주문 생성 오류:', error);
      showAlert('주문 생성 중 오류가 발생했습니다.', 'error');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  // 선택된 상품들의 총액 계산
  const calculateSelectedTotal = () => {
    return selectedItems.reduce((total, productId) => {
      const item = cartItemsWithProducts.find(item => item.productId === productId);
      return item ? total + (item.price * item.quantity) : total;
    }, 0);
  };

  const selectedTotal = calculateSelectedTotal();
  const shippingFee = selectedTotal >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.baseShippingCost;
  const finalTotal = selectedTotal + shippingFee;

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '90%', margin: '50px auto', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>장바구니를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <>
      <AlertComponent />
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
          장바구니
        </h1>

        {cartItemsWithProducts.length === 0 ? (
          <div>
            {/* 상단 구분선 */}
            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              margin: '20px 0' 
            }}></div>
            
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto', color: '#9ca3af' }}>
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="m1 1 4 4 1 6 8 0 9-10H6"></path>
                </svg>
              </div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#333', 
                marginBottom: '15px' 
              }}>
                장바구니가 비어있습니다
              </h3>
              <p style={{ 
                color: '#666', 
                marginBottom: '30px',
                fontSize: '14px'
              }}>
                원하는 상품을 장바구니에 담아보세요.
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
                      checked={selectedItems.length === cartItemsWithProducts.length}
                      onChange={handleSelectAll}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>전체 선택</span>
                  </label>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    총 {cartItemsWithProducts.length}개 상품 중 <strong>{selectedItems.length}개</strong> 선택
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
              {cartItemsWithProducts.map((item) => (
                <div key={item.productId} style={{ 
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
                        checked={selectedItems.includes(item.productId)}
                        onChange={() => handleSelectItem(item.productId)}
                        style={{ marginRight: '0' }}
                      />
                    </label>

                    {/* 상품 이미지 */}
                    <div style={{ flexShrink: 0 }}>
                      <Link href={`/products/${item.productId}`}>
                        {item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
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
                      <Link href={`/products/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          marginBottom: '8px',
                          color: '#333'
                        }}>
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      <p style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: '#ff6b35',
                        marginBottom: '8px'
                      }}>
                        {item.product.price === '가격문의' ? '가격문의' : formatPrice(item.price)}
                      </p>
                      
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                        브랜드: {item.product.brand} | 
                        {item.product.stock > 0 ? (
                          <span style={{ color: '#2563eb', marginLeft: '5px', fontSize: '16px', fontWeight: 'bold' }}>재고 있음</span>
                        ) : (
                          <span style={{ color: '#dc3545', marginLeft: '5px' }}>품절</span>
                        )}
                      </div>

                      {/* 수량 조절 및 액션 버튼들 */}
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* 수량 조절 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#666' }}>수량:</span>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                opacity: item.quantity <= 1 ? '0.5' : '1'
                              }}
                            >
                              -
                            </button>
                            <span style={{ 
                              width: '48px', 
                              textAlign: 'center', 
                              padding: '4px 0',
                              borderLeft: '1px solid #ddd',
                              borderRight: '1px solid #ddd'
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: 'pointer'
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* 소계 */}
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff6b35' }}>
                          소계: {item.product.price === '가격문의' ? '가격문의' : formatPrice(item.price * item.quantity)}
                        </div>

                        {/* 제거 버튼 */}
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
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

            {/* 배송 주소 입력 */}
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '20px', 
              borderRadius: '4px', 
              marginTop: '30px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>배송 주소</h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="시/도"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="시/군/구"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="상세 주소 (동/로/번지)"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* 결제 정보 */}
            <div style={{ 
              backgroundColor: '#fff3cd', 
              padding: '20px', 
              borderRadius: '4px', 
              marginTop: '20px',
              border: '1px solid #ffeaa7'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#856404' }}>결제 정보</h3>
              
              <div style={{ display: 'grid', gap: '8px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span>선택된 상품 총액:</span>
                  <span style={{ fontWeight: 'bold' }}>{formatPrice(selectedTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span>배송비:</span>
                  <span style={{ fontWeight: 'bold', color: shippingFee === 0 ? '#28a745' : '#dc3545' }}>
                    {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div style={{ 
                  borderTop: '1px solid #ffeaa7', 
                  paddingTop: '8px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  <span>총 결제 예상 금액:</span>
                  <span style={{ color: '#856404' }}>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#856404', marginBottom: '15px' }}>
                <p>• {formatPrice(settings.shipping.freeShippingThreshold)} 이상 주문 시 무료배송</p>
                <p>• 주문 후 관리자 확인을 거쳐 결제 안내를 드립니다</p>
                <p>• 결제는 무통장입금으로 진행됩니다</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0 || !isAddressValid}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: (selectedItems.length === 0 || !isAddressValid) ? '#ccc' : '#ff6b35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: (selectedItems.length === 0 || !isAddressValid) ? 'not-allowed' : 'pointer'
                }}
              >
                구매하기 ({selectedItems.length}개 상품)
              </button>
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
                  backgroundColor: '#6c757d',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                계속 쇼핑하기
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
    </>
  );
}
