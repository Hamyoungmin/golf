'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import DataTable from '@/components/admin/DataTable';
import { getAllOrders, getOrderStatusText, getOrderStatusColor } from '@/lib/orders';
import { getUserData } from '@/lib/users';
import { Order, OrderStatus, User } from '@/types';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [userCache, setUserCache] = useState<{ [key: string]: User }>({});

  const orderStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orderList = await getAllOrders(50, undefined, selectedStatus || undefined);
      setOrders(orderList);

      // 사용자 정보 캐싱
      const uniqueUserIds = [...new Set(orderList.map(order => order.userId))];
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
    } catch (error) {
      console.error('주문 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
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
      render: (order: Order) => (
        <div>
          <p className="font-medium text-gray-900">{order.orderId}</p>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: '고객정보',
      render: (order: Order) => {
        const user = userCache[order.userId];
        return (
          <div>
            <p className="font-medium">{user?.name || '알 수 없음'}</p>
            <p className="text-xs text-gray-500">{user?.email || order.userId}</p>
          </div>
        );
      },
    },
    {
      key: 'items',
      header: '주문상품',
      render: (order: Order) => (
        <div>
          <p className="text-sm">
            {order.items[0].productName}
            {order.items.length > 1 && ` 외 ${order.items.length - 1}개`}
          </p>
          <p className="text-xs text-gray-500">
            총 {order.items.reduce((sum, item) => sum + item.quantity, 0)}개
          </p>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: '주문금액',
      render: (order: Order) => (
        <span className="font-medium">{formatPrice(order.totalAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      render: (order: Order) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
          {getOrderStatusText(order.status)}
        </span>
      ),
    },
    {
      key: 'shippingAddress',
      header: '배송지',
      render: (order: Order) => (
        <div className="text-sm">
          <p>{order.shippingAddress.city} {order.shippingAddress.state}</p>
          <p className="text-xs text-gray-500">{order.shippingAddress.street}</p>
        </div>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => {
    // 검색어 필터
    if (searchTerm) {
      const user = userCache[order.userId];
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.orderId.toLowerCase().includes(searchLower) ||
        (user?.name && user.name.toLowerCase().includes(searchLower)) ||
        (user?.email && user.email.toLowerCase().includes(searchLower)) ||
        order.items.some(item => item.productName.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // 날짜 필터
    if (dateRange.start || dateRange.end) {
      const orderDate = new Date(order.createdAt).getTime();
      if (dateRange.start && orderDate < new Date(dateRange.start).getTime()) return false;
      if (dateRange.end && orderDate > new Date(dateRange.end).getTime() + 86400000) return false; // +1일
    }

    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">주문 관리</h1>
      </div>

      {/* 상태별 탭 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedStatus('')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedStatus === ''
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            전체
          </button>
          {orderStatuses.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedStatus === status
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getOrderStatusText(status)}
            </button>
          ))}
        </nav>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="주문번호, 고객명, 이메일, 상품명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="시작일"
            />
          </div>
          
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="종료일"
            />
          </div>
        </div>
      </div>

      {/* 주문 테이블 */}
      <div className="bg-white shadow rounded-lg">
        <DataTable
          data={filteredOrders.map(order => ({ ...order, id: order.orderId }))}
          columns={columns}
          loading={loading}
          emptyMessage="주문이 없습니다."
          onRowClick={(order) => router.push(`/admin/orders/${order.orderId}`)}
          actions={(order) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/orders/${order.orderId}`);
              }}
              className="text-green-600 hover:text-green-900 flex items-center gap-1"
            >
              <DocumentTextIcon className="h-4 w-4" />
              상세보기
            </button>
          )}
        />
      </div>

      {/* 안내 메시지 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <ExclamationCircleIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              주문을 클릭하면 상세 정보를 확인하고 상태를 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
