'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// 사용하지 않는 아이콘들 제거
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

  const orderStatuses: OrderStatus[] = ['pending', 'payment_pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  const fetchOrders = useCallback(async () => {
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
  }, [selectedStatus, userCache]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        <div className="relative">
          {order.status === 'pending' && (
            <div className="absolute -left-2 top-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}
          <p className={`font-medium ${
            order.status === 'pending' ? 'text-red-600' : 'text-gray-900'
          }`}>
            {order.orderId}
            {order.status === 'pending' && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                NEW
              </span>
            )}
          </p>
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
          주문 관리
        </h1>

      {/* 상태별 탭 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          주문 상태별 필터
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
            전체
          </button>
          {orderStatuses.map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedStatus === status ? '#fff' : '#666',
                backgroundColor: selectedStatus === status ? '#007bff' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              {getOrderStatusText(status)}
            </button>
          ))}
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
          주문 검색
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
              placeholder="주문번호, 고객명, 이메일, 상품명..."
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

      {/* 주문 테이블 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          주문 목록 ({filteredOrders.length}개)
        </h3>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: '#007bff',
                  backgroundColor: 'transparent',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                상세보기
              </button>
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
        💡 주문을 클릭하면 상세 정보를 확인하고 상태를 변경할 수 있습니다.
      </div>
      </div>
    </div>
  );
}
