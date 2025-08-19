'use client';

import React, { useState } from 'react';
import { 
  CogIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: '일반 설정', icon: CogIcon },
    { id: 'store', name: '스토어 정보', icon: BuildingStorefrontIcon },
    { id: 'shipping', name: '배송 설정', icon: TruckIcon },
    { id: 'payment', name: '결제 설정', icon: CreditCardIcon },
    { id: 'notifications', name: '알림 설정', icon: BellIcon },
    { id: 'security', name: '보안 설정', icon: ShieldCheckIcon },
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사이트 이름
              </label>
              <input
                type="text"
                defaultValue="골프상회"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사이트 설명
              </label>
              <textarea
                rows={3}
                defaultValue="최고 품질의 골프용품을 합리적인 가격에 제공하는 골프상회입니다."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  운영 시간
                </label>
                <input
                  type="text"
                  defaultValue="평일 09:00 - 18:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴무일
                </label>
                <input
                  type="text"
                  defaultValue="토요일, 일요일, 공휴일"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'store':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자 번호
                </label>
                <input
                  type="text"
                  defaultValue="740-47-00888"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  통신판매업신고번호
                </label>
                <input
                  type="text"
                  defaultValue="제 2023-화성봉담-0314호"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상호명
              </label>
              <input
                type="text"
                defaultValue="골프상회"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표자명
              </label>
              <input
                type="text"
                defaultValue="홍길동"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사업장 주소
              </label>
              <input
                type="text"
                defaultValue="경기도 수원시 권선구 세지로28번길 15-30 104호"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표 전화번호
                </label>
                <input
                  type="text"
                  defaultValue="010-7236-8400"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표 이메일
                </label>
                <input
                  type="email"
                  defaultValue="crover.kk@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기본 배송비
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue="3000"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">원</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                무료배송 기준금액
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue="50000"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">원 이상</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제주도 추가 배송비
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue="3000"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">원</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                도서산간 추가 배송비
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue="5000"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">원</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                배송업체
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>CJ대한통운</option>
                <option>롯데택배</option>
                <option>한진택배</option>
                <option>우체국택배</option>
              </select>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">사용 가능한 결제 수단</h3>
              <div className="space-y-3">
                {[
                  { id: 'card', name: '신용카드/체크카드', enabled: true },
                  { id: 'transfer', name: '계좌이체', enabled: true },
                  { id: 'vbank', name: '가상계좌', enabled: true },
                  { id: 'phone', name: '휴대폰 결제', enabled: false },
                  { id: 'kakaopay', name: '카카오페이', enabled: true },
                  { id: 'naverpay', name: '네이버페이', enabled: false },
                ].map((payment) => (
                  <label key={payment.id} className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={payment.enabled}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{payment.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PG사 설정
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>토스페이먼츠</option>
                <option>이니시스</option>
                <option>나이스페이</option>
                <option>KG이니시스</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환불 처리 기한
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  defaultValue="7"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">일</span>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">이메일 알림</h3>
              <div className="space-y-3">
                {[
                  { id: 'new_order', name: '신규 주문 알림', enabled: true },
                  { id: 'payment_complete', name: '결제 완료 알림', enabled: true },
                  { id: 'low_stock', name: '재고 부족 알림', enabled: true },
                  { id: 'new_review', name: '신규 리뷰 알림', enabled: false },
                  { id: 'daily_report', name: '일일 매출 리포트', enabled: true },
                ].map((notification) => (
                  <label key={notification.id} className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked={notification.enabled}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{notification.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 수신 이메일
              </label>
              <input
                type="email"
                defaultValue="admin@golf.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">보안 설정</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-sm text-gray-700">관리자 로그인 로그 기록</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-3" />
                  <span className="text-sm text-gray-700">중요 작업 시 2차 인증 요구</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-3" />
                  <span className="text-sm text-gray-700">IP 화이트리스트 사용</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세션 타임아웃 (분)
              </label>
              <input
                type="number"
                defaultValue="60"
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                허용 IP 목록 (IP 화이트리스트 사용 시)
              </label>
              <textarea
                rows={3}
                placeholder="IP 주소를 한 줄에 하나씩 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">설정</h1>
        <p className="text-gray-600">쇼핑몰 운영에 필요한 각종 설정을 관리합니다.</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6">
          {renderTabContent()}
          
          {/* 저장 버튼 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                취소
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
