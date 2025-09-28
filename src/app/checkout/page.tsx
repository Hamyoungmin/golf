'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/contexts/SettingsContext';
import { createOrder } from '@/lib/orders';
import { getUserData } from '@/lib/users';
import { createPaymentInfo } from '@/lib/payments';
import OrderSummary from '@/components/checkout/OrderSummary';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import TermsAgreement from '@/components/checkout/TermsAgreement';
import { calculateTotals } from '@/utils/price';
import { CartItem, Product, Address, User as UserType, PaymentMethod } from '@/types';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { getProduct } from '@/lib/products';

// 실제 Firebase 데이터를 사용하도록 변경 (샘플 데이터 제거)

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { settings } = useSettings();
  const { showAlert, AlertComponent } = useCustomAlert();

  // 직접 구매 파라미터
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const [directPurchaseProduct, setDirectPurchaseProduct] = useState<Product | null>(null);

  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // 배송지 정보
  const [shippingInfo, setShippingInfo] = useState<Address>({
    street: '',
    city: '',
    state: '',
  });

  // 결제 방법 - 활성화된 첫 번째 결제 수단을 기본값으로 설정
  const getDefaultPaymentMethod = (): PaymentMethod => {
    if (settings.payment.enabledMethods.transfer) return 'bank_transfer';
    // 토스페이먼츠는 항상 테스트 모드에서 활성화
    return 'toss_payments';
  };
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(getDefaultPaymentMethod());

  // 주문자 동의
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    age: false,
  });

  // 전체 동의 상태 계산
  const allAgreed = agreements.terms && agreements.privacy && agreements.age;

  const [cartItemsWithProducts, setCartItemsWithProducts] = useState<(CartItem & { product: Product })[]>([]);

  // 로그인 체크
  useEffect(() => {
    if (!user) {
      showAlert('로그인이 필요합니다.', 'warning', {
        onConfirm: () => router.push('/login')
      });
      return;
    }
  }, [user, router, showAlert]);

  // 직접 구매 상품 로드
  useEffect(() => {
    const loadDirectPurchaseProduct = async () => {
      if (productId) {
        try {
          const product = await getProduct(productId);
          if (product) {
            setDirectPurchaseProduct(product);
          } else {
            showAlert('상품을 찾을 수 없습니다.', 'warning', {
              onConfirm: () => router.push('/')
            });
          }
        } catch (error) {
          console.error('직접 구매 상품 로드 오류:', error);
          showAlert('상품 정보를 불러오는 중 오류가 발생했습니다.', 'error', {
            onConfirm: () => router.push('/')
          });
        }
      }
    };

    loadDirectPurchaseProduct();
  }, [productId, router, showAlert]);

  // 장바구니 또는 직접 구매 체크
  useEffect(() => {
    // 직접 구매가 아니고 장바구니도 비어있는 경우
    if (!productId && cartItems.length === 0) {
      showAlert('주문할 상품이 없습니다.', 'warning', {
        onConfirm: () => router.push('/cart')
      });
      return;
    }
  }, [productId, cartItems, router, showAlert]);

  // 사용자 정보 로드
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const data = await getUserData(user.uid);
        setUserData(data);
        
        // 기존 주소 정보가 있으면 자동 입력
        if (data?.address) {
          setShippingInfo(data.address);
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      } finally {
        setUserDataLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // 장바구니 아이템에 상품 정보 매핑 (실제 Firebase에서 가져오기)
  useEffect(() => {
    const loadCartProducts = async () => {
      // 직접 구매인 경우
      if (productId && directPurchaseProduct) {
        const priceNumber = parseInt(directPurchaseProduct.price.replace(/[^0-9]/g, '')) || 0;
        setCartItemsWithProducts([{
          productId: directPurchaseProduct.id,
          quantity: quantity,
          price: priceNumber,
          product: directPurchaseProduct
        }]);
        return;
      }

      // 장바구니 구매인 경우
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
    };

    if (productId && directPurchaseProduct) {
      loadCartProducts();
    } else if (cartItems.length > 0) {
      loadCartProducts();
    } else {
      setCartItemsWithProducts([]);
    }
  }, [cartItems, productId, directPurchaseProduct, quantity]);

  // 설정 업데이트 이벤트 리스너
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('🔄 CheckoutPage: 설정 업데이트 감지 (결제수단 재설정)', event.detail);
      
      // 결제 방법 재설정 - 토스페이먼츠를 기본으로
      const newSettings = event.detail.settings;
      if (newSettings.payment.enabledMethods.transfer) {
        setPaymentMethod('bank_transfer');
      } else {
        setPaymentMethod('toss_payments');
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

  const handleShippingInfoChange = (field: keyof Address, value: string) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgreementChange = (field: keyof typeof agreements) => {
    setAgreements(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // 전체 동의 핸들러
  const handleAllAgreementChange = () => {
    const newValue = !allAgreed;
    setAgreements({
      terms: newValue,
      privacy: newValue,
      age: newValue,
    });
  };

  const validateForm = () => {
    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state) {
      showAlert('배송지 정보를 모두 입력해주세요.', 'warning');
      return false;
    }

    if (!agreements.terms || !agreements.privacy || !agreements.age) {
      showAlert('필수 약관에 모두 동의해주세요.', 'warning');
      return false;
    }

    return true;
  };

  const handleOrder = async () => {
    if (!user || !validateForm()) return;

    setLoading(true);

    try {
      // 주문 아이템 변환
      const orderItems = cartItemsWithProducts.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
      }));

      // 배송비 계산 (설정값 사용)
      const currentTotal = productId && directPurchaseProduct ? 
        parseInt(directPurchaseProduct.price.replace(/[^0-9]/g, '')) * quantity : 
        cartTotal;
      const shippingCost = currentTotal >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.baseShippingCost;
      const totalAmount = currentTotal + shippingCost;

      // 주문 생성
      const orderId = await createOrder({
        userId: user.uid,
        items: orderItems,
        totalAmount,
        status: 'pending',
        shippingAddress: shippingInfo,
        paymentMethod,
      });

      // 주문 생성 확인
      if (!orderId) {
        throw new Error('주문 생성에 실패했습니다.');
      }

      // 결제 정보 생성 (계좌이체인 경우)
      if (paymentMethod === 'bank_transfer') {
        await createPaymentInfo({
          orderId: orderId as string,
          userId: user.uid,
          paymentMethod,
          amount: totalAmount,
          status: 'pending',
        });
      } else if (paymentMethod === 'toss_payments') {
        // 토스페이먼츠는 별도 처리
        console.log('토스페이먼츠 결제:', {
          orderId,
          amount: totalAmount,
          paymentMethod
        });
      }

      // 장바구니 구매인 경우에만 장바구니 비우기
      if (!productId) {
      await clearCart();
      }

      // 주문 완료 페이지로 이동
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (error) {
      console.error('주문 처리 오류:', error);
      showAlert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 가격 포맷팅은 OrderSummary 내부에서 처리합니다.

  const currentTotal = productId && directPurchaseProduct ? 
    parseInt(directPurchaseProduct.price.replace(/[^0-9]/g, '')) * quantity : 
    cartTotal;
  const { itemsTotal, shippingFee, finalTotal } = calculateTotals(
    [{ price: currentTotal, quantity: 1 }],
    { baseShippingCost: settings.shipping.baseShippingCost, freeShippingThreshold: settings.shipping.freeShippingThreshold }
  );

  if (userDataLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', fontSize: '16px', color: '#666' }}>사용자 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <>
      <AlertComponent />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>주문/결제</h1>

        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px'
        }}>
        {/* 주문 정보 입력 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', flex: '2' }}>
          {/* 주문자 정보 */}
            <div style={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>주문자 정보</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: '#555'
                  }}>이메일</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa',
                      fontSize: '14px',
                      color: '#666'
                    }}
                />
              </div>
              <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: '#555'
                  }}>이름</label>
                <input
                  type="text"
                  value={userData?.name || ''}
                  disabled
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa',
                      fontSize: '14px',
                      color: '#666'
                    }}
                />
              </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: '#555'
                  }}>연락처</label>
                <input
                  type="tel"
                  value={userData?.phone || ''}
                  disabled
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa',
                      fontSize: '14px',
                      color: '#666'
                    }}
                  />
                </div>
            </div>
          </div>

          {/* 배송지 정보 */}
            <div style={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333', margin: 0 }}>배송지 정보</h2>
                {userData && (
                  <button
                    type="button"
                    onClick={() => {
                      if (userData.address) {
                        setShippingInfo(userData.address);
                        showAlert('주문자 정보에서 배송지 정보를 가져왔습니다.', 'success');
                      } else {
                        showAlert('저장된 주문자 주소 정보가 없습니다.', 'warning');
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    📍 주문자 정보로 자동입력
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: '#555'
                  }}>시/도 *</label>
                <input
                  type="text"
                  value={shippingInfo.state}
                  onChange={(e) => handleShippingInfoChange('state', e.target.value)}
                  placeholder="시/도를 입력하세요"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: '#555'
                  }}>시/군/구 *</label>
                <input
                  type="text"
                  value={shippingInfo.city}
                  onChange={(e) => handleShippingInfoChange('city', e.target.value)}
                  placeholder="시/군/구를 입력하세요"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: '#555'
                  }}>상세주소 *</label>
                <input
                  type="text"
                  value={shippingInfo.street}
                  onChange={(e) => handleShippingInfoChange('street', e.target.value)}
                  placeholder="상세주소를 입력하세요"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#007bff'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                  />
                </div>
            </div>
          </div>


          {/* 결제 방법 */}
            <PaymentMethodSelector
              methods={{
                transfer: settings.payment.enabledMethods.transfer,
                phone: settings.payment.enabledMethods.phone,
                naverpay: settings.payment.enabledMethods.naverpay,
              }}
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
            
            {/* 계좌이체 선택 시 계좌 정보 표시 */}
            {paymentMethod === 'bank_transfer' && (
                <div style={{ 
                  marginTop: '25px', 
                  padding: '20px', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px' 
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#007bff' }}>입금 계좌 정보</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {settings.payment.bankAccounts.map((account, index) => (
                      <div key={index} style={{ 
                        backgroundColor: '#fff', 
                        padding: '15px', 
                        borderRadius: '6px', 
                        border: '1px solid #ddd' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#007bff' }}>{account.bankName}</span>
                          <span style={{ fontSize: '12px', color: '#666' }}>예금주: {account.accountHolder}</span>
                      </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                        {account.accountNumber}
                      </div>
                    </div>
                  ))}
                </div>
                  <div style={{ marginTop: '20px', fontSize: '13px', color: '#666' }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>입금 시 주의사항:</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.5' }}>
                    <li>주문 완료 후 3일 이내에 입금해주세요.</li>
                    <li>입금자명을 주문자명과 동일하게 입력해주세요.</li>
                    <li>입금 확인 후 배송이 시작됩니다.</li>
                  </ul>
                </div>
              </div>
            )}

              {/* 토스페이먼츠 선택 시 안내 정보 표시 */}
              {paymentMethod === 'toss_payments' && (
                <div style={{ 
                  marginTop: '25px', 
                  padding: '20px', 
                  backgroundColor: '#e8f4fd', 
                  border: '1px solid #bee5eb', 
                  borderRadius: '8px' 
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#0c5460' }}>
                    🎯 토스페이먼츠
                  </h3>
                  <div style={{ fontSize: '14px', color: '#0c5460', lineHeight: '1.6' }}>
                    <div style={{ 
                      backgroundColor: '#fff', 
                      padding: '15px', 
                      borderRadius: '6px', 
                      border: '1px solid #ddd',
                      marginBottom: '15px'
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#007bff' }}>사용 가능한 결제 수단:</h4>
                      <ul style={{ paddingLeft: '20px', lineHeight: '1.5' }}>
                        <li>💳 신용카드/체크카드</li>
                        <li>🏦 계좌이체</li>
                        <li>📱 네이버페이</li>
                        <li>📱 토스페이</li>
                        <li>💰 가상계좌</li>
                      </ul>
                    </div>
                    <div style={{ 
                      backgroundColor: '#d1ecf1', 
                      padding: '12px', 
                      borderRadius: '6px', 
                      fontSize: '13px'
                    }}>
                      <p style={{ marginBottom: '5px', fontWeight: '600' }}>💡 결제 안내:</p>
                      <p style={{ marginBottom: '5px' }}>• 안전하고 빠른 결제 서비스</p>
                      <p style={{ marginBottom: '5px' }}>• 다양한 결제 수단 지원</p>
                      <p>• 주문 완료 후 결제 완료 페이지로 이동합니다</p>
                    </div>
                  </div>
                </div>
              )}

          {/* 약관 동의 */}
            <TermsAgreement
              agreements={agreements}
              allAgreed={allAgreed}
              onToggle={(key) => handleAgreementChange(key)}
              onToggleAll={handleAllAgreementChange}
            />
        </div>

        {/* 주문 요약 */}
          <OrderSummary
            title="주문 상품"
            items={cartItemsWithProducts.map((i) => ({
              id: i.productId,
              name: i.product.name,
              quantity: i.quantity,
              price: i.price,
              imageUrl: i.product.images[0],
            }))}
            itemsTotal={itemsTotal}
            shippingFee={shippingFee}
            finalTotal={finalTotal}
            onSubmit={handleOrder}
            submitText={loading ? '주문 처리 중...' : '결제하기'}
            submitDisabled={loading}
          />
      </div>
    </div>
    </>
  );
}
