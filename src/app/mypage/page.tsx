'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData } from '@/lib/users';
import { getUserOrders } from '@/lib/orders';
import { User as UserType, Order } from '@/types';

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [userData, setUserData] = useState<UserType | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // 사용자 정보 및 최근 주문 로드
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // 사용자 정보 로드
        const userInfo = await getUserData(user.uid);
        setUserData(userInfo);

        // 최근 주문 3개 로드
        const orders = await getUserOrders(user.uid, 3);
        setRecentOrders(orders);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '주문 접수';
      case 'paid':
        return '결제 완료';
      case 'shipped':
        return '배송 중';
      case 'delivered':
        return '배송 완료';
      case 'cancelled':
        return '주문 취소';
      default:
        return '알 수 없음';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'paid':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 사이드바 메뉴 */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg">{userData?.name || '사용자'}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            
            <nav className="space-y-2">
              <Link 
                href="/mypage" 
                className="block px-4 py-2 rounded bg-orange-50 text-orange-600 font-medium"
              >
                대시보드
              </Link>
              <Link 
                href="/mypage/orders" 
                className="block px-4 py-2 rounded hover:bg-gray-50 text-gray-700"
              >
                주문 내역
              </Link>
              <Link 
                href="/mypage/profile" 
                className="block px-4 py-2 rounded hover:bg-gray-50 text-gray-700"
              >
                회원정보 수정
              </Link>
              <Link 
                href="/mypage/wishlist" 
                className="block px-4 py-2 rounded hover:bg-gray-50 text-gray-700"
              >
                찜 목록
              </Link>
            </nav>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 사용자 정보 요약 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">회원 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <p className="text-gray-900">{userData?.name || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <p className="text-gray-900">{userData?.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상호명</label>
                <p className="text-gray-900">{userData?.businessNumber || '-'}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/mypage/profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                정보 수정
              </Link>
            </div>
          </div>

          {/* 주문 현황 */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">주문 현황</h2>
              <Link 
                href="/mypage/orders"
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                전체보기 →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M9 3v18"/>
                    <path d="M16 3v18"/>
                    <path d="M3 9h18"/>
                    <path d="M3 16h18"/>
                  </svg>
                </div>
                <p className="text-gray-500">주문 내역이 없습니다.</p>
                <Link 
                  href="/"
                  className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  쇼핑하러 가기
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.orderId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">주문번호: {order.orderId}</h3>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {order.items.length > 1 
                            ? `${order.items[0].productName} 외 ${order.items.length - 1}개`
                            : order.items[0]?.productName
                          }
                        </p>
                        <p className="font-semibold text-orange-600">{formatPrice(order.totalAmount)}</p>
                      </div>
                      <Link 
                        href={`/mypage/orders/${order.orderId}`}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        상세보기
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 퀵 액션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/mypage/orders"
              className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-gray-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <path d="M9 3v18"/>
                  <path d="M16 3v18"/>
                  <path d="M3 9h18"/>
                  <path d="M3 16h18"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">주문 내역</h3>
              <p className="text-sm text-gray-600">나의 주문 현황을 확인하세요</p>
            </Link>

            <Link 
              href="/mypage/wishlist"
              className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-gray-400">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">찜 목록</h3>
              <p className="text-sm text-gray-600">관심 상품을 확인하세요</p>
            </Link>

            <Link 
              href="/mypage/profile"
              className="bg-white border rounded-lg p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-gray-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">회원정보</h3>
              <p className="text-sm text-gray-600">개인정보를 수정하세요</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
