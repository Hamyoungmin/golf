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
        return 'text-blue-600 bg-blue-100';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* 골프 장식 요소들 */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-gray-200 to-blue-300 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full opacity-30 blur-xl"></div>
      <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-25 blur-lg"></div>
      
      <div className="container mx-auto px-4 py-8 relative">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              {/* 골프공 장식 */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-blue-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full opacity-70"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            마이페이지
          </h1>
          <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            골프상회 도매몰에서 편리하게 쇼핑하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 메뉴 */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 sticky top-8">
              <div className="text-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-500">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  {/* 골프공 장식들 */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full border-3 border-blue-300 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-blue-400 rounded-full opacity-80 shadow-md"></div>
                  <div className="absolute top-2 left-2 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
                </div>
                <h3 className="font-bold text-2xl bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent">{userData?.name || '골퍼'}</h3>
                <p className="text-sm text-gray-500 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-full inline-block mt-3 border border-gray-200">
                  {user?.email}
                </p>
              </div>
              
              <nav className="space-y-4">
                <Link 
                  href="/mypage" 
                  className="group flex items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="9"/>
                      <rect x="14" y="3" width="7" height="5"/>
                      <rect x="14" y="12" width="7" height="9"/>
                      <rect x="3" y="16" width="7" height="5"/>
                    </svg>
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">대시보드</span>
                </Link>
                
                <Link 
                  href="/mypage/orders" 
                  className="group flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-blue-200"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                  </div>
                  <span className="font-medium group-hover:translate-x-1 transition-transform">주문 내역 조회</span>
                </Link>
                
                <Link 
                  href="/mypage/profile" 
                  className="group flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 text-gray-700 hover:text-purple-600 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-purple-200"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <span className="font-medium group-hover:translate-x-1 transition-transform">회원정보 수정</span>
                </Link>
                
                <Link 
                  href="/mypage/wishlist" 
                  className="group flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 text-gray-700 hover:text-red-500 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-red-200"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </div>
                  <span className="font-medium group-hover:translate-x-1 transition-transform">관심상품 (찜 목록)</span>
                </Link>
                
                {/* 추가 메뉴 */}
                <div className="pt-4 border-t border-gray-100">
                  <Link 
                    href="/mypage/recently-viewed"
                    className="group flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-orange-200 w-full"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <span className="font-medium group-hover:translate-x-1 transition-transform">최근 본 상품</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3 space-y-10">
            {/* 사용자 정보 요약 */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  회원 정보
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  인증완료
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-8 rounded-2xl border border-blue-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <label className="block text-sm font-bold text-blue-700 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-200 rounded-xl flex items-center justify-center group-hover:bg-blue-300 transition-colors">
                      <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    이메일
                  </label>
                  <p className="text-gray-900 font-bold text-lg">{user?.email}</p>
                </div>
                
                <div className="group bg-gradient-to-br from-gray-50 via-gray-100 to-gray-100 p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    이름
                  </label>
                  <p className="text-gray-900 font-bold text-lg">{userData?.name || '정보 없음'}</p>
                </div>
                
                <div className="group bg-gradient-to-br from-purple-50 via-violet-100 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <label className="block text-sm font-bold text-purple-700 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-200 rounded-xl flex items-center justify-center group-hover:bg-purple-300 transition-colors">
                      <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </div>
                    연락처
                  </label>
                  <p className="text-gray-900 font-bold text-lg">{userData?.phone || '정보 없음'}</p>
                </div>
                
                <div className="group bg-gradient-to-br from-orange-50 via-amber-100 to-orange-100 p-8 rounded-2xl border border-orange-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <label className="block text-sm font-bold text-orange-700 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-200 rounded-xl flex items-center justify-center group-hover:bg-orange-300 transition-colors">
                      <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    상호명
                  </label>
                  <p className="text-gray-900 font-bold text-lg">정보 없음</p>
                </div>
              </div>
              
              <div className="mt-10 flex flex-wrap gap-6">
                <Link 
                  href="/mypage/profile"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">정보 수정하기</span>
                </Link>
                
                <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-gray-300 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">비밀번호 변경</span>
                </button>
              </div>
            </div>

            {/* 주문 현황 */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                  </div>
                  나의 주문처리 현황
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">(최근 3개월 기준)</span>
                </h2>
                <Link 
                  href="/mypage/orders"
                  className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 font-bold rounded-2xl border border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span className="group-hover:translate-x-1 transition-transform">전체보기</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              </div>

              {/* 주문 상태 요약 카드들 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">입금전</p>
                  <p className="text-xs text-gray-500">취소 0 고객 0 반품 0</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <p className="text-sm font-semibold text-indigo-700 mb-1">배송준비중</p>
                  <p className="text-xs text-gray-500">취소 0 고객 0 반품 0</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <p className="text-sm font-semibold text-orange-700 mb-1">배송중</p>
                  <p className="text-xs text-gray-500">취소 0 고객 0 반품 0</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-xl font-bold">0</span>
                  </div>
                  <p className="text-sm font-semibold text-purple-700 mb-1">배송완료</p>
                  <p className="text-xs text-gray-500">취소 0 고객 0 반품 0</p>
                </div>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative inline-block mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mx-auto flex items-center justify-center">
                      <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                    </div>
                    {/* 골프공 장식 */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-blue-300 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full opacity-70"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">주문 내역이 없습니다</h3>
                  <p className="text-gray-600 mb-8 text-lg">골프의 즐거움을 위한 첫 주문을 시작해보세요!</p>
                  <Link 
                    href="/"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    골프 용품 쇼핑하러 가기
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.orderId} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">주문번호: {order.orderId}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-700 font-medium mb-1">
                            {order.items.length > 1 
                              ? `${order.items[0].productName} 외 ${order.items.length - 1}개`
                              : order.items[0]?.productName
                            }
                          </p>
                          <p className="text-xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</p>
                        </div>
                        <Link 
                          href={`/mypage/orders/${order.orderId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-300"
                        >
                          상세보기
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 퀵 액션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link 
                href="/mypage/orders"
                className="group bg-white/80 backdrop-blur-sm border border-blue-100 rounded-3xl p-10 text-center hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-blue-300 hover:-translate-y-2"
              >
                <div className="mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl mx-auto flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                    </div>
                    {/* 골프공 장식 */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-blue-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">주문내역조회</h3>
                <p className="text-gray-600 mb-6">나의 골프 용품 주문 현황을<br/>한눈에 확인하세요</p>
                <div className="inline-flex items-center text-blue-600 font-bold group-hover:gap-3 transition-all duration-300">
                  <span className="group-hover:translate-x-1 transition-transform">바로가기</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </Link>

              <Link 
                href="/mypage/wishlist"
                className="group bg-white/80 backdrop-blur-sm border border-red-100 rounded-3xl p-10 text-center hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-red-300 hover:-translate-y-2"
              >
                <div className="mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-200 rounded-3xl mx-auto flex items-center justify-center group-hover:from-red-200 group-hover:to-pink-300 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </div>
                    {/* 골프공 장식 */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-red-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors">관심상품</h3>
                <p className="text-gray-600 mb-6">마음에 드는 골프 클럽과<br/>용품들을 저장해두세요</p>
                <div className="inline-flex items-center text-red-600 font-bold group-hover:gap-3 transition-all duration-300">
                  <span className="group-hover:translate-x-1 transition-transform">바로가기</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </Link>

              <Link 
                href="/mypage/profile"
                className="group bg-white/80 backdrop-blur-sm border border-purple-100 rounded-3xl p-10 text-center hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-purple-300 hover:-translate-y-2"
              >
                <div className="mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-200 rounded-3xl mx-auto flex items-center justify-center group-hover:from-purple-200 group-hover:to-violet-300 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    {/* 골프공 장식 */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-purple-300 flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">회원정보수정</h3>
                <p className="text-gray-600 mb-6">개인정보와 배송지 정보를<br/>안전하게 관리하세요</p>
                <div className="inline-flex items-center text-purple-600 font-bold group-hover:gap-3 transition-all duration-300">
                  <span className="group-hover:translate-x-1 transition-transform">바로가기</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </Link>
            </div>
            
            {/* 추가 메뉴 섹션 */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link 
                href="/mypage/recently-viewed"
                className="group bg-white/60 backdrop-blur-sm border border-orange-100 rounded-2xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-orange-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-300 transition-all duration-300">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">최근본상품</h4>
              </Link>
              
              <button className="group bg-white/60 backdrop-blur-sm border border-cyan-100 rounded-2xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-cyan-300">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-200 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:from-cyan-200 group-hover:to-blue-300 transition-all duration-300">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 text-sm group-hover:text-cyan-600 transition-colors">게시물 관리</h4>
              </button>
              
              <button className="group bg-white/60 backdrop-blur-sm border border-green-100 rounded-2xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-green-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-300 transition-all duration-300">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 text-sm group-hover:text-green-600 transition-colors">적립금</h4>
              </button>
              
              <button className="group bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-2xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-indigo-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-300 transition-all duration-300">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">배송 주소록 관리</h4>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
