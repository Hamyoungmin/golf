'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, getOrderStatusText, getOrderStatusColor } from '@/lib/orders';
import { Order, OrderStatus } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // 주문 목록 로드
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userOrders = await getUserOrders(user.uid, 50); // 최대 50개
        setOrders(userOrders);
      } catch (error) {
        console.error('주문 목록 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 상태별 필터링
  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  // 상태별 개수 계산
  const statusCounts = {
    all: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    paid: orders.filter(order => order.status === 'paid').length,
    shipped: orders.filter(order => order.status === 'shipped').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length,
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">주문 내역을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">주문 내역</h1>
          <p className="text-gray-600 mt-2">총 {orders.length}개의 주문이 있습니다.</p>
        </div>
        <Link 
          href="/mypage"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← 마이페이지
        </Link>
      </div>

      {/* 상태별 탭 */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'all' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({statusCounts.all})
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'pending' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            주문 접수 ({statusCounts.pending})
          </button>
          <button
            onClick={() => setSelectedStatus('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'paid' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            결제 완료 ({statusCounts.paid})
          </button>
          <button
            onClick={() => setSelectedStatus('shipped')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'shipped' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            배송 중 ({statusCounts.shipped})
          </button>
          <button
            onClick={() => setSelectedStatus('delivered')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'delivered' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            배송 완료 ({statusCounts.delivered})
          </button>
          <button
            onClick={() => setSelectedStatus('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'cancelled' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            주문 취소 ({statusCounts.cancelled})
          </button>
        </div>
      </div>

      {/* 주문 목록 */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border rounded-lg p-16 text-center">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M9 3v18"/>
              <path d="M16 3v18"/>
              <path d="M3 9h18"/>
              <path d="M3 16h18"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">주문 내역이 없습니다</h3>
          <p className="text-gray-600 mb-6">
            {selectedStatus === 'all' 
              ? '아직 주문한 상품이 없습니다.' 
              : `${getOrderStatusText(selectedStatus as OrderStatus)} 상태의 주문이 없습니다.`
            }
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="bg-white border rounded-lg p-6">
              {/* 주문 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-lg mb-1">주문번호: {order.orderId}</h3>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusText(order.status)}
                  </span>
                  <Link 
                    href={`/mypage/orders/${order.orderId}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    상세보기
                  </Link>
                </div>
              </div>

              {/* 주문 상품 */}
              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.productName}</h4>
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

              {/* 주문 총액 */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">
                    결제방법: {order.paymentMethod === 'bank_transfer' ? '무통장 입금' : 
                              order.paymentMethod === 'card' ? '신용카드' : 
                              order.paymentMethod === 'kakao_pay' ? '카카오페이' : order.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">
                    총 {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {order.status === 'pending' && (
                  <button 
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                    onClick={() => {
                      if (confirm('주문을 취소하시겠습니까?')) {
                        // 주문 취소 로직 (추후 구현)
                        alert('주문 취소 기능은 고객센터로 문의해주세요.');
                      }
                    }}
                  >
                    주문 취소
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button 
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                    onClick={() => {
                      // 리뷰 작성 페이지로 이동 (추후 구현)
                      alert('리뷰 작성 기능은 추후 제공될 예정입니다.');
                    }}
                  >
                    리뷰 작성
                  </button>
                )}
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // 재주문 기능 (추후 구현)
                    alert('재주문 기능은 추후 제공될 예정입니다.');
                  }}
                >
                  재주문
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
