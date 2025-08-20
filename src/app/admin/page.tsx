'use client';

import React, { useEffect, useState } from 'react';
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
                재고 부족 (10개 미만)
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
                        {formatCurrency(Number(product.price))}
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
              결제 관리
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
