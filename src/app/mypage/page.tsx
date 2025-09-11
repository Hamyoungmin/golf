'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData } from '@/lib/users';
import { getUserOrders } from '@/lib/orders';
import { User as UserType, Order } from '@/types';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { db, doc, onSnapshot } from '@/lib/firebase';

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  
  const [userData, setUserData] = useState<UserType | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      showAlert('로그인이 필요합니다.', 'warning', {
        onConfirm: () => router.push('/login')
      });
      return;
    }
  }, [user, authLoading, router, showAlert]);

  // 사용자 정보 실시간 구독 및 최근 주문 로드
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // 🔥 사용자 정보 실시간 구독
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = {
          ...snapshot.data(),
          uid: snapshot.id,
          createdAt: snapshot.data().createdAt?.toDate() || new Date(),
          updatedAt: snapshot.data().updatedAt?.toDate() || new Date(),
        } as UserType;
        
        console.log('🔥 실시간 사용자 정보 업데이트:', userData.name, userData.companyName);
        setUserData(userData);
      }
    }, (error) => {
      console.error('사용자 정보 실시간 구독 오류:', error);
    });

    // 최근 주문 로드 (한 번만)
    const fetchRecentOrders = async () => {
      try {
        const orders = await getUserOrders(user.uid, 3);
        setRecentOrders(orders);
      } catch (error) {
        console.error('주문 데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      unsubscribeUser();
    };
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
    <>
      <AlertComponent />
      <div className="container" style={{ maxWidth: '900px', margin: '50px auto', padding: '20px' }}>
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
          마이페이지
        </h1>

        {/* 회원 정보 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            회원 정보
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                이메일
              </label>
              <div style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                fontSize: '14px'
              }}>
                {user?.email}
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                이름
              </label>
              <div style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                fontSize: '14px'
              }}>
                {userData?.name || '정보 없음'}
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                연락처
              </label>
              <div style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                fontSize: '14px'
              }}>
                {userData?.phone || '정보 없음'}
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                상호명
              </label>
              <div style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                fontSize: '14px'
              }}>
                {userData?.companyName || '정보 없음'}
              </div>
            </div>
          </div>
        </div>

        {/* 주문처리 현황 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            주문처리 현황
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
            <div style={{ 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '3px' }}>0</div>
              <div style={{ fontSize: '11px', color: '#666' }}>입금전</div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '3px' }}>0</div>
              <div style={{ fontSize: '11px', color: '#666' }}>배송준비중</div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '3px' }}>0</div>
              <div style={{ fontSize: '11px', color: '#666' }}>배송중</div>
            </div>
            
            <div style={{ 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '3px' }}>0</div>
              <div style={{ fontSize: '11px', color: '#666' }}>배송완료</div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <Link 
              href="/mypage/orders"
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              전체 주문내역 보기
            </Link>
          </div>
        </div>

        {/* 주문내역 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            최근 주문내역
          </h3>
          
          {recentOrders.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              color: '#666'
            }}>
              <p style={{ marginBottom: '15px', fontSize: '16px' }}>주문 내역이 없습니다</p>
              <Link 
                href="/drivers"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                드라이버 쇼핑하러 가기
              </Link>
            </div>
          ) : (
            <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
              {recentOrders.map((order, index) => (
                <div 
                  key={order.orderId} 
                  style={{ 
                    padding: '15px',
                    borderBottom: index < recentOrders.length - 1 ? '1px solid #ddd' : 'none',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>
                        주문번호: {order.orderId}
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: '#f5f5f5'
                    }}>
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', marginBottom: '5px' }}>
                        {order.items.length > 1 
                          ? `${order.items[0].productName} 외 ${order.items.length - 1}개`
                          : order.items[0]?.productName
                        }
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <Link 
                      href={`/mypage/orders/${order.orderId}`}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textDecoration: 'none',
                        color: '#666',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      상세보기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 간단한 네비게이션 링크들 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '10px',
          marginBottom: '25px'
        }}>
          <Link 
            href="/mypage/orders"
            style={{
              display: 'block',
              padding: '10px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#333',
              backgroundColor: '#f9f9f9',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            주문내역조회
          </Link>

          <Link 
            href="/mypage/profile"
            style={{
              display: 'block',
              padding: '10px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#333',
              backgroundColor: '#f9f9f9',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            회원정보수정
          </Link>

          <Link 
            href="/mypage/wishlist"
            style={{
              display: 'block',
              padding: '10px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#333',
              backgroundColor: '#f9f9f9',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            관심상품
          </Link>

          <Link 
            href="/mypage/recently-viewed"
            style={{
              display: 'block',
              padding: '10px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#333',
              backgroundColor: '#f9f9f9',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            최근본상품
          </Link>

          <Link 
            href="/mypage/faq"
            style={{
              display: 'block',
              padding: '10px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              textAlign: 'center',
              textDecoration: 'none',
              color: '#333',
              backgroundColor: '#f9f9f9',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            자주묻는질문
          </Link>
        </div>

      </div>
    </div>
    </>
  );
}