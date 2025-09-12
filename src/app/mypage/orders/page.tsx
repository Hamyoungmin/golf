'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, getOrderStatusText, getOrderStatusColor } from '@/lib/orders';
import { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('orders');



  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // 주문 목록 로드
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userOrders = await getUserOrders(user.uid, 50);
        setOrders(userOrders);
      } catch (error) {
        console.error('주문 목록 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">주문 내역을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">주문조회</h1>
        </div>

        <br />
        <br />
        <br />
        <br />

        {/* 탭 메뉴 */}
        <div className="flex justify-start mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('orders')}
              className="w-48 h-16 text-base font-bold border border-solid"
              style={{ 
                backgroundColor: activeTab === 'orders' ? '#000000' : '#ffffff',
                color: activeTab === 'orders' ? '#ffffff !important' : '#000000 !important',
                borderColor: '#000000',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <span style={{ color: activeTab === 'orders' ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                주문내역조회 ({orders.length})
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('returns')}
              className="w-48 h-16 text-base font-bold border border-solid border-l-0"
              style={{ 
                backgroundColor: activeTab === 'returns' ? '#000000' : '#ffffff',
                color: activeTab === 'returns' ? '#ffffff !important' : '#000000 !important',
                borderColor: '#000000',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderLeft: '0'
              }}
            >
              <span style={{ color: activeTab === 'returns' ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                취소/반품/교환 내역 (0)
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('past')}
              className="w-48 h-16 text-base font-bold border border-solid border-l-0"
              style={{ 
                backgroundColor: activeTab === 'past' ? '#000000' : '#ffffff',
                color: activeTab === 'past' ? '#ffffff !important' : '#000000 !important',
                borderColor: '#000000',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderLeft: '0'
              }}
            >
              <span style={{ color: activeTab === 'past' ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                과거주문내역 (0)
              </span>
            </button>
          </div>
        </div>

        {/* 탭별 콘텐츠 */}
        {activeTab === 'orders' && (
          <>
            {/* 안내 텍스트 */}
            <div className="mb-8">
              <ul className="text-lg font-bold text-gray-800 space-y-3">
                <li>• 기본적으로 최근 3개월간의 자료가 조회되며, 기간 검색시 주문처리완료 후 3개월 이내의 주문내역을 조회하실 수 있습니다.</li>
                <li>• 완료 후 3개월 이상 경과한 주문은 <span className="font-black">[과거주문내역]</span>에서 확인할 수 있습니다.</li>
                <li>• 주문번호를 클릭하시면 해당 주문에 대한 상세내역을 확인하실 수 있습니다.</li>
              </ul>
            </div>

            <br />
            <br />
            <br />

            {/* 주문 상품 정보 */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">주문 상품 정보</h3>
              
              <div className="overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        주문일자<br />[주문번호]
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        이미지
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        상품정보
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        수량
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        상품구매금액
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        주문처리상태
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        취소/교환/반품
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                            <p className="text-lg font-medium text-gray-700 mb-2">주문 내역이 없습니다</p>
                            <p className="text-gray-500">주문하신 상품이 없습니다.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders
                        .filter(order => selectedStatus === 'all' || order.status === selectedStatus)
                        .map((order) => 
                          order.items.map((item, index) => (
                            <tr key={`${order.orderId}-${index}`} className="hover:bg-gray-50">
                              {index === 0 && (
                                <td className="px-4 py-4 text-center border-r border-gray-200" rowSpan={order.items.length}>
                                  <div className="text-sm">
                                    <div className="font-medium text-gray-900 mb-1">{formatDate(order.createdAt)}</div>
                                    <div className="text-blue-600 hover:text-blue-800 cursor-pointer">
                                      <Link href={`/mypage/orders/${order.orderId}`}>
                                        [{order.orderId.slice(0, 8)}...]
                                      </Link>
                                    </div>
                                  </div>
                                </td>
                              )}
                              <td className="px-4 py-4 text-center border-r border-gray-200">
                                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center mx-auto">
                                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"/>
                                  </svg>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-left border-r border-gray-200">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900 mb-1">{item.productName}</div>
                                  <div className="text-gray-500 text-xs">
                                    옵션: 기본 옵션
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center border-r border-gray-200 text-sm text-gray-900">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-4 text-center border-r border-gray-200 text-sm font-medium text-gray-900">
                                {formatPrice(item.totalPrice)}
                              </td>
                              {index === 0 && (
                                <td className="px-4 py-4 text-center border-r border-gray-200" rowSpan={order.items.length}>
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                                    {getOrderStatusText(order.status)}
                                  </span>
                                </td>
                              )}
                              {index === 0 && (
                                <td className="px-4 py-4 text-center text-sm" rowSpan={order.items.length}>
                                  <div className="space-y-1">
                                    <button className="block w-full px-3 py-1 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded">
                                      취소신청
                                    </button>
                                    <button className="block w-full px-3 py-1 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded">
                                      교환신청
                                    </button>
                                    <button className="block w-full px-3 py-1 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded">
                                      반품신청
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'returns' && (
          <div className="mb-8">
            <div className="mb-8">
              <ul className="text-lg font-bold text-gray-800 space-y-3">
                <li>• 취소, 반품, 교환 신청 내역을 확인하실 수 있습니다.</li>
                <li>• 처리 상태별로 확인이 가능하며, 상세 내역을 클릭하여 자세한 정보를 확인하실 수 있습니다.</li>
                <li>• 문의사항이 있으시면 고객센터로 연락 주시기 바랍니다.</li>
              </ul>
            </div>

            <br />
            <br />
            <br />

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">취소/반품/교환 내역</h3>
              
              <div className="overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        신청일자<br />[신청번호]
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        이미지
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        상품정보
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        수량
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        신청유형
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        처리상태
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <p className="text-lg font-medium text-gray-700 mb-2">취소/반품/교환 내역이 없습니다</p>
                          <p className="text-gray-500">신청하신 내역이 없습니다.</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'past' && (
          <div className="mb-8">
            <div className="mb-8">
              <ul className="text-lg font-bold text-gray-800 space-y-3">
                <li>• 완료 후 3개월 이상 경과한 주문 내역을 확인하실 수 있습니다.</li>
                <li>• 과거 주문 내역은 최대 2년까지 조회 가능합니다.</li>
                <li>• 상세 주문 정보가 필요하시면 고객센터로 문의해 주시기 바랍니다.</li>
              </ul>
            </div>

            <br />
            <br />
            <br />

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">과거 주문 내역</h3>
              
              <div className="overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        주문일자<br />[주문번호]
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        이미지
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        상품정보
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        수량
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        상품구매금액
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-gray-200">
                        주문처리상태
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <p className="text-lg font-medium text-gray-700 mb-2">과거 주문 내역이 없습니다</p>
                          <p className="text-gray-500">3개월 이상 경과한 주문이 없습니다.</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}