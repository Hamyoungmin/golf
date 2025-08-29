'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/contexts/SettingsContext';
import { createOrder } from '@/lib/orders';
import { getUserData } from '@/lib/users';
import { createPaymentInfo, COMPANY_BANK_ACCOUNTS } from '@/lib/payments';
import { CartItem, Product, Address, User as UserType, PaymentMethod } from '@/types';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { getProduct } from '@/lib/products';

// 실제 Firebase 데이터를 사용하도록 변경 (샘플 데이터 제거)

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { settings } = useSettings();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [forceUpdate, setForceUpdate] = useState(0);

  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // 배송지 정보
  const [shippingInfo, setShippingInfo] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // 결제 방법 - 활성화된 첫 번째 결제 수단을 기본값으로 설정
  const getDefaultPaymentMethod = (): PaymentMethod => {
    if (settings.payment.enabledMethods.transfer) return 'bank_transfer';
    if (settings.payment.enabledMethods.card) return 'card';
    if (settings.payment.enabledMethods.vbank) return 'vbank';
    if (settings.payment.enabledMethods.kakaopay) return 'kakaopay';
    if (settings.payment.enabledMethods.naverpay) return 'naverpay';
    if (settings.payment.enabledMethods.phone) return 'phone';
    return 'bank_transfer'; // fallback
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

  // 장바구니 체크
  useEffect(() => {
    if (cartItems.length === 0) {
      showAlert('주문할 상품이 없습니다.', 'warning', {
        onConfirm: () => router.push('/cart')
      });
      return;
    }
  }, [cartItems, router, showAlert]);

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

    if (cartItems.length > 0) {
      loadCartProducts();
    } else {
      setCartItemsWithProducts([]);
    }
  }, [cartItems]);

  // 설정 업데이트 이벤트 리스너
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log('🔄 CheckoutPage: 설정 업데이트 감지 (결제수단 재설정)', event.detail);
      setForceUpdate(prev => prev + 1);
      
      // 결제 방법 재설정 - 활성화된 첫 번째 결제 수단으로
      const newSettings = event.detail.settings;
      if (newSettings.payment.enabledMethods.transfer) {
        setPaymentMethod('bank_transfer');
      } else if (newSettings.payment.enabledMethods.card) {
        setPaymentMethod('card');
      } else if (newSettings.payment.enabledMethods.vbank) {
        setPaymentMethod('vbank');
      } else if (newSettings.payment.enabledMethods.kakaopay) {
        setPaymentMethod('kakaopay');
      } else if (newSettings.payment.enabledMethods.naverpay) {
        setPaymentMethod('naverpay');
      } else if (newSettings.payment.enabledMethods.phone) {
        setPaymentMethod('phone');
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
    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
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
      const shippingCost = cartTotal >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.baseShippingCost;
      const totalAmount = cartTotal + shippingCost;

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
      }

      // 장바구니 비우기
      await clearCart();

      // 주문 완료 페이지로 이동
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (error) {
      console.error('주문 처리 오류:', error);
      showAlert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const shippingCost = cartTotal >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.baseShippingCost;
  const totalAmount = cartTotal + shippingCost;

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
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>배송지 정보</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: '#555'
                  }}>우편번호 *</label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) => handleShippingInfoChange('zipCode', e.target.value)}
                    placeholder="우편번호를 입력하세요"
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
            <div style={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>결제 방법</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 계좌이체 */}
                {settings.payment.enabledMethods.transfer && (
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontSize: '14px', color: '#333' }}>무통장 입금</span>
                  </label>
                )}
                

                {/* 휴대폰 결제 */}
                {settings.payment.enabledMethods.phone && (
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="phone"
                      checked={paymentMethod === 'phone'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontSize: '14px', color: '#333' }}>휴대폰 결제</span>
                  </label>
                )}
                
                {/* 카카오페이 */}
                {settings.payment.enabledMethods.kakaopay && (
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="kakaopay"
                      checked={paymentMethod === 'kakaopay'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontSize: '14px', color: '#333' }}>카카오페이</span>
                  </label>
                )}
                
                {/* 네이버페이 */}
                {settings.payment.enabledMethods.naverpay && (
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="naverpay"
                      checked={paymentMethod === 'naverpay'}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontSize: '14px', color: '#333' }}>네이버페이</span>
                  </label>
                )}
              </div>
              
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
                    {COMPANY_BANK_ACCOUNTS.map((account, index) => (
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
            </div>

            {/* 약관 동의 */}
            <div style={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>약관 동의</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 전체 동의 */}
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  <input
                    type="checkbox"
                    checked={allAgreed}
                    onChange={handleAllAgreementChange}
                    style={{ marginRight: '12px', transform: 'scale(1.3)' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>모든 약관에 동의합니다</span>
                </label>
                
                {/* 구분선 */}
                <hr style={{ border: 'none', borderTop: '1px solid #e9ecef', margin: '8px 0' }} />
                
                {/* 개별 약관들 */}
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingLeft: '12px' }}>
                  <input
                    type="checkbox"
                    checked={agreements.terms}
                    onChange={() => handleAgreementChange('terms')}
                    style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>이용약관에 동의합니다 (필수)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingLeft: '12px' }}>
                  <input
                    type="checkbox"
                    checked={agreements.privacy}
                    onChange={() => handleAgreementChange('privacy')}
                    style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>개인정보 처리방침에 동의합니다 (필수)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingLeft: '12px' }}>
                  <input
                    type="checkbox"
                    checked={agreements.age}
                    onChange={() => handleAgreementChange('age')}
                    style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>만 14세 이상입니다 (필수)</span>
                </label>
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px', 
              padding: '25px', 
              position: 'sticky', 
              top: '20px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>주문 상품</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                {cartItemsWithProducts.map((item) => (
                  <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '6px', 
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#adb5bd', 
                          fontSize: '11px' 
                        }}>
                          이미지
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>상품 총액</span>
                  <span style={{ color: '#333', fontWeight: '500' }}>{formatPrice(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>배송비</span>
                  <span style={{ color: '#333', fontWeight: '500' }}>{shippingCost === 0 ? '무료' : formatPrice(shippingCost)}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600' }}>
                  <span style={{ color: '#333' }}>총 결제금액</span>
                  <span style={{ color: '#007bff' }}>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#ced4da' : '#007bff',
                  color: '#fff',
                  padding: '15px 0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  marginBottom: '12px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#0056b3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#007bff';
                  }
                }}
              >
                {loading ? '주문 처리 중...' : '결제하기'}
              </button>

              <Link
                href="/cart"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  padding: '15px 0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#666',
                  textDecoration: 'none',
                  backgroundColor: '#fff',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff';
                }}
              >
                장바구니로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
