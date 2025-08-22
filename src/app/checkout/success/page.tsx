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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* 성공 메시지 */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto text-green-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">주문이 완료되었습니다!</h1>
          <p className="text-gray-600 mb-6">
            주문번호: <span className="font-semibold text-blue-600">{order.orderId}</span>
          </p>
          <p className="text-sm text-gray-500">
            주문 확인 및 배송 준비까지 1-2일 정도 소요됩니다.
          </p>
        </div>

        {/* 주문 정보 */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">주문 정보</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">주문일시</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제방법</span>
              <span>{getPaymentMethodText(order.paymentMethod)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">주문상태</span>
              <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-600">
                주문 접수
              </span>
            </div>
          </div>
        </div>

        {/* 주문 상품 */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">주문 상품</h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <h3 className="font-medium">{item.productName}</h3>
                  <p className="text-sm text-gray-600">
                    {formatPrice(item.price)} × {item.quantity}개
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">결제 정보</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>상품 총액</span>
              <span>{formatPrice(order.totalAmount - (order.totalAmount >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.baseShippingCost))}</span>
            </div>
            <div className="flex justify-between">
              <span>배송비</span>
              <span>{order.totalAmount >= settings.shipping.freeShippingThreshold ? '무료' : formatPrice(settings.shipping.baseShippingCost)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-semibold">
              <span>총 결제금액</span>
              <span className="text-blue-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* 배송지 정보 */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">배송지 정보</h2>
          
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-600">우편번호:</span> {order.shippingAddress.zipCode}</p>
            <p><span className="text-gray-600">주소:</span> {order.shippingAddress.state} {order.shippingAddress.city}</p>
            <p><span className="text-gray-600">상세주소:</span> {order.shippingAddress.street}</p>
          </div>
        </div>

        {/* 계좌이체 관련 정보 */}
        {order.paymentMethod === 'bank_transfer' && (
          <div className="space-y-6 mb-8">
            {/* 입금 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">입금 안내</h3>
              <div className="space-y-3">
                {COMPANY_BANK_ACCOUNTS.map((account, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">{account.bankName}</span>
                      <span className="text-sm text-gray-600">예금주: {account.accountHolder}</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900 mt-1">
                      {account.accountNumber}
                    </div>
                  </div>
                ))}
                <div className="text-sm text-blue-700 mt-4">
                  <p><strong>입금 금액:</strong> {formatPrice(order.totalAmount)}</p>
                  <p><strong>입금자명:</strong> 주문시 입력한 이름으로 입금해주세요</p>
                  <p className="mt-2 text-blue-600">
                    ※ 입금 확인 후 배송 준비가 시작됩니다. (영업일 기준 1-2일)
                  </p>
                </div>
              </div>
            </div>

            {/* 입금 확인 상태 */}
            {paymentInfo && paymentInfo.bankTransferInfo ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-green-800">입금 정보 등록됨</h3>
                <div className="text-sm text-green-700 space-y-2">
                  <p><strong>입금자명:</strong> {paymentInfo.bankTransferInfo.depositorName}</p>
                  <p><strong>입금 금액:</strong> {formatPrice(paymentInfo.bankTransferInfo.transferAmount)}</p>
                  <p><strong>입금 은행:</strong> {paymentInfo.bankTransferInfo.bankName}</p>
                  {paymentInfo.bankTransferInfo.transferDate && (
                    <p><strong>입금일시:</strong> {formatDate(paymentInfo.bankTransferInfo.transferDate)}</p>
                  )}
                  {paymentInfo.bankTransferInfo.transferNote && (
                    <p><strong>참고사항:</strong> {paymentInfo.bankTransferInfo.transferNote}</p>
                  )}
                  <p className="mt-3 text-green-600">
                    ※ 관리자 확인 후 주문이 처리됩니다.
                  </p>
                </div>
              </div>
            ) : (
              /* 입금 확인 폼 */
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-yellow-800">입금 완료 신고</h3>
                  <button
                    onClick={() => setShowTransferForm(!showTransferForm)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    {showTransferForm ? '폼 닫기' : '입금 완료 신고하기'}
                  </button>
                </div>
                
                {showTransferForm && (
                  <form onSubmit={handleTransferSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-yellow-800">입금자명 *</label>
                        <input
                          type="text"
                          value={transferData.depositorName}
                          onChange={(e) => setTransferData(prev => ({ ...prev, depositorName: e.target.value }))}
                          placeholder="실제 입금하신 분의 성함"
                          className="w-full px-3 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-yellow-800">입금 금액 *</label>
                        <input
                          type="text"
                          value={transferData.transferAmount}
                          onChange={(e) => setTransferData(prev => ({ ...prev, transferAmount: e.target.value }))}
                          placeholder="입금하신 금액"
                          className="w-full px-3 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-yellow-800">입금 은행 *</label>
                        <select
                          value={transferData.bankName}
                          onChange={(e) => setTransferData(prev => ({ ...prev, bankName: e.target.value }))}
                          className="w-full px-3 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                        <label className="block text-sm font-medium mb-2 text-yellow-800">참고사항</label>
                        <input
                          type="text"
                          value={transferData.transferNote}
                          onChange={(e) => setTransferData(prev => ({ ...prev, transferNote: e.target.value }))}
                          placeholder="기타 참고사항 (선택사항)"
                          className="w-full px-3 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowTransferForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {submitting ? '등록 중...' : '입금 완료 신고'}
                      </button>
                    </div>
                  </form>
                )}
                
                <div className="mt-4 text-sm text-yellow-700">
                  <p>※ 입금 완료 후 위 폼을 작성해주시면 더 빠른 주문 처리가 가능합니다.</p>
                  <p>※ 입금 정보는 관리자 확인 후 처리됩니다.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/mypage/orders/${order.orderId}`}
            className="flex-1 bg-blue-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            주문 상세보기
          </Link>
          <Link
            href="/"
            className="flex-1 border border-gray-300 text-center py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            쇼핑 계속하기
          </Link>
        </div>

        {/* 고객센터 안내 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>주문 관련 문의사항이 있으시면</p>
          <p>고객센터(전화)로 연락해주세요.</p>
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
