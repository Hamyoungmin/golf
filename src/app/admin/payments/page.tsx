'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DataTable from '@/components/admin/DataTable';
import { 
  getAllPayments, 
  getPendingPayments, 
  updatePaymentStatus, 
  getPaymentStatusText, 
  getPaymentStatusColor,
  formatCurrency 
} from '@/lib/payments';
import { getUserData } from '@/lib/users';
import { getOrderByOrderId } from '@/lib/orders';
import { PaymentInfo, User, Order } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { updateOrderStatus } from '@/lib/orders';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [userCache, setUserCache] = useState<{ [key: string]: User }>({});
  const [orderCache, setOrderCache] = useState<{ [key: string]: Order }>({});
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});

  const paymentStatuses = ['pending', 'confirmed', 'rejected'];

  useEffect(() => {
    fetchPayments();
  }, [selectedStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let paymentList;
      
      if (selectedStatus === 'pending') {
        paymentList = await getPendingPayments(100);
      } else if (selectedStatus === '') {
        paymentList = await getAllPayments(100);
      } else {
        const allPayments = await getAllPayments(100);
        paymentList = allPayments.filter(payment => payment.status === selectedStatus);
      }
      
      setPayments(paymentList as PaymentInfo[]);

      // 사용자 정보 및 주문 정보 캐싱
      const uniqueUserIds = [...new Set(paymentList.map(payment => payment.userId))];
      const uniqueOrderIds = [...new Set(paymentList.map(payment => payment.orderId))];

      // 사용자 정보 캐싱
      const userPromises = uniqueUserIds.map(async (userId) => {
        if (!userCache[userId]) {
          const userData = await getUserData(userId);
          return { userId, userData };
        }
        return null;
      });

      const userResults = await Promise.all(userPromises);
      const newUserCache: { [key: string]: User } = { ...userCache };
      userResults.forEach(result => {
        if (result && result.userData) {
          newUserCache[result.userId] = result.userData;
        }
      });
      setUserCache(newUserCache);

      // 주문 정보 캐싱
      const orderPromises = uniqueOrderIds.map(async (orderId) => {
        if (!orderCache[orderId]) {
          try {
            const orderData = await getOrderByOrderId(orderId);
            return { orderId, orderData };
          } catch (error) {
            console.error(`주문 정보 로드 실패 (${orderId}):`, error);
            return null;
          }
        }
        return null;
      });

      const orderResults = await Promise.all(orderPromises);
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

  const handlePaymentAction = async (paymentId: string, action: 'confirmed' | 'rejected', notes?: string) => {
    if (!user) return;
    
    setProcessing(prev => ({ ...prev, [paymentId]: true }));
    
    try {
      // 결제 상태 업데이트
      const success = await updatePaymentStatus(paymentId, action, user.uid, notes);
      
      if (success) {
        // 결제 승인 시 해당 주문 상태도 배송중으로 변경
        if (action === 'confirmed') {
          const orderUpdateSuccess = await updateOrderStatus(paymentId, 'shipped');
          if (!orderUpdateSuccess) {
            console.warn('주문 상태 업데이트 실패:', paymentId);
          }
        }
        // 결제 거부 시 주문 상태를 취소로 변경
        else if (action === 'rejected') {
          const orderUpdateSuccess = await updateOrderStatus(paymentId, 'cancelled');
          if (!orderUpdateSuccess) {
            console.warn('주문 상태 업데이트 실패:', paymentId);
          }
        }
        
        await fetchPayments(); // 목록 새로고침
        alert(`결제가 ${action === 'confirmed' ? '승인' : '거부'}되었습니다.${action === 'confirmed' ? ' 주문이 배송 준비 중입니다.' : ' 주문이 취소되었습니다.'}`);
      } else {
        alert('처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('결제 상태 업데이트 실패:', error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(prev => ({ ...prev, [paymentId]: false }));
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
      render: (payment: PaymentInfo) => (
        <div className="relative">
          {payment.status === 'pending' && (
            <div className="absolute -left-2 top-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}
          <p className={`font-medium ${
            payment.status === 'pending' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {payment.orderId}
            {payment.status === 'pending' && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                NEW
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
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
            <p className="font-medium">{user?.name || '알 수 없음'}</p>
            <p className="text-xs text-gray-500">{user?.email || payment.userId}</p>
            {user?.phone && (
              <p className="text-xs text-gray-500">{user.phone}</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: '결제금액',
      render: (payment: PaymentInfo) => (
        <div>
          <span className="font-medium text-lg">{formatCurrency(payment.amount)}</span>
          <p className="text-xs text-gray-500">{payment.paymentMethod === 'bank_transfer' ? '무통장입금' : payment.paymentMethod}</p>
        </div>
      ),
    },
    {
      key: 'bankTransferInfo',
      header: '입금정보',
      render: (payment: PaymentInfo) => {
        if (payment.paymentMethod !== 'bank_transfer' || !payment.bankTransferInfo) {
          return <span className="text-gray-400">-</span>;
        }
        
        const { depositorName, transferDate, transferNote } = payment.bankTransferInfo;
        
        return (
          <div className="text-sm">
            {depositorName && <p><strong>입금자:</strong> {depositorName}</p>}
            {transferDate && <p><strong>입금일:</strong> {formatDate(transferDate)}</p>}
            {transferNote && <p className="text-xs text-gray-500">{transferNote}</p>}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: '상태',
      render: (payment: PaymentInfo) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
          {getPaymentStatusText(payment.status)}
        </span>
      ),
    },
    {
      key: 'verifiedInfo',
      header: '처리정보',
      render: (payment: PaymentInfo) => {
        if (payment.status === 'pending') {
          return <span className="text-gray-400">대기중</span>;
        }
        
        return (
          <div className="text-xs">
            {payment.verifiedAt && <p>{formatDate(payment.verifiedAt)}</p>}
            {payment.verifiedBy && <p className="text-gray-500">처리자: {payment.verifiedBy}</p>}
            {payment.notes && <p className="text-gray-500 mt-1">{payment.notes}</p>}
          </div>
        );
      },
    },
  ];

  const filteredPayments = payments.filter(payment => {
    // 검색어 필터
    if (searchTerm) {
      const user = userCache[payment.userId];
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        payment.orderId.toLowerCase().includes(searchLower) ||
        (user?.name && user.name.toLowerCase().includes(searchLower)) ||
        (user?.email && user.email.toLowerCase().includes(searchLower)) ||
        (payment.bankTransferInfo?.depositorName && payment.bankTransferInfo.depositorName.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // 날짜 필터
    if (dateRange.start || dateRange.end) {
      const paymentDate = new Date(payment.createdAt).getTime();
      if (dateRange.start && paymentDate < new Date(dateRange.start).getTime()) return false;
      if (dateRange.end && paymentDate > new Date(dateRange.end).getTime() + 86400000) return false; // +1일
    }

    return true;
  });

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const confirmedCount = payments.filter(p => p.status === 'confirmed').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

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
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          입금 관리
        </h1>

        {/* 통계 현황 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            입금 현황
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                {payments.length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>전체 입금</div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: pendingCount > 0 ? '#fff3cd' : '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: pendingCount > 0 ? '#856404' : '#000' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>대기중</div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                {confirmedCount}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>승인완료</div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                {rejectedCount}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>거부</div>
            </div>
          </div>
        </div>

        {/* 상태별 탭 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            상태별 필터
          </h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px'
          }}>
            <button
              onClick={() => setSelectedStatus('')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedStatus === '' ? '#fff' : '#666',
                backgroundColor: selectedStatus === '' ? '#007bff' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              전체 ({payments.length})
            </button>
            
            <button
              onClick={() => setSelectedStatus('pending')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedStatus === 'pending' ? '#fff' : '#666',
                backgroundColor: selectedStatus === 'pending' ? '#ffc107' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              대기중 ({pendingCount})
            </button>
            
            <button
              onClick={() => setSelectedStatus('confirmed')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedStatus === 'confirmed' ? '#fff' : '#666',
                backgroundColor: selectedStatus === 'confirmed' ? '#28a745' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              승인완료 ({confirmedCount})
            </button>
            
            <button
              onClick={() => setSelectedStatus('rejected')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedStatus === 'rejected' ? '#fff' : '#666',
                backgroundColor: selectedStatus === 'rejected' ? '#dc3545' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              거부 ({rejectedCount})
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            입금 검색
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                검색어
              </label>
              <input
                type="text"
                placeholder="주문번호, 고객명, 이메일, 입금자명..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                시작일
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                종료일
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* 입금 테이블 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            입금 목록 ({filteredPayments.length}개)
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}>
            <DataTable
              data={filteredPayments.map(payment => ({ ...payment, id: payment.id || payment.orderId }))}
              columns={columns}
              loading={loading}
              emptyMessage="입금 내역이 없습니다."
              actions={(payment) => (
                <div style={{ display: 'flex', gap: '5px' }}>
                  {payment.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('이 입금을 승인하시겠습니까?')) {
                            handlePaymentAction(payment.id || payment.orderId, 'confirmed');
                          }
                        }}
                        disabled={processing[payment.id || payment.orderId]}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          color: '#fff',
                          backgroundColor: processing[payment.id || payment.orderId] ? '#6c757d' : '#28a745',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processing[payment.id || payment.orderId] ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <CheckIcon style={{ width: '12px', height: '12px' }} />
                        승인
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const reason = prompt('거부 사유를 입력하세요:');
                          if (reason && confirm('이 입금을 거부하시겠습니까?')) {
                            handlePaymentAction(payment.id || payment.orderId, 'rejected', reason);
                          }
                        }}
                        disabled={processing[payment.id || payment.orderId]}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          color: '#fff',
                          backgroundColor: processing[payment.id || payment.orderId] ? '#6c757d' : '#dc3545',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processing[payment.id || payment.orderId] ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <XMarkIcon style={{ width: '12px', height: '12px' }} />
                        거부
                      </button>
                    </>
                  )}
                  
                  {payment.status !== 'pending' && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#6c757d',
                      padding: '4px 8px'
                    }}>
                      처리완료
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
          backgroundColor: '#e8f4fd',
          border: '1px solid #bee5eb',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#0c5460'
        }}>
          💡 대기중인 입금을 승인하면 해당 주문이 배송중 상태로 변경됩니다. 거부 시 주문이 취소됩니다.
        </div>
      </div>
    </div>
  );
}
