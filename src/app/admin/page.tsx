'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  ExclamationTriangleIcon,
  ClipboardListIcon,
  CubeIcon 
} from '@heroicons/react/24/outline';
import StatsCard from '@/components/admin/StatsCard';
import { getOrderStats } from '@/lib/orders';
import { getProductStats, getPopularProducts } from '@/lib/products';
import { Product } from '@/types';
import Link from 'next/link';

export default function AdminDashboard() {
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    categories: {} as { [key: string]: number },
  });
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orderData, productData, popularData] = await Promise.all([
          getOrderStats(),
          getProductStats(),
          getPopularProducts(10),
        ]);
        
        setOrderStats(orderData);
        setProductStats(productData);
        setPopularProducts(popularData);
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">대시보드</h1>

      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="오늘의 매출"
          value={formatCurrency(orderStats.totalRevenue)}
          icon={CurrencyDollarIcon}
          iconColor="text-green-600"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="전체 주문"
          value={orderStats.totalOrders}
          icon={ShoppingBagIcon}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="대기중 주문"
          value={orderStats.pendingOrders}
          icon={ClipboardListIcon}
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="재고 부족"
          value={productStats.lowStockProducts}
          icon={ExclamationTriangleIcon}
          iconColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 재고 현황 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">재고 현황</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">전체 상품</span>
              <span className="text-sm font-medium">{productStats.totalProducts}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">재고 부족 (10개 미만)</span>
              <span className="text-sm font-medium text-yellow-600">{productStats.lowStockProducts}개</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">품절</span>
              <span className="text-sm font-medium text-red-600">{productStats.outOfStockProducts}개</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">카테고리별 상품</h3>
            <div className="space-y-2">
              {Object.entries(productStats.categories).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{category}</span>
                  <span className="text-sm">{count}개</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 인기 상품 TOP 10 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">인기 상품 TOP 10</h2>
            <Link href="/admin/products" className="text-sm text-green-600 hover:text-green-700">
              전체보기 →
            </Link>
          </div>
          <div className="space-y-3">
            {popularProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(Number(product.price))}</p>
                  <p className="text-xs text-gray-500">재고: {product.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 작업 버튼들 */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="text-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            새 상품 등록
          </Link>
          <Link
            href="/admin/orders"
            className="text-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            주문 관리
          </Link>
          <Link
            href="/admin/inventory"
            className="text-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            재고 확인
          </Link>
          <Link
            href="/admin/analytics"
            className="text-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            매출 분석
          </Link>
        </div>
      </div>
    </div>
  );
}
