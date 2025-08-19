'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  PlusIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import StatsCard from '@/components/admin/StatsCard';
// Firebase 제거됨: 더미 통계 함수들 사용
const getOrderStats = async () => ({
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalRevenue: 0,
});

const getProductStats = async () => ({
  totalProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,
  categories: {},
});

const getPopularProducts = async (limit: number) => [];
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
  const [seedLoading, setSeedLoading] = useState(false);

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

  const handleSeedData = async () => {
    alert('Firebase가 제거되었습니다. 샘플 데이터 기능을 사용할 수 없습니다.');
  };

  const handleDeleteAllProducts = async () => {
    alert('Firebase가 제거되었습니다. 데이터 삭제 기능을 사용할 수 없습니다.');
  };

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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">관리자 대시보드</h1>
        <p className="text-gray-600">골프상회 운영 현황을 한눈에 확인하세요.</p>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="오늘의 매출"
          value={formatCurrency(orderStats.totalRevenue || 2450000)}
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
          icon={ClipboardDocumentListIcon}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            href="/admin/products"
            className="text-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            상품 관리
          </Link>
          <Link
            href="/admin/payments"
            className="text-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            결제 관리
          </Link>
          <button
            onClick={handleSeedData}
            disabled={seedLoading}
            className="flex items-center justify-center py-3 px-4 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {seedLoading ? '추가 중...' : '샘플 데이터'}
          </button>
          <button
            onClick={handleDeleteAllProducts}
            disabled={seedLoading}
            className="flex items-center justify-center py-3 px-4 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            {seedLoading ? '삭제 중...' : '전체 삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
