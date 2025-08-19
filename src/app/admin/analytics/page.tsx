'use client';

import React, { useState } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import StatsCard from '@/components/admin/StatsCard';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedChart, setSelectedChart] = useState('sales');

  // 더미 분석 데이터
  const analyticsData = {
    totalRevenue: 125670000,
    totalOrders: 1247,
    averageOrderValue: 98500,
    conversionRate: 3.2,
    topProducts: [
      { name: '캘러웨이 로그 드라이버', sales: 45, revenue: 6300000 },
      { name: '젝시오 MP1200', sales: 23, revenue: 12650000 },
      { name: '타이틀리스트 917 우드', sales: 38, revenue: 4560000 },
      { name: '핑 ANSER2 퍼터', sales: 42, revenue: 5460000 },
      { name: '클리브랜드 RTX6 웨지', sales: 35, revenue: 4200000 }
    ],
    categoryStats: [
      { category: '드라이버', sales: 156, revenue: 35400000, percentage: 28.2 },
      { category: '아이언', sales: 234, revenue: 42300000, percentage: 33.7 },
      { category: '퍼터', sales: 189, revenue: 24570000, percentage: 19.5 },
      { category: '웨지', sales: 145, revenue: 17400000, percentage: 13.8 },
      { category: '우드', sales: 98, revenue: 5970000, percentage: 4.8 }
    ],
    monthlySales: [
      { month: '1월', revenue: 8500000, orders: 95 },
      { month: '2월', revenue: 9200000, orders: 108 },
      { month: '3월', revenue: 11800000, orders: 134 },
      { month: '4월', revenue: 10600000, orders: 121 },
      { month: '5월', revenue: 13400000, orders: 156 },
      { month: '6월', revenue: 15200000, orders: 178 },
    ]
  };

  const periods = [
    { value: 'day', label: '일별' },
    { value: 'week', label: '주별' },
    { value: 'month', label: '월별' },
    { value: 'year', label: '연별' }
  ];

  const chartTypes = [
    { value: 'sales', label: '매출 추이' },
    { value: 'orders', label: '주문 건수' },
    { value: 'category', label: '카테고리별 매출' },
    { value: 'products', label: '상품별 매출' }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">매출 통계</h1>
        <p className="text-gray-600">매출 데이터를 분석하고 인사이트를 확인합니다.</p>
      </div>

      {/* 기간 선택 */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">분석 기간</h3>
            <div className="flex space-x-2">
              {periods.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="총 매출"
          value={`₩${(analyticsData.totalRevenue / 10000).toFixed(0)}만`}
          icon={CurrencyDollarIcon}
          iconColor="text-green-600"
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatsCard
          title="총 주문 건수"
          value={analyticsData.totalOrders.toLocaleString()}
          icon={ShoppingBagIcon}
          iconColor="text-blue-600"
          trend={{ value: 8.7, isPositive: true }}
        />
        <StatsCard
          title="평균 주문 금액"
          value={`₩${(analyticsData.averageOrderValue / 1000).toFixed(0)}천`}
          icon={ChartBarIcon}
          iconColor="text-purple-600"
          trend={{ value: 2.1, isPositive: false }}
        />
        <StatsCard
          title="전환율"
          value={`${analyticsData.conversionRate}%`}
          icon={ArrowTrendingUpIcon}
          iconColor="text-orange-600"
          trend={{ value: 0.5, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 매출 차트 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">매출 추이</h3>
              <select 
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="text-sm border-gray-300 rounded-md"
              >
                {chartTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">차트 영역 (Chart.js 연동 필요)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리별 매출 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">카테고리별 매출</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.categoryStats.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm text-gray-500">
                        ₩{(category.revenue / 10000).toFixed(0)}만 ({category.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 베스트셀러 상품 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">베스트셀러 상품</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상품명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  판매 수량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  매출액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  성장률
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.sales}개</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₩{(product.revenue / 10000).toFixed(0)}만</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {Math.random() > 0.5 ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                        {(Math.random() * 20 + 5).toFixed(1)}%
                      </span>
                    </div>
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
