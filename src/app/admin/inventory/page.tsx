'use client';

import React, { useState } from 'react';
import { 
  CubeIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  MinusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import StatsCard from '@/components/admin/StatsCard';

export default function InventoryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);

  // 더미 재고 데이터
  const inventoryStats = {
    totalProducts: 1247,
    lowStockItems: 23,
    outOfStockItems: 5,
    totalValue: 45670000
  };

  const inventoryItems = [
    { id: 1, name: '캘러웨이 로그 드라이버', category: '드라이버', currentStock: 5, minStock: 3, maxStock: 20, price: 140000, status: 'normal' },
    { id: 2, name: '타이틀리스트 917 우드', category: '우드', currentStock: 2, minStock: 5, maxStock: 15, price: 120000, status: 'low' },
    { id: 3, name: '핑 ANSER2 퍼터', category: '퍼터', currentStock: 0, minStock: 3, maxStock: 10, price: 130000, status: 'out' },
    { id: 4, name: '젝시오 MP1200 드라이버', category: '드라이버', currentStock: 8, minStock: 4, maxStock: 12, price: 550000, status: 'normal' },
    { id: 5, name: '클리브랜드 RTX6 웨지', category: '웨지', currentStock: 1, minStock: 4, maxStock: 18, price: 120000, status: 'low' },
  ];

  const categories = ['all', '드라이버', '우드', '아이언', '웨지', '퍼터', '유틸리티'];

  const filteredItems = inventoryItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (showLowStock && item.status === 'normal') return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'low': return 'text-yellow-600';
      case 'out': return 'text-red-600';
      default: return 'text-green-600';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'low': return '부족';
      case 'out': return '품절';
      default: return '정상';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">재고 관리</h1>
        <p className="text-gray-600">상품 재고 현황을 관리하고 모니터링합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="전체 상품"
          value={inventoryStats.totalProducts.toLocaleString()}
          icon={CubeIcon}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="재고 부족"
          value={inventoryStats.lowStockItems.toLocaleString()}
          icon={ExclamationTriangleIcon}
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="품절 상품"
          value={inventoryStats.outOfStockItems.toLocaleString()}
          icon={MinusIcon}
          iconColor="text-red-600"
        />
        <StatsCard
          title="총 재고 가치"
          value={`₩${(inventoryStats.totalValue / 10000).toFixed(0)}만`}
          icon={ClipboardDocumentListIcon}
          iconColor="text-green-600"
        />
      </div>

      {/* 필터 및 컨트롤 */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? '전체' : category}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={(e) => setShowLowStock(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">재고 부족만 표시</span>
              </label>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                <PlusIcon className="w-4 h-4 inline mr-2" />
                재고 조정
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 재고 목록 테이블 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">재고 현황</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  현재 재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  최소 재고
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  단가
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.currentStock}개</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.minStock}개</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₩{item.price.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      입고
                    </button>
                    <button className="text-green-600 hover:text-green-900 mr-4">
                      조정
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      이력
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
