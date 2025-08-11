'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getOrder, getOrderStatusText, getOrderStatusColor } from '@/lib/orders';
import { Order } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const orderId = params.id as string;

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // 주문 상세 정보 로드
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user) return;

      try {
        setLoading(true);
        const orderData = await getOrder(orderId);
        
        if (!orderData) {
          setError('주문을 찾을 수 없습니다.');
          return;
        }

        // 본인의 주문인지 확인
        if (orderData.userId !== user.uid) {
          setError('접근 권한이 없습니다.');
          return;
        }

        setOrder(orderData);
      } catch (err) {
        console.error('주문 상세 정보 로드 오류:', err);
        setError('주문 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return '무통장 입금';
      case 'card':
        return '신용카드';
      case 'kakao_pay':
        return '카카오페이';
      default:
        return method;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">주문 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-red-400">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6"/>
              <path d="M9 9l6 6"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/mypage/orders" 
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            주문 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = order.totalAmount >= 30000 ? 0 : 3000;
  const productTotal = order.totalAmount - shippingCost;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">주문 상세</h1>
          <p className="text-gray-600 mt-2">주문번호: {order.orderId}</p>
        </div>
        <Link 
          href="/mypage/orders"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← 주문 목록
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주요 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 주문 상태 */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">주문 상태</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                {getOrderStatusText(order.status)}
              </span>
            </div>
            
            {/* 진행 단계 표시 */}
            <div className="flex items-center justify-between text-sm">
              <div className={`text-center ${order.status === 'pending' || order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered' ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${order.status === 'pending' || order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
                <span>주문접수</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
              <div className={`text-center ${order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered' ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
                <span>결제완료</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
              <div className={`text-center ${order.status === 'shipped' || order.status === 'delivered' ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
                <span>배송중</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${order.status === 'delivered' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
              <div className={`text-center ${order.status === 'delivered' ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${order.status === 'delivered' ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
                <span>배송완료</span>
              </div>
            </div>
          </div>

          {/* 주문 상품 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">주문 상품</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{item.productName}</h3>
                    <p className="text-sm text-gray-600">
                      개당 {formatPrice(item.price)} × {item.quantity}개
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 배송 정보 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">배송 정보</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                  <p className="text-gray-900">{order.shippingAddress.zipCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시/도</label>
                  <p className="text-gray-900">{order.shippingAddress.state}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시/군/구</label>
                <p className="text-gray-900">{order.shippingAddress.city}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상세주소</label>
                <p className="text-gray-900">{order.shippingAddress.street}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 정보 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 주문 요약 */}
          <div className="bg-gray-50 border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">주문 요약</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문일시</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제방법</span>
                <span>{getPaymentMethodText(order.paymentMethod)}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span>상품 총액</span>
                <span>{formatPrice(productTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span>{shippingCost === 0 ? '무료' : formatPrice(shippingCost)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>총 결제금액</span>
                <span className="text-orange-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* 결제 안내 (무통장 입금인 경우) */}
          {order.paymentMethod === 'bank_transfer' && order.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-yellow-800">입금 안내</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p><strong>입금 계좌:</strong> 농협 000-0000-0000-00</p>
                <p><strong>예금주:</strong> 팬더골프</p>
                <p><strong>입금 금액:</strong> {formatPrice(order.totalAmount)}</p>
                <p className="mt-3 text-yellow-600">
                  ※ 입금 확인 후 배송 준비가 시작됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            {order.status === 'pending' && (
              <button 
                className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                onClick={() => {
                  if (confirm('주문을 취소하시겠습니까?')) {
                    alert('주문 취소 기능은 고객센터로 문의해주세요.');
                  }
                }}
              >
                주문 취소
              </button>
            )}
            
            {order.status === 'delivered' && (
              <button 
                className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                onClick={() => {
                  alert('리뷰 작성 기능은 추후 제공될 예정입니다.');
                }}
              >
                리뷰 작성
              </button>
            )}
            
            <button 
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              onClick={() => {
                alert('재주문 기능은 추후 제공될 예정입니다.');
              }}
            >
              재주문
            </button>
            
            <Link
              href="/mypage/orders"
              className="block w-full px-4 py-3 bg-gray-600 text-white text-center rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              주문 목록으로
            </Link>
          </div>

          {/* 고객센터 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">고객센터 안내</h4>
            <p className="text-sm text-blue-700">
              주문 관련 문의사항이 있으시면<br />
              고객센터로 연락해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
