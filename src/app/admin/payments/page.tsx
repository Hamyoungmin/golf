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
      render: (payment: PaymentInfo) => (
        <div>
          <p className="font-medium text-blue-600 cursor-pointer hover:underline"
             onClick={() => router.push(`/admin/orders/${payment.orderId}`)}>
            {payment.orderId}
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
          </div>
        );
      },
    },
    {
      key: 'bankTransferInfo',
      header: '입금정보',
      render: (payment: PaymentInfo) => {
        const info = payment.bankTransferInfo;
        if (!info) return <span className="text-gray-400">정보 없음</span>;
        
        return (
          <div className="text-sm">
            <p><strong>입금자:</strong> {info.depositorName}</p>
            <p><strong>금액:</strong> {formatCurrency(info.transferAmount)}</p>
            <p><strong>은행:</strong> {info.bankName}</p>
            {info.transferDate && (
              <p className="text-xs text-gray-500">
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
      render: (payment: PaymentInfo) => (
        <div>
          <span className="font-medium">{formatCurrency(payment.amount)}</span>
          {payment.bankTransferInfo && payment.bankTransferInfo.transferAmount !== payment.amount && (
            <p className="text-xs text-red-500">
              차액: {formatCurrency(payment.bankTransferInfo.transferAmount - payment.amount)}
            </p>
          )}
        </div>
      ),
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">입금 관리</h1>
        <p className="text-gray-600 mt-2">고객의 입금 내역을 확인하고 승인/거절할 수 있습니다.</p>
      </div>

      {/* 상태별 탭 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {paymentStatuses.map(status => (
            <button
              key={status.key}
              onClick={() => setSelectedStatus(status.key as 'pending' | 'confirmed' | 'rejected')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedStatus === status.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 검색 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="주문번호, 고객명, 이메일, 입금자명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* 결제 테이블 */}
      <div className="bg-white shadow rounded-lg">
        <DataTable
          data={filteredPayments.map(payment => ({ ...payment, id: payment.orderId }))}
          columns={columns}
          loading={loading}
          emptyMessage="입금 내역이 없습니다."
          actions={(payment) => (
            <div className="flex space-x-2">
              {payment.status === 'pending' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePaymentConfirm(payment.orderId, true);
                    }}
                    disabled={processing === payment.orderId}
                    className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    승인
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePaymentConfirm(payment.orderId, false);
                    }}
                    disabled={processing === payment.orderId}
                    className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    거절
                  </button>
                </>
              )}
              {payment.status !== 'pending' && (
                <span className="text-gray-400 text-sm">
                  {payment.verifiedAt && `${formatDate(payment.verifiedAt)} 처리됨`}
                </span>
              )}
            </div>
          )}
        />
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <BanknotesIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              입금 내역을 확인한 후 승인/거절 처리해주세요. 승인 시 자동으로 주문 상태가 &quot;결제 완료&quot;로 변경됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
