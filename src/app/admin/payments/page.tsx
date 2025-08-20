'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import DataTable from '@/components/admin/DataTable';
import { 
  getPendingPayments, 
  getAllPayments, 
  updatePaymentStatus,
  getPaymentStatusText,
  getPaymentStatusColor,
  formatCurrency
} from '@/lib/payments';
import { getOrder, updateOrderStatus } from '@/lib/orders';
import { getUserData } from '@/lib/users';
import { PaymentInfo, User, Order } from '@/types';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Partial<PaymentInfo>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('pending');
  const [userCache, setUserCache] = useState<{ [key: string]: User }>({});
  const [orderCache, setOrderCache] = useState<{ [key: string]: Order }>({});
  const [processing, setProcessing] = useState<string | null>(null);

  const paymentStatuses = [
    { key: 'all', label: '전체' },
    { key: 'pending', label: '입금 대기' },
    { key: 'confirmed', label: '입금 확인' },
    { key: 'rejected', label: '입금 거절' }
  ];

  useEffect(() => {
    fetchPayments();
  }, [selectedStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let paymentList: Partial<PaymentInfo>[];
      
      if (selectedStatus === 'all') {
        paymentList = await getAllPayments(100);
      } else if (selectedStatus === 'pending') {
        paymentList = await getPendingPayments(100);
      } else {
        paymentList = await getAllPayments(100);
        // Filter by status (selectedStatus is guaranteed to be a specific status here)
        paymentList = paymentList.filter(payment => payment.status === selectedStatus);
      }
      
      setPayments(paymentList);

      // 사용자 정보 및 주문 정보 캐싱
      const uniqueUserIds = [...new Set(paymentList.map(payment => payment.userId).filter((id): id is string => Boolean(id)))];
      const uniqueOrderIds = [...new Set(paymentList.map(payment => payment.orderId).filter((id): id is string => Boolean(id)))];

      // 사용자 정보 가져오기
      const userPromises = uniqueUserIds.map(async (userId) => {
        if (!userCache[userId]) {
          const userData = await getUserData(userId);
          return { userId, userData };
        }
        return null;
      });

      // 주문 정보 가져오기
      const orderPromises = uniqueOrderIds.map(async (orderId) => {
        if (!orderCache[orderId]) {
          const orderData = await getOrder(orderId);
          return { orderId, orderData };
        }
        return null;
      });

      const [userResults, orderResults] = await Promise.all([
        Promise.all(userPromises),
        Promise.all(orderPromises)
      ]);

      const newUserCache: { [key: string]: User } = { ...userCache };
      userResults.forEach(result => {
        if (result && result.userData) {
          newUserCache[result.userId] = result.userData;
        }
      });
      setUserCache(newUserCache);

      const newOrderCache: { [key: string]: Order } = { ...orderCache };
      orderResults.forEach(result => {
        if (result && result.orderData) {
          newOrderCache[result.orderId] = result.orderData;
        }
      });
      setOrderCache(newOrderCache);

    } catch (error) {
      console.error('결제 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async (orderId: string, confirm: boolean, notes?: string) => {
    if (processing) return;
    
    const action = confirm ? '승인' : '거절';
    if (!window.confirm(`이 입금을 ${action}하시겠습니까?`)) return;

    setProcessing(orderId);
    try {
      const status = confirm ? 'confirmed' : 'rejected';
      await updatePaymentStatus(orderId, status, 'admin', notes);
      
      // 승인시 주문 상태도 업데이트
      if (confirm) {
        await updateOrderStatus(orderId, 'paid');
      }

      alert(`입금이 ${action}되었습니다.`);
      fetchPayments(); // 목록 새로고침
    } catch (error) {
      console.error(`입금 ${action} 오류:`, error);
      alert(`입금 ${action} 중 오류가 발생했습니다.`);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const columns = [
    {
      key: 'orderId',
      header: '주문번호',
      render: (payment: any) => (
        <div>
          <p style={{ 
            fontWeight: '500',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'none',
            margin: 0,
            marginBottom: '4px'
          }}
             onClick={() => router.push(`/admin/orders/${payment.orderId}`)}
             onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
             onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
            {payment.orderId}
          </p>
          <p style={{ 
            fontSize: '12px', 
            color: '#666',
            margin: 0
          }}>{formatDate(payment.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: '고객정보',
      render: (payment: PaymentInfo) => {
        const user = userCache[payment.userId];
        return (
          <div>
            <p style={{ 
              fontWeight: '500',
              margin: 0,
              marginBottom: '4px'
            }}>{user?.name || '알 수 없음'}</p>
            <p style={{ 
              fontSize: '12px', 
              color: '#666',
              margin: 0
            }}>{user?.email || payment.userId}</p>
          </div>
        );
      },
    },
    {
      key: 'bankTransferInfo',
      header: '입금정보',
      render: (payment: PaymentInfo) => {
        const info = payment.bankTransferInfo;
        if (!info) return <span style={{ color: '#999' }}>정보 없음</span>;
        
        return (
          <div style={{ fontSize: '14px' }}>
            <p style={{ margin: 0, marginBottom: '4px' }}><strong>입금자:</strong> {info.depositorName}</p>
            <p style={{ margin: 0, marginBottom: '4px' }}><strong>금액:</strong> {formatCurrency(info.transferAmount)}</p>
            <p style={{ margin: 0, marginBottom: '4px' }}><strong>은행:</strong> {info.bankName}</p>
            {info.transferDate && (
              <p style={{ 
                fontSize: '12px', 
                color: '#666',
                margin: 0
              }}>
                입금일: {formatDate(info.transferDate)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: '주문금액',
      render: (payment: any) => (
        <div>
          <span style={{ fontWeight: '500' }}>{formatCurrency(payment.amount)}</span>
          {payment.bankTransferInfo && payment.bankTransferInfo.transferAmount !== payment.amount && (
            <p style={{ 
              fontSize: '12px', 
              color: '#dc3545',
              margin: 0,
              marginTop: '4px'
            }}>
              차액: {formatCurrency(payment.bankTransferInfo.transferAmount - payment.amount)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: '상태',
      render: (payment: any) => {
        const statusColors = {
          pending: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
          confirmed: { bg: '#d1edff', color: '#155724', border: '#b3d7ff' }, 
          rejected: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }
        };
        const statusColor = statusColors[payment.status as keyof typeof statusColors] || statusColors.pending;
        
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: statusColor.bg,
            color: statusColor.color,
            border: `1px solid ${statusColor.border}`
          }}>
            {getPaymentStatusText(payment.status)}
          </span>
        );
      },
    },
  ];

    const filteredPayments = payments.filter(payment => {
    if (searchTerm) {
      const user = payment.userId ? userCache[payment.userId] : undefined;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (payment.orderId && payment.orderId.toLowerCase().includes(searchLower)) ||
        (user?.name && user.name.toLowerCase().includes(searchLower)) ||
        (user?.email && user.email.toLowerCase().includes(searchLower)) ||
        (payment.bankTransferInfo?.depositorName && 
          payment.bankTransferInfo.depositorName.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    return true;
  });

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          입금 관리
        </h1>
        <p style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '14px',
          color: '#666'
        }}>
          고객의 입금 내역을 확인하고 승인/거절할 수 있습니다.
        </p>

        {/* 상태별 탭 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            입금 상태별 조회
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px',
            marginBottom: '15px'
          }}>
            {paymentStatuses.map(status => (
              <button
                key={status.key}
                onClick={() => setSelectedStatus(status.key as 'pending' | 'confirmed' | 'rejected')}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: selectedStatus === status.key ? '#fff' : '#666',
                  backgroundColor: selectedStatus === status.key ? '#28a745' : '#f9f9f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedStatus !== status.key) {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStatus !== status.key) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            입금 내역 검색
          </h3>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <MagnifyingGlassIcon style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: '#999'
            }} />
            <input
              type="text"
              placeholder="주문번호, 고객명, 이메일, 입금자명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* 결제 테이블 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            입금 내역 ({filteredPayments.length}건)
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}>
            <DataTable
              data={filteredPayments.map(payment => ({ ...payment, id: payment.orderId || 'unknown' }))}
              columns={columns}
              loading={loading}
              emptyMessage="입금 내역이 없습니다."
              actions={(payment) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {payment.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (payment.orderId) handlePaymentConfirm(payment.orderId, true);
                        }}
                        disabled={processing === payment.orderId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#fff',
                          backgroundColor: processing === payment.orderId ? '#ccc' : '#28a745',
                          cursor: processing === payment.orderId ? 'not-allowed' : 'pointer',
                          opacity: processing === payment.orderId ? 0.5 : 1
                        }}
                      >
                        <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
                        승인
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (payment.orderId) handlePaymentConfirm(payment.orderId, false);
                        }}
                        disabled={processing === payment.orderId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#fff',
                          backgroundColor: processing === payment.orderId ? '#ccc' : '#dc3545',
                          cursor: processing === payment.orderId ? 'not-allowed' : 'pointer',
                          opacity: processing === payment.orderId ? 0.5 : 1
                        }}
                      >
                        <XCircleIcon style={{ width: '16px', height: '16px' }} />
                        거절
                      </button>
                    </>
                  )}
                  {payment.status !== 'pending' && (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {payment.verifiedAt && `${formatDate(payment.verifiedAt)} 처리됨`}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* 안내 메시지 */}
        <div style={{ 
          padding: '15px',
          border: '1px solid #b3d7ff',
          borderRadius: '4px',
          backgroundColor: '#f0f8ff',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <BanknotesIcon style={{ 
              width: '20px', 
              height: '20px', 
              color: '#0066cc',
              marginRight: '12px',
              marginTop: '2px',
              flexShrink: 0
            }} />
            <div>
              <p style={{ 
                fontSize: '14px', 
                color: '#0066cc',
                margin: 0,
                lineHeight: '1.5'
              }}>
                💡 입금 내역을 확인한 후 승인/거절 처리해주세요. 승인 시 자동으로 주문 상태가 "결제 완료"로 변경됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
