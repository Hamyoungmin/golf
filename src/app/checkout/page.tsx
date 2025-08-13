'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { createOrder } from '@/lib/orders';
import { getUserData } from '@/lib/users';
import { createPaymentInfo, COMPANY_BANK_ACCOUNTS } from '@/lib/payments';
import { CartItem, Product, Address, User as UserType, PaymentMethod } from '@/types';

// 임시 상품 데이터 (실제로는 Firebase에서 가져와야 함)
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

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();

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

  // 결제 방법
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');

  // 주문자 동의
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    age: false,
  });

  const [cartItemsWithProducts, setCartItemsWithProducts] = useState<(CartItem & { product: Product })[]>([]);

  // 로그인 체크
  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, router]);

  // 장바구니 체크
  useEffect(() => {
    if (cartItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      router.push('/cart');
      return;
    }
  }, [cartItems, router]);

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

  const validateForm = () => {
    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
      alert('배송지 정보를 모두 입력해주세요.');
      return false;
    }

    if (!agreements.terms || !agreements.privacy || !agreements.age) {
      alert('필수 약관에 모두 동의해주세요.');
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

      // 배송비 계산
      const shippingCost = cartTotal >= 30000 ? 0 : 3000;
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
      alert('주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const shippingCost = cartTotal >= 30000 ? 0 : 3000;
  const totalAmount = cartTotal + shippingCost;

  if (userDataLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">사용자 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">주문/결제</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문 정보 입력 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 주문자 정보 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">주문자 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">이메일</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">이름</label>
                <input
                  type="text"
                  value={userData?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">연락처</label>
                <input
                  type="tel"
                  value={userData?.phone || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* 배송지 정보 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">배송지 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">우편번호 *</label>
                <input
                  type="text"
                  value={shippingInfo.zipCode}
                  onChange={(e) => handleShippingInfoChange('zipCode', e.target.value)}
                  placeholder="우편번호를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">시/도 *</label>
                <input
                  type="text"
                  value={shippingInfo.state}
                  onChange={(e) => handleShippingInfoChange('state', e.target.value)}
                  placeholder="시/도를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">시/군/구 *</label>
                <input
                  type="text"
                  value={shippingInfo.city}
                  onChange={(e) => handleShippingInfoChange('city', e.target.value)}
                  placeholder="시/군/구를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">상세주소 *</label>
                <input
                  type="text"
                  value={shippingInfo.street}
                  onChange={(e) => handleShippingInfoChange('street', e.target.value)}
                  placeholder="상세주소를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* 결제 방법 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">결제 방법</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mr-3"
                />
                <span>무통장 입금</span>
              </label>
              <label className="flex items-center opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mr-3"
                  disabled
                />
                <span>신용카드 (준비중)</span>
              </label>
            </div>
            
            {/* 계좌이체 선택 시 계좌 정보 표시 */}
            {paymentMethod === 'bank_transfer' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">입금 계좌 정보</h3>
                <div className="space-y-3">
                  {COMPANY_BANK_ACCOUNTS.map((account, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-800">{account.bankName}</span>
                        <span className="text-sm text-gray-600">예금주: {account.accountHolder}</span>
                      </div>
                      <div className="text-lg font-bold text-blue-900 mt-1">
                        {account.accountNumber}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-blue-700">
                  <p className="font-semibold">입금 시 주의사항:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>주문 완료 후 3일 이내에 입금해주세요.</li>
                    <li>입금자명을 주문자명과 동일하게 입력해주세요.</li>
                    <li>입금 확인 후 배송이 시작됩니다.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">약관 동의</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={() => handleAgreementChange('terms')}
                  className="mr-3"
                />
                <span>이용약관에 동의합니다 (필수)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={() => handleAgreementChange('privacy')}
                  className="mr-3"
                />
                <span>개인정보 처리방침에 동의합니다 (필수)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={agreements.age}
                  onChange={() => handleAgreementChange('age')}
                  className="mr-3"
                />
                <span>만 14세 이상입니다 (필수)</span>
              </label>
            </div>
          </div>
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4">주문 상품</h3>
            
            <div className="space-y-3 mb-6">
              {cartItemsWithProducts.map((item) => (
                <div key={item.productId} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        이미지
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-600">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>상품 총액</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span>{shippingCost === 0 ? '무료' : formatPrice(shippingCost)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>총 결제금액</span>
                <span className="text-orange-600">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '주문 처리 중...' : '결제하기'}
            </button>

            <Link
              href="/cart"
              className="block w-full text-center border border-gray-300 py-3 rounded-lg mt-3 hover:bg-gray-50 transition-colors"
            >
              장바구니로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
