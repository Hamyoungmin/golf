'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '@/types';
import Link from 'next/link';
import { getInventoryStats } from '@/lib/inventory';
import { getProducts } from '@/lib/products';
import { calculateSalesAnalytics } from '@/lib/analytics';
import { formatPrice } from '@/utils/priceUtils';

// 실제 주문 통계 함수
const getOrderStats = async () => {
  try {
    // 오늘 날짜 기준으로 매출 통계 계산
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const analytics = await calculateSalesAnalytics(startOfToday, today);
    
    return {
      totalOrders: analytics.totalOrders,
      pendingOrders: 0, // 임시로 0 (상태별 조회 기능 추가 필요)
      completedOrders: analytics.totalOrders,
      totalRevenue: analytics.totalRevenue,
    };
  } catch (error) {
    console.error('주문 통계 계산 오류:', error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    };
  }
};

// 실제 상품 통계를 가져오는 함수
const getProductStats = async () => {
  try {
    const stats = await getInventoryStats();
    const products = await getProducts();
    
    // 카테고리별 상품 수 계산
    const categories: { [key: string]: number } = {};
    products.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    return {
      totalProducts: stats.totalProducts,
      lowStockProducts: stats.lowStockProducts,
      outOfStockProducts: stats.outOfStockProducts,
      categories
    };
  } catch (error) {
    console.error('상품 통계 가져오기 오류:', error);
    return {
      totalProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      categories: {},
    };
  }
};

// 인기 상품 가져오기 (매출 기준)
const getPopularProducts = async (limit: number) => {
  try {
    // 최근 30일 매출 통계에서 베스트셀러 상품 가져오기
    const analytics = await calculateSalesAnalytics();
    const topProducts = analytics.topProducts.slice(0, limit);
    
    // 상품 상세 정보와 결합
    const products = await getProducts();
    const popularProducts = topProducts.map(topProduct => {
      const product = products.find(p => p.id === topProduct.id);
      return product || null;
    }).filter(Boolean) as Product[];
    
    return popularProducts;
  } catch (error) {
    console.error('인기 상품 가져오기 오류:', error);
    return [];
  }
};

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
  // const [seedLoading, setSeedLoading] = useState(false); // 향후 사용 예정

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

  // const handleSeedData = async () => { // 향후 사용 예정
    setSeedLoading(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('샘플 데이터가 성공적으로 생성되었습니다!');
        window.location.reload();
      } else {
        throw new Error('샘플 데이터 생성 실패');
      }
    } catch (error) {
      console.error('샘플 데이터 생성 오류:', error);
      alert('샘플 데이터 생성에 실패했습니다.');
    } finally {
      setSeedLoading(false);
    }
  };

  // const handleDeleteAllProducts = async () => { // 향후 사용 예정
    if (!confirm('정말로 모든 상품 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/seed/delete-all', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('모든 상품 데이터가 삭제되었습니다.');
        window.location.reload();
      } else {
        throw new Error('데이터 삭제 실패');
      }
    } catch (error) {
      console.error('데이터 삭제 오류:', error);
      alert('데이터 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '₩0';
    }
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
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
          관리자 대시보드
        </h1>

        {/* 오늘의 통계 현황 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            오늘의 통계 현황
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                {formatCurrency(orderStats.totalRevenue || 0)}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>오늘의 매출</div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                {orderStats.totalOrders}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>전체 주문</div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                {orderStats.pendingOrders}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>대기중 주문</div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                {productStats.lowStockProducts}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>재고 부족</div>
            </div>
          </div>
        </div>

        {/* 재고 현황 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            재고 현황
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                전체 상품
              </label>
              <div style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#000'
              }}>
                {productStats.totalProducts}개
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                재고 부족 (0개 미만)
              </label>
              <div style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#000'
              }}>
                {productStats.lowStockProducts}개
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                품절 상품
              </label>
              <div style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#000'
              }}>
                {productStats.outOfStockProducts}개
              </div>
            </div>
          </div>
        </div>

        {/* 인기 상품 */}
        {popularProducts.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontWeight: 'bold', 
              marginBottom: '15px',
              fontSize: '18px',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px'
            }}>
              인기 상품 TOP 5
            </h3>
            
            <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
              {popularProducts.slice(0, 5).map((product, index) => (
                <div 
                  key={product.id} 
                  style={{ 
                    padding: '15px',
                    borderBottom: index < 4 ? '1px solid #ddd' : 'none',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666', minWidth: '20px' }}>
                        {index + 1}
                      </span>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>
                          {product.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#666' }}>
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>
                        {formatPrice(product.price)}
                      </p>
                      <p style={{ fontSize: '12px', color: '#666' }}>
                        재고: {product.stock}개
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 빠른 작업 */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            빠른 작업
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <Link 
              href="/admin/products/new"
              style={{
                display: 'block',
                padding: '12px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                backgroundColor: '#f9f9f9',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              새 상품 등록
            </Link>

            <Link 
              href="/admin/orders"
              style={{
                display: 'block',
                padding: '12px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                backgroundColor: '#f9f9f9',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              주문 관리
            </Link>

            <Link 
              href="/admin/payments"
              style={{
                display: 'block',
                padding: '12px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                backgroundColor: '#f9f9f9',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              입금 관리
            </Link>

            <Link 
              href="/admin/products"
              style={{
                display: 'block',
                padding: '12px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                backgroundColor: '#f9f9f9',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              상품 관리
            </Link>



            <Link 
              href="/admin/users"
              style={{
                display: 'block',
                padding: '12px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                backgroundColor: '#f9f9f9',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              사용자 관리
            </Link>

            <Link 
              href="/admin/analytics"
              style={{
                display: 'block',
                padding: '12px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#333',
                backgroundColor: '#f9f9f9',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              매출 통계
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
