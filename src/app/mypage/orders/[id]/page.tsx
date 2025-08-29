'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getOrder, getOrderStatusText, getOrderStatusColor } from '@/lib/orders';
import { useSettings } from '@/contexts/SettingsContext';
import { COMPANY_BANK_ACCOUNTS } from '@/lib/payments';
import { Order } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  
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
      case 'toss_payments':
        return '토스페이먼츠';
      case 'card':
        return '신용카드';
      case 'kakaopay':
        return '카카오페이';
      case 'naverpay':
        return '네이버페이';
      case 'phone':
        return '휴대폰 결제';
      default:
        return method;
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#666' }}>
          주문 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto',
              backgroundColor: '#dc3545',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              color: 'white'
            }}>
              ❌
            </div>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
            오류 발생
          </h2>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '16px' }}>{error}</p>
          <Link 
            href="/mypage/orders" 
            style={{
              display: 'inline-block',
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#007bff';
            }}
          >
            주문 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = order.totalAmount >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.baseShippingCost;
  const productTotal = order.totalAmount - shippingCost;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
            주문 상세
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            주문번호: <span style={{ fontWeight: '600', color: '#007bff' }}>{order.orderId}</span>
          </p>
        </div>
        <Link 
          href="/mypage/orders"
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#333',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: '#fff',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.backgroundColor = '#f8f9fa';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.backgroundColor = '#fff';
          }}
        >
          ← 주문 목록
        </Link>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '25px'
      }}>
        {/* 주요 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* 주문 상태 */}
          <div style={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            padding: '25px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333' }}>주문 상태</h2>
              <span style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                fontSize: '14px', 
                fontWeight: '500',
                backgroundColor: order.status === 'delivered' ? '#d4edda' : 
                               order.status === 'shipped' ? '#cce5ff' :
                               order.status === 'paid' ? '#d1ecf1' :
                               order.status === 'payment_pending' ? '#fff3cd' : '#f8d7da',
                color: order.status === 'delivered' ? '#155724' : 
                       order.status === 'shipped' ? '#004085' :
                       order.status === 'paid' ? '#0c5460' :
                       order.status === 'payment_pending' ? '#856404' : '#721c24'
              }}>
                {getOrderStatusText(order.status)}
              </span>
            </div>
            
            {/* 진행 단계 표시 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', overflow: 'auto' }}>
              {order.status === 'cancelled' ? 
                // 취소된 주문의 경우 다른 단계 표시
                [
                  { key: 'pending', label: '주문접수', active: true },
                  { key: 'cancelled', label: '주문취소', active: true }
                ].map((step, index, array) => (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', minWidth: '120px' }}>
                    <div style={{ textAlign: 'center', color: step.key === 'cancelled' ? '#dc3545' : '#007bff' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        margin: '0 auto 8px', 
                        backgroundColor: step.key === 'cancelled' ? '#dc3545' : '#007bff'
                      }}></div>
                      <span>{step.label}</span>
                    </div>
                    {index < array.length - 1 && (
                      <div style={{ 
                        flex: 1, 
                        height: '2px', 
                        margin: '0 8px', 
                        backgroundColor: '#dc3545',
                        minWidth: '20px'
                      }}></div>
                    )}
                  </div>
                ))
                :
                // 정상 주문의 경우 기존 단계 표시
                [
                  { key: 'pending', label: '주문접수', active: ['pending', 'payment_pending', 'paid', 'shipped', 'delivered'].includes(order.status) },
                  { key: 'payment_pending', label: '결제대기', active: ['payment_pending', 'paid', 'shipped', 'delivered'].includes(order.status) },
                  { key: 'paid', label: '결제완료', active: ['paid', 'shipped', 'delivered'].includes(order.status) },
                  { key: 'shipped', label: '배송중', active: ['shipped', 'delivered'].includes(order.status) },
                  { key: 'delivered', label: '배송완료', active: order.status === 'delivered' }
                ].map((step, index, array) => (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', minWidth: '80px' }}>
                  <div style={{ textAlign: 'center', color: step.active ? '#007bff' : '#999' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      margin: '0 auto 8px', 
                      backgroundColor: step.active ? '#007bff' : '#ddd'
                    }}></div>
                    <span>{step.label}</span>
                  </div>
                  {index < array.length - 1 && (
                    <div style={{ 
                      flex: 1, 
                      height: '2px', 
                      margin: '0 8px', 
                      backgroundColor: array[index + 1].active ? '#007bff' : '#ddd',
                      minWidth: '20px'
                    }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 주문 상품 */}
          <div style={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            padding: '25px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px'
            }}>
              주문 상품
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {order.items.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '15px 0',
                  borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontWeight: '500', 
                      fontSize: '16px', 
                      marginBottom: '8px', 
                      color: '#333' 
                    }}>
                      {item.productName}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      개당 {formatPrice(item.price)} × {item.quantity}개
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 배송 정보 */}
          <div style={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            padding: '25px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px'
            }}>
              배송 정보
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#666', 
                    marginBottom: '4px' 
                  }}>
                    우편번호
                  </label>
                  <p style={{ color: '#333', fontWeight: '500' }}>{order.shippingAddress.zipCode}</p>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#666', 
                    marginBottom: '4px' 
                  }}>
                    시/도
                  </label>
                  <p style={{ color: '#333', fontWeight: '500' }}>{order.shippingAddress.state}</p>
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#666', 
                  marginBottom: '4px' 
                }}>
                  시/군/구
                </label>
                <p style={{ color: '#333', fontWeight: '500' }}>{order.shippingAddress.city}</p>
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#666', 
                  marginBottom: '4px' 
                }}>
                  상세주소
                </label>
                <p style={{ color: '#333', fontWeight: '500' }}>{order.shippingAddress.street}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 정보 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* 주문 요약 */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            padding: '25px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333'
            }}>
              주문 요약
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>주문일시</span>
                <span style={{ color: '#333', fontWeight: '500' }}>{formatDate(order.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>결제방법</span>
                <span style={{ color: '#333', fontWeight: '500' }}>{getPaymentMethodText(order.paymentMethod)}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#333' }}>상품 총액</span>
                <span style={{ color: '#333', fontWeight: '500' }}>{formatPrice(productTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#333' }}>배송비</span>
                <span style={{ color: '#333', fontWeight: '500' }}>{shippingCost === 0 ? '무료' : formatPrice(shippingCost)}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600' }}>
                <span style={{ color: '#333' }}>총 결제금액</span>
                <span style={{ color: '#007bff' }}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* 주문 상태별 안내 */}
          {order.status === 'pending' && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeeba', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#856404' 
              }}>
                📋 주문 접수 완료
              </h3>
              <div style={{ fontSize: '14px', color: '#856404', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p>주문이 정상적으로 접수되었습니다.</p>
                <p>관리자 확인 후 결제 안내를 드리겠습니다.</p>
              </div>
            </div>
          )}
          
          {order.status === 'payment_pending' && (
            <div style={{ 
              backgroundColor: '#e8f4fd', 
              border: '1px solid #bee5eb', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#0c5460' 
              }}>
                💰 입금 안내
              </h3>
              <div style={{ fontSize: '14px', color: '#0c5460', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  backgroundColor: '#fff', 
                  padding: '15px', 
                  borderRadius: '6px', 
                  border: '1px solid #ddd' 
                }}>
                  {COMPANY_BANK_ACCOUNTS.map((account, index) => (
                    <div key={index} style={{ marginBottom: index < COMPANY_BANK_ACCOUNTS.length - 1 ? '15px' : '0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <strong style={{ color: '#007bff' }}>{account.bankName}</strong>
                        <span style={{ fontSize: '12px', color: '#666' }}>예금주: {account.accountHolder}</span>
                      </div>
                      <div style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: '#333',
                        backgroundColor: '#f8f9fa',
                        padding: '8px',
                        borderRadius: '4px'
                      }}>
                        {account.accountNumber}
                      </div>
                    </div>
                  ))}
                </div>
                <p><strong>💵 입금 금액:</strong> {formatPrice(order.totalAmount)}</p>
                <p style={{ marginTop: '8px', color: '#007bff', fontWeight: '500' }}>
                  ※ 입금 확인 후 배송 준비가 시작됩니다.
                </p>
              </div>
            </div>
          )}
          
          {order.status === 'shipped' && (
            <div style={{ 
              backgroundColor: '#cce5ff', 
              border: '1px solid #9fc5e8', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#004085' 
              }}>
                🚚 배송중
              </h3>
              <div style={{ fontSize: '14px', color: '#004085' }}>
                <p>상품이 배송 중입니다. 곧 받아보실 수 있습니다.</p>
              </div>
            </div>
          )}
          
          {order.status === 'paid' && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              border: '1px solid #c3e6cb', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#155724' 
              }}>
                ✅ 결제 완료
              </h3>
              <div style={{ fontSize: '14px', color: '#155724' }}>
                <p>결제가 완료되었습니다. 배송 준비 중입니다.</p>
              </div>
            </div>
          )}
          
          {order.status === 'cancelled' && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              border: '1px solid #f5c6cb', 
              borderRadius: '8px', 
              padding: '25px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#721c24' 
              }}>
                ❌ 주문 취소
              </h3>
              <div style={{ fontSize: '14px', color: '#721c24' }}>
                <p>주문이 취소되었습니다. 문의사항이 있으시면 고객센터로 연락해주세요.</p>
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(order.status === 'pending' || order.status === 'payment_pending') && (
              <button 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #f5c6cb',
                  color: '#721c24',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f8d7da';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#fff';
                }}
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#007bff';
                }}
                onClick={() => {
                  alert('리뷰 작성 기능은 추후 제공될 예정입니다.');
                }}
              >
                ⭐ 리뷰 작성
              </button>
            )}
            
            {order.status !== 'cancelled' && (
              <button 
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                color: '#333',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#fff';
              }}
              onClick={() => {
                alert('재주문 기능은 추후 제공될 예정입니다.');
              }}
            >
              🔄 재주문
              </button>
            )}
            
            <Link
              href="/mypage/orders"
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                textAlign: 'center',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#545b62';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#6c757d';
              }}
            >
              📋 주문 목록으로
            </Link>
          </div>

          {/* 고객센터 안내 */}
          <div style={{ 
            backgroundColor: '#e8f4fd', 
            border: '1px solid #bee5eb', 
            borderRadius: '8px', 
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📞</div>
              <h4 style={{ 
                fontWeight: '600', 
                color: '#0c5460', 
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                고객센터 안내
              </h4>
              <p style={{ fontSize: '14px', color: '#0c5460', lineHeight: '1.5' }}>
                주문 관련 문의사항이 있으시면<br />
                <strong>고객센터</strong>로 연락해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
