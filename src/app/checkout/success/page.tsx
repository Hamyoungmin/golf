'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrder } from '@/lib/orders';
import { getPaymentByOrderId, updateBankTransferInfo, COMPANY_BANK_ACCOUNTS } from '@/lib/payments';
import { useSettings } from '@/contexts/SettingsContext';
import { Order, PaymentInfo, BankTransferInfo } from '@/types';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { settings } = useSettings();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  
  // 입금 확인 폼 관련 state
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferData, setTransferData] = useState({
    depositorName: '',
    transferAmount: '',
    bankName: '',
    transferNote: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
          
          // 계좌이체인 경우 결제 정보도 가져오기
          if (orderData.paymentMethod === 'bank_transfer') {
            const paymentData = await getPaymentByOrderId(orderId);
            setPaymentInfo(paymentData);
            
            // 결제 금액 자동 입력
            setTransferData(prev => ({
              ...prev,
              transferAmount: orderData.totalAmount.toString()
            }));
          }
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

  // 입금 확인 폼 제출 핸들러
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId || !transferData.depositorName || !transferData.transferAmount || !transferData.bankName) {
      alert('모든 필수 정보를 입력해주세요.');
      return;
    }

    const transferAmount = parseInt(transferData.transferAmount.replace(/[^0-9]/g, ''));
    if (isNaN(transferAmount) || transferAmount <= 0) {
      alert('유효한 입금 금액을 입력해주세요.');
      return;
    }

    if (order && transferAmount !== order.totalAmount) {
      const confirmResult = confirm(`입금 금액(${formatPrice(transferAmount)})이 주문 금액(${formatPrice(order.totalAmount)})과 다릅니다. 계속하시겠습니까?`);
      if (!confirmResult) return;
    }

    setSubmitting(true);

    try {
      const bankTransferInfo: BankTransferInfo = {
        bankName: transferData.bankName,
        accountNumber: COMPANY_BANK_ACCOUNTS.find(acc => acc.bankName === transferData.bankName)?.accountNumber || '',
        accountHolder: COMPANY_BANK_ACCOUNTS.find(acc => acc.bankName === transferData.bankName)?.accountHolder || '',
        transferAmount,
        depositorName: transferData.depositorName,
        transferDate: new Date(),
        transferNote: transferData.transferNote || undefined,
      };

      await updateBankTransferInfo(orderId, {
        depositorName: transferData.depositorName,
        transferDate: new Date(),
        transferNote: transferData.transferNote || '',
      });
      
      alert('입금 정보가 등록되었습니다. 관리자 확인 후 주문이 처리됩니다.');
      setShowTransferForm(false);
      
      // 결제 정보 다시 가져오기
      const paymentData = await getPaymentByOrderId(orderId);
      setPaymentInfo(paymentData);
      
    } catch (error) {
      console.error('입금 정보 등록 오류:', error);
      alert('입금 정보 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

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
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 성공 메시지 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              color: 'white'
            }}>
              ✓
            </div>
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '16px', 
            color: '#333'
          }}>
            주문이 완료되었습니다!
          </h1>
          <p style={{ 
            color: '#666', 
            marginBottom: '24px',
            fontSize: '16px'
          }}>
            주문번호: <span style={{ fontWeight: '600', color: '#007bff' }}>{order.orderId}</span>
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#999'
          }}>
            주문 확인 및 배송 준비까지 1-2일 정도 소요됩니다.
          </p>
        </div>

        {/* 주문 정보 */}
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '30px',
          marginBottom: '25px',
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
            주문 정보
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>주문일시</span>
              <span style={{ color: '#333', fontWeight: '500' }}>{formatDate(order.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>결제방법</span>
              <span style={{ color: '#333', fontWeight: '500' }}>{getPaymentMethodText(order.paymentMethod)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>주문상태</span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                backgroundColor: '#fff3cd',
                color: '#856404',
                fontWeight: '500'
              }}>
                주문 접수
              </span>
            </div>
          </div>
        </div>

        {/* 주문 상품 */}
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '30px',
          marginBottom: '25px',
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
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '15px 0',
                borderBottom: index < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}>
                <div>
                  <h3 style={{ fontWeight: '500', marginBottom: '8px', color: '#333' }}>{item.productName}</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    {formatPrice(item.price)} × {item.quantity}개
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '600', fontSize: '16px', color: '#333' }}>{formatPrice(item.totalPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 정보 */}
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '30px',
          marginBottom: '25px',
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
            결제 정보
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>상품 총액</span>
              <span style={{ color: '#333', fontWeight: '500' }}>{formatPrice(order.totalAmount - (order.totalAmount >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.baseShippingCost))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>배송비</span>
              <span style={{ color: '#333', fontWeight: '500' }}>{order.totalAmount >= settings.shipping.freeShippingThreshold ? '무료' : formatPrice(settings.shipping.baseShippingCost)}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600' }}>
              <span style={{ color: '#333' }}>총 결제금액</span>
              <span style={{ color: '#007bff' }}>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* 배송지 정보 */}
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '30px',
          marginBottom: '30px',
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
            배송지 정보
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <p><span style={{ color: '#666' }}>우편번호:</span> <span style={{ color: '#333', fontWeight: '500' }}>{order.shippingAddress.zipCode}</span></p>
            <p><span style={{ color: '#666' }}>주소:</span> <span style={{ color: '#333', fontWeight: '500' }}>{order.shippingAddress.state} {order.shippingAddress.city}</span></p>
            <p><span style={{ color: '#666' }}>상세주소:</span> <span style={{ color: '#333', fontWeight: '500' }}>{order.shippingAddress.street}</span></p>
          </div>
        </div>

        {/* 계좌이체 관련 정보 */}
        {order.paymentMethod === 'bank_transfer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '30px' }}>
            {/* 입금 안내 */}
            <div style={{ 
              backgroundColor: '#e8f4fd', 
              border: '1px solid #bee5eb', 
              borderRadius: '8px', 
              padding: '25px'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '15px', 
                color: '#0c5460'
              }}>
                💰 입금 안내
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {COMPANY_BANK_ACCOUNTS.map((account, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#fff', 
                    padding: '20px', 
                    borderRadius: '6px', 
                    border: '1px solid #ddd',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontWeight: '600', 
                        color: '#007bff',
                        fontSize: '16px'
                      }}>
                        {account.bankName}
                      </span>
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#666'
                      }}>
                        예금주: {account.accountHolder}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      color: '#333',
                      fontFamily: 'monospace',
                      backgroundColor: '#f8f9fa',
                      padding: '8px',
                      borderRadius: '4px'
                    }}>
                      {account.accountNumber}
                    </div>
                  </div>
                ))}
                <div style={{ 
                  fontSize: '14px', 
                  color: '#0c5460', 
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: '#d1ecf1',
                  borderRadius: '6px'
                }}>
                  <p style={{ marginBottom: '8px' }}><strong>💵 입금 금액:</strong> {formatPrice(order.totalAmount)}</p>
                  <p style={{ marginBottom: '8px' }}><strong>👤 입금자명:</strong> 주문시 입력한 이름으로 입금해주세요</p>
                  <p style={{ 
                    marginTop: '12px', 
                    color: '#007bff',
                    fontWeight: '500'
                  }}>
                    ※ 입금 확인 후 배송 준비가 시작됩니다. (영업일 기준 1-2일)
                  </p>
                </div>
              </div>
            </div>

            {/* 입금 확인 상태 */}
            {paymentInfo && paymentInfo.bankTransferInfo ? (
              <div style={{ 
                backgroundColor: '#d4edda', 
                border: '1px solid #c3e6cb', 
                borderRadius: '8px', 
                padding: '25px'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '15px', 
                  color: '#155724'
                }}>
                  ✅ 입금 정보 등록됨
                </h3>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#155724', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px'
                }}>
                  <p><strong>입금자명:</strong> {paymentInfo.bankTransferInfo.depositorName}</p>
                  <p><strong>입금 금액:</strong> {formatPrice(paymentInfo.bankTransferInfo.transferAmount)}</p>
                  <p><strong>입금 은행:</strong> {paymentInfo.bankTransferInfo.bankName}</p>
                  {paymentInfo.bankTransferInfo.transferDate && (
                    <p><strong>입금일시:</strong> {formatDate(paymentInfo.bankTransferInfo.transferDate)}</p>
                  )}
                  {paymentInfo.bankTransferInfo.transferNote && (
                    <p><strong>참고사항:</strong> {paymentInfo.bankTransferInfo.transferNote}</p>
                  )}
                  <p style={{ 
                    marginTop: '12px', 
                    color: '#28a745',
                    fontWeight: '500'
                  }}>
                    ※ 관리자 확인 후 주문이 처리됩니다.
                  </p>
                </div>
              </div>
            ) : (
              /* 입금 확인 폼 */
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeeba', 
                borderRadius: '8px', 
                padding: '25px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '20px'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#856404'
                  }}>
                    📝 입금 완료 신고
                  </h3>
                  <button
                    onClick={() => setShowTransferForm(!showTransferForm)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#e0a800';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#ffc107';
                    }}
                  >
                    {showTransferForm ? '폼 닫기' : '입금 완료 신고하기'}
                  </button>
                </div>
                
                {showTransferForm && (
                  <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          marginBottom: '8px', 
                          color: '#856404'
                        }}>
                          입금자명 *
                        </label>
                        <input
                          type="text"
                          value={transferData.depositorName}
                          onChange={(e) => setTransferData(prev => ({ ...prev, depositorName: e.target.value }))}
                          placeholder="실제 입금하신 분의 성함"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ffeeba',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          marginBottom: '8px', 
                          color: '#856404'
                        }}>
                          입금 금액 *
                        </label>
                        <input
                          type="text"
                          value={transferData.transferAmount}
                          onChange={(e) => setTransferData(prev => ({ ...prev, transferAmount: e.target.value }))}
                          placeholder="입금하신 금액"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ffeeba',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          marginBottom: '8px', 
                          color: '#856404'
                        }}>
                          입금 은행 *
                        </label>
                        <select
                          value={transferData.bankName}
                          onChange={(e) => setTransferData(prev => ({ ...prev, bankName: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ffeeba',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                          required
                        >
                          <option value="">입금하신 은행을 선택하세요</option>
                          {COMPANY_BANK_ACCOUNTS.map((account, index) => (
                            <option key={index} value={account.bankName}>
                              {account.bankName} ({account.accountNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          marginBottom: '8px', 
                          color: '#856404'
                        }}>
                          참고사항
                        </label>
                        <input
                          type="text"
                          value={transferData.transferNote}
                          onChange={(e) => setTransferData(prev => ({ ...prev, transferNote: e.target.value }))}
                          placeholder="기타 참고사항 (선택사항)"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ffeeba',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setShowTransferForm(false)}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#f8f9fa';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLButtonElement).style.backgroundColor = '#fff';
                        }}
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: submitting ? '#6c757d' : '#ffc107',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!submitting) {
                            (e.target as HTMLButtonElement).style.backgroundColor = '#e0a800';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!submitting) {
                            (e.target as HTMLButtonElement).style.backgroundColor = '#ffc107';
                          }
                        }}
                      >
                        {submitting ? '등록 중...' : '입금 완료 신고'}
                      </button>
                    </div>
                  </form>
                )}
                
                <div style={{ 
                  marginTop: '20px', 
                  fontSize: '14px', 
                  color: '#856404',
                  padding: '15px',
                  backgroundColor: '#f8f4e3',
                  borderRadius: '6px'
                }}>
                  <p style={{ marginBottom: '5px' }}>※ 입금 완료 후 위 폼을 작성해주시면 더 빠른 주문 처리가 가능합니다.</p>
                  <p>※ 입금 정보는 관리자 확인 후 처리됩니다.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼들 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px',
          marginBottom: '30px'
        }}>
          <Link
            href={`/mypage/orders/${order.orderId}`}
            style={{
              display: 'block',
              backgroundColor: '#007bff',
              color: 'white',
              textAlign: 'center',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.backgroundColor = '#007bff';
            }}
          >
            📋 주문 상세보기
          </Link>
          <Link
            href="/"
            style={{
              display: 'block',
              border: '1px solid #ddd',
              color: '#333',
              textAlign: 'center',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
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
            🛍️ 쇼핑 계속하기
          </Link>
        </div>

        {/* 고객센터 안내 */}
        <div style={{ 
          marginTop: '30px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#666',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '10px' }}>📞</div>
          <p style={{ marginBottom: '5px' }}>주문 관련 문의사항이 있으시면</p>
          <p><strong>고객센터</strong>로 연락해주세요.</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">주문 정보를 불러오는 중...</div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
