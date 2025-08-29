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

    const { customConfirm } = await import('@/utils/alertUtils');
    const confirmed = await customConfirm(`주문 상태를 "${getOrderStatusText(newStatus)}"로 변경하시겠습니까?`, '주문 상태 변경');
    if (!confirmed) {
      return;
    }

    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder({ ...order, status: newStatus });
      const { triggerCustomAlert } = await import('@/utils/alertUtils');
      triggerCustomAlert('주문 상태가 변경되었습니다.', 'success');
    } catch (error) {
      console.error('주문 상태 변경 실패:', error);
      const { triggerCustomAlert } = await import('@/utils/alertUtils');
      triggerCustomAlert('주문 상태 변경에 실패했습니다.', 'error');
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '300px',
        fontSize: '16px',
        color: '#666'
      }}>
        주문 정보를 불러오는 중...
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/admin/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#666',
              textDecoration: 'none'
            }}
          >
            ← 주문 목록으로 돌아가기
          </Link>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '5px'
            }}>
              주문 상세
            </h1>
            <p style={{ color: '#666', fontSize: '14px' }}>주문번호: {order.orderId}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusText(order.status)}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* 주문 상품 */}
          <div>
            <h3 style={{ 
              fontWeight: 'bold', 
              marginBottom: '15px',
              fontSize: '18px',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px'
            }}>
              주문 상품
            </h3>
            <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#666' }}>상품</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '500', color: '#666' }}>수량</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#666' }}>가격</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#666' }}>소계</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => {
                    const product = products[item.productId];
                    return (
                      <tr key={index} style={{ borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none' }}>
                        <td style={{ padding: '15px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {product && (
                              <img
                                src={product.images[0] || '/placeholder.jpg'}
                                alt={item.productName}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  border: '1px solid #ddd'
                                }}
                              />
                            )}
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{item.productName}</p>
                              {product && (
                                <p style={{ fontSize: '12px', color: '#666' }}>{product.category} / {product.brand}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '15px 12px', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</td>
                        <td style={{ padding: '15px 12px', textAlign: 'right', fontSize: '14px' }}>{formatPrice(item.price)}</td>
                        <td style={{ padding: '15px 12px', textAlign: 'right', fontSize: '14px', fontWeight: '500' }}>{formatPrice(item.totalPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <td colSpan={3} style={{ padding: '15px 12px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold' }}>총 결제금액</td>
                    <td style={{ padding: '15px 12px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>{formatPrice(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 주문 관리 섹션 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            {/* 왼쪽: 주문 관리 */}
            <div>
              <h3 style={{ 
                fontWeight: 'bold', 
                marginBottom: '15px',
                fontSize: '18px',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '8px'
              }}>
                주문 관리
              </h3>
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '20px', 
                backgroundColor: '#f8f9fa' 
              }}>
                {/* pending 상태일 때 주문 수락/거절 버튼 */}
                {order.status === 'pending' && (
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '15px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    borderRadius: '4px' 
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#856404' }}>
                      새로운 주문이 접수되었습니다
                    </h4>
                    <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '15px', lineHeight: '1.4' }}>
                      주문 내용을 확인하신 후 수락 또는 거절해주세요. 수락하시면 고객에게 결제 안내가 발송됩니다.
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleStatusChange('payment_pending')}
                        disabled={updating}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: updating ? '#ccc' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: updating ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        주문 수락
                      </button>
                      <button
                        onClick={async () => {
                          const { customPrompt } = await import('@/utils/alertUtils');
                          const reason = await customPrompt('주문 거절 사유를 입력해주세요:', '', '주문 거절');
                          if (reason) {
                            handleStatusChange('cancelled');
                          }
                        }}
                        disabled={updating}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: updating ? '#ccc' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: updating ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        주문 거절
                      </button>
                    </div>
                  </div>
                )}

                {/* 일반 상태 변경 버튼들 */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#495057' }}>
                    주문 상태 변경
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(['pending', 'payment_pending', 'paid', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={order.status === status || updating}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: '500',
                          backgroundColor: order.status === status ? '#e9ecef' : '#fff',
                          color: order.status === status ? '#6c757d' : '#495057',
                          border: '1px solid #ced4da',
                          cursor: order.status === status || updating ? 'not-allowed' : 'pointer',
                          opacity: order.status === status || updating ? 0.6 : 1
                        }}
                      >
                        {getOrderStatusText(status)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 결제 확인 섹션 */}
                {order.status === 'payment_pending' && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#d1ecf1', 
                    border: '1px solid #bee5eb', 
                    borderRadius: '4px' 
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#0c5460' }}>
                      결제 대기 중
                    </h4>
                    <p style={{ fontSize: '13px', color: '#0c5460', marginBottom: '15px', lineHeight: '1.4' }}>
                      고객에게 결제 안내가 발송되었습니다. 입금 확인 후 '결제 완료'로 상태를 변경해주세요.
                    </p>
                    <div style={{ 
                      backgroundColor: '#fff', 
                      padding: '10px', 
                      borderRadius: '4px', 
                      border: '1px solid #ced4da' 
                    }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '5px', color: '#495057' }}>계좌 정보</p>
                      <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '3px' }}>신한은행 110-123-456789 (주)골프샵</p>
                      <p style={{ fontSize: '13px', color: '#6c757d' }}>입금액: {formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                )}

                {/* 배송 시작 섹션 */}
                {order.status === 'paid' && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#d4edda', 
                    border: '1px solid #c3e6cb', 
                    borderRadius: '4px' 
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#155724' }}>
                      배송 준비
                    </h4>
                    <p style={{ fontSize: '13px', color: '#155724', marginBottom: '15px', lineHeight: '1.4' }}>
                      결제가 완료되었습니다. 상품을 포장하고 배송을 시작해주세요.
                    </p>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '13px', 
                      fontWeight: '500', 
                      marginBottom: '8px', 
                      color: '#495057' 
                    }}>
                      송장번호
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="송장번호를 입력하세요"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (trackingNumber.trim()) {
                            handleStatusChange('shipped');
                          } else {
                            const { triggerCustomAlert } = await import('@/utils/alertUtils');
                            triggerCustomAlert('송장번호를 입력해주세요.', 'warning');
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        배송 시작
                      </button>
                    </div>
                  </div>
                )}

                {/* 배송 완료 섹션 */}
                {order.status === 'shipped' && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#e2e3ff', 
                    border: '1px solid #c5c6f4', 
                    borderRadius: '4px' 
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '10px', color: '#4c4ddb' }}>
                      배송 중
                    </h4>
                    <p style={{ fontSize: '13px', color: '#4c4ddb', marginBottom: '15px', lineHeight: '1.4' }}>
                      상품이 배송 중입니다. 고객이 상품을 받으면 '배송 완료'로 상태를 변경해주세요.
                    </p>
                    <button
                      onClick={() => handleStatusChange('delivered')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      배송 완료 처리
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 고객 및 기타 정보 */}
            <div>
              <h3 style={{ 
                fontWeight: 'bold', 
                marginBottom: '15px',
                fontSize: '18px',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '8px'
              }}>
                주문 정보
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 고객 정보 */}
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  padding: '15px', 
                  backgroundColor: '#fff' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    <UserIcon style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                    고객 정보
                  </div>
                  {user ? (
                    <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                      <p style={{ marginBottom: '5px' }}>
                        <span style={{ fontWeight: '500' }}>이름:</span> {user.name}
                      </p>
                      <p style={{ marginBottom: '5px' }}>
                        <span style={{ fontWeight: '500' }}>이메일:</span> {user.email}
                      </p>
                      {user.phone && (
                        <p style={{ marginBottom: '8px' }}>
                          <span style={{ fontWeight: '500' }}>전화번호:</span> {user.phone}
                        </p>
                      )}
                      <Link
                        href={`/admin/customers/${user.uid}`}
                        style={{
                          color: '#007bff',
                          textDecoration: 'none',
                          fontSize: '12px',
                          borderTop: '1px solid #eee',
                          paddingTop: '8px',
                          display: 'block'
                        }}
                      >
                        고객 상세정보 보기 →
                      </Link>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#6c757d' }}>고객 정보를 불러올 수 없습니다.</p>
                  )}
                </div>

                {/* 배송 정보 */}
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  padding: '15px', 
                  backgroundColor: '#fff' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    <MapPinIcon style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                    배송 정보
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <p style={{ marginBottom: '3px' }}>{order.shippingAddress.street}</p>
                    <p style={{ marginBottom: '3px' }}>{order.shippingAddress.city} {order.shippingAddress.state}</p>
                    <p>{order.shippingAddress.zipCode}</p>
                  </div>
                </div>

                {/* 결제 정보 */}
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  padding: '15px', 
                  backgroundColor: '#fff' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    <CreditCardIcon style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                    결제 정보
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <p style={{ marginBottom: '5px' }}>
                      <span style={{ fontWeight: '500' }}>결제 방법:</span> 무통장입금
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>결제 금액:</span> {formatPrice(order.totalAmount)}
                    </p>
                    {order.status === 'payment_pending' && (
                      <div style={{
                        padding: '8px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        <p style={{ fontWeight: '500', color: '#856404', marginBottom: '2px' }}>결제 대기 중</p>
                        <p style={{ color: '#6c757d' }}>고객이 입금할 때까지 대기</p>
                      </div>
                    )}
                    {order.status === 'paid' && (
                      <div style={{
                        padding: '8px',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        <p style={{ fontWeight: '500', color: '#155724' }}>결제 완료</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 주문 시간 정보 */}
                <div style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  padding: '15px', 
                  backgroundColor: '#fff' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    <ClockIcon style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                    주문 시간 정보
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <p style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500' }}>주문일시:</span><br />
                      <span style={{ color: '#6c757d' }}>{formatDate(order.createdAt)}</span>
                    </p>
                    <p>
                      <span style={{ fontWeight: '500' }}>최종수정:</span><br />
                      <span style={{ color: '#6c757d' }}>{formatDate(order.updatedAt)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 주문 메모 */}
          <div>
            <h3 style={{ 
              fontWeight: 'bold', 
              marginBottom: '15px',
              fontSize: '18px',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px'
            }}>
              주문 메모
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="주문에 대한 메모를 남기세요..."
              />
              <button 
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                메모 저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
