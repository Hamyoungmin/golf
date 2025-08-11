'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  TruckIcon,
  CreditCardIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getOrder, updateOrderStatus, getOrderStatusText, getOrderStatusColor } from '@/lib/orders';
import { getUserData } from '@/lib/users';
import { getProduct } from '@/lib/products';
import { Order, OrderStatus, User, Product } from '@/types';

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<{ [key: string]: Product }>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderNote, setOrderNote] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // 주문 정보 가져오기
      const orderData = await getOrder(orderId);
      if (!orderData) {
        alert('주문을 찾을 수 없습니다.');
        router.push('/admin/orders');
        return;
      }
      setOrder(orderData);

      // 사용자 정보 가져오기
      const userData = await getUserData(orderData.userId);
      setUser(userData);

      // 상품 정보 가져오기
      const productPromises = orderData.items.map(item => getProduct(item.productId));
      const productResults = await Promise.all(productPromises);
      const productMap: { [key: string]: Product } = {};
      productResults.forEach((product, index) => {
        if (product) {
          productMap[orderData.items[index].productId] = product;
        }
      });
      setProducts(productMap);
    } catch (error) {
      console.error('주문 상세 정보 로딩 실패:', error);
      alert('주문 정보를 불러오는데 실패했습니다.');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;

    if (!confirm(`주문 상태를 "${getOrderStatusText(newStatus)}"로 변경하시겠습니까?`)) {
      return;
    }

    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder({ ...order, status: newStatus });
      alert('주문 상태가 변경되었습니다.');
    } catch (error) {
      console.error('주문 상태 변경 실패:', error);
      alert('주문 상태 변경에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          주문 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">주문 상세</h1>
              <p className="text-sm text-gray-500 mt-1">주문번호: {order.orderId}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 주문 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 주문 상품 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">주문 상품</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">수량</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">가격</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">소계</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, index) => {
                      const product = products[item.productId];
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {product && (
                                <img
                                  src={product.images[0] || '/placeholder.jpg'}
                                  alt={item.productName}
                                  className="h-10 w-10 rounded object-cover mr-3"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                {product && (
                                  <p className="text-xs text-gray-500">{product.category} / {product.brand}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-6 py-4 text-right text-sm text-gray-900">{formatPrice(item.price)}</td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{formatPrice(item.totalPrice)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">총 결제금액</td>
                      <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 주문 상태 변경 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">주문 상태 변경</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={order.status === status || updating}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        order.status === status
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {getOrderStatusText(status)}
                    </button>
                  ))}
                </div>

                {order.status === 'paid' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">송장번호</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="송장번호를 입력하세요"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      />
                      <button
                        onClick={() => {
                          if (trackingNumber) {
                            handleStatusChange('shipped');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        배송 시작
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 주문 메모 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">주문 메모</h2>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="주문에 대한 메모를 남기세요..."
              />
              <button className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                메모 저장
              </button>
            </div>
          </div>

          {/* 오른쪽: 고객 및 배송 정보 */}
          <div className="space-y-6">
            {/* 고객 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                고객 정보
              </h3>
              {user ? (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">이름:</span> {user.name}</p>
                  <p><span className="font-medium">이메일:</span> {user.email}</p>
                  {user.phone && <p><span className="font-medium">전화번호:</span> {user.phone}</p>}
                  <Link
                    href={`/admin/customers/${user.uid}`}
                    className="text-green-600 hover:text-green-700 text-xs"
                  >
                    고객 상세정보 보기 →
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500">고객 정보를 불러올 수 없습니다.</p>
              )}
            </div>

            {/* 배송 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                배송 정보
              </h3>
              <div className="space-y-2 text-sm">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city} {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.zipCode}</p>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                결제 정보
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">결제 방법:</span> {order.paymentMethod}</p>
                <p><span className="font-medium">결제 금액:</span> {formatPrice(order.totalAmount)}</p>
              </div>
            </div>

            {/* 주문 시간 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                주문 시간 정보
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">주문일시:</span><br />{formatDate(order.createdAt)}</p>
                <p><span className="font-medium">최종수정:</span><br />{formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
