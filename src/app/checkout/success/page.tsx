'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrder } from '@/lib/orders';
import { Order } from '@/types';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('주문 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const orderData = await getOrder(orderId);
        if (orderData) {
          setOrder(orderData);
        } else {
          setError('주문을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('주문 조회 오류:', err);
        setError('주문 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

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

  if (loading) {
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
            href="/" 
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* 성공 메시지 */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-green-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">주문이 완료되었습니다!</h1>
          <p className="text-gray-600 mb-6">
            주문번호: <span className="font-semibold text-orange-600">{order.orderId}</span>
          </p>
          <p className="text-sm text-gray-500">
            주문 확인 및 배송 준비까지 1-2일 정도 소요됩니다.
          </p>
        </div>

        {/* 주문 정보 */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">주문 정보</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">주문일시</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제방법</span>
              <span>{getPaymentMethodText(order.paymentMethod)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">주문상태</span>
              <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-600">
                주문 접수
              </span>
            </div>
          </div>
        </div>

        {/* 주문 상품 */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">주문 상품</h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <h3 className="font-medium">{item.productName}</h3>
                  <p className="text-sm text-gray-600">
                    {formatPrice(item.price)} × {item.quantity}개
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">결제 정보</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>상품 총액</span>
              <span>{formatPrice(order.totalAmount - (order.totalAmount >= 30000 ? 0 : 3000))}</span>
            </div>
            <div className="flex justify-between">
              <span>배송비</span>
              <span>{order.totalAmount >= 30000 ? '무료' : '3,000원'}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-semibold">
              <span>총 결제금액</span>
              <span className="text-orange-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* 배송지 정보 */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">배송지 정보</h2>
          
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-600">우편번호:</span> {order.shippingAddress.zipCode}</p>
            <p><span className="text-gray-600">주소:</span> {order.shippingAddress.state} {order.shippingAddress.city}</p>
            <p><span className="text-gray-600">상세주소:</span> {order.shippingAddress.street}</p>
          </div>
        </div>

        {/* 결제 안내 (무통장 입금인 경우) */}
        {order.paymentMethod === 'bank_transfer' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">입금 안내</h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>입금 계좌:</strong> 농협 000-0000-0000-00 (예금주: 팬더골프)</p>
              <p><strong>입금 금액:</strong> {formatPrice(order.totalAmount)}</p>
              <p><strong>입금자명:</strong> 주문시 입력한 이름으로 입금해주세요</p>
              <p className="mt-3 text-yellow-600">
                ※ 입금 확인 후 배송 준비가 시작됩니다. (영업일 기준 1-2일)
              </p>
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/mypage/orders/${order.orderId}`}
            className="flex-1 bg-orange-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            주문 상세보기
          </Link>
          <Link
            href="/"
            className="flex-1 border border-gray-300 text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            쇼핑 계속하기
          </Link>
        </div>

        {/* 고객센터 안내 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>주문 관련 문의사항이 있으시면</p>
          <p>고객센터(전화)로 연락해주세요.</p>
        </div>
      </div>
    </div>
  );
}
