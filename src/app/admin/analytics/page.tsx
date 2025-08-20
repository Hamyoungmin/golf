'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import StatsCard from '@/components/admin/StatsCard';
import { calculateSalesAnalytics, SalesAnalytics } from '@/lib/analytics';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedChart, setSelectedChart] = useState('sales');
  const [analyticsData, setAnalyticsData] = useState<SalesAnalytics>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    categoryStats: [],
    dailyStats: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      // 기간별 날짜 설정
      const now = new Date();
      switch (selectedPeriod) {
        case 'day':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
      }
      
      endDate = new Date();

      const data = await calculateSalesAnalytics(startDate, endDate);
      setAnalyticsData(data);
    } catch (error) {
      console.error('매출 통계 로드 오류:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          매출 통계
        </h1>
        <p style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '14px',
          color: '#666'
        }}>
          실시간 매출 데이터를 분석하고 인사이트를 확인합니다.
        </p>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            fontSize: '16px',
            color: '#666'
          }}>
            📊 매출 통계를 계산하는 중...
          </div>
        )}

      {/* 기간 선택 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          분석 기간
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {periods.map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: selectedPeriod === period.value ? '#fff' : '#666',
                backgroundColor: selectedPeriod === period.value ? '#007bff' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* 주요 통계 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          주요 통계
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
              ₩{(analyticsData.totalRevenue / 10000).toFixed(0)}만
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>총 매출</div>
            {analyticsData.totalRevenue > 0 && (
              <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px' }}>실시간 집계</div>
            )}
          </div>
          
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
              {analyticsData.totalOrders.toLocaleString()}건
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>총 주문 건수</div>
            {analyticsData.totalOrders > 0 && (
              <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px' }}>실시간 집계</div>
            )}
          </div>
          
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
              ₩{analyticsData.averageOrderValue > 0 ? (analyticsData.averageOrderValue / 1000).toFixed(0) : '0'}천
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>평균 주문 금액</div>
            {analyticsData.averageOrderValue > 0 && (
              <div style={{ fontSize: '12px', color: '#007bff', marginTop: '4px' }}>자동 계산</div>
            )}
          </div>
          
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
              {analyticsData.conversionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>전환율</div>
            {analyticsData.conversionRate > 0 && (
              <div style={{ fontSize: '12px', color: '#007bff', marginTop: '4px' }}>방문자 대비</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '25px' }}>
        {/* 매출 차트 */}
        <div>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            매출 추이
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}>
            <div style={{ 
              padding: '15px', 
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>차트 설정</span>
              <select 
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {chartTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ 
                height: '256px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                border: '1px dashed #ddd'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                  <p style={{ color: '#666', fontSize: '14px' }}>차트 영역 (Chart.js 연동 필요)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리별 매출 */}
        <div>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            카테고리별 매출
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {analyticsData.categoryStats.length > 0 ? (
                analyticsData.categoryStats.map((category, index) => (
                  <div key={index}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '5px'
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{category.category}</span>
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        ₩{(category.revenue / 10000).toFixed(0)}만 ({category.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: '10px', 
                      height: '8px' 
                    }}>
                      <div style={{
                        backgroundColor: '#007bff',
                        height: '8px',
                        borderRadius: '10px',
                        width: `${category.percentage}%`,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    아직 카테고리별 매출 데이터가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 베스트셀러 상품 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          베스트셀러 상품
        </h3>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: '#fff',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  순위
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  상품명
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  판매 수량
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  매출액
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  성장률
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topProducts.length > 0 ? (
                analyticsData.topProducts.map((product, index) => (
                  <tr key={product.id} style={{ 
                    borderBottom: index < analyticsData.topProducts.length - 1 ? '1px solid #e0e0e0' : 'none'
                  }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: index === 0 ? '#ffc107' : 
                                       index === 1 ? '#6c757d' : 
                                       index === 2 ? '#fd7e14' : '#adb5bd'
                      }}>
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                      {product.name}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {product.sales}개
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      ₩{(product.revenue / 10000).toFixed(0)}만
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '500',
                          color: product.growthRate >= 0 ? '#28a745' : '#dc3545'
                        }}>
                          {product.growthRate >= 0 ? '↗' : '↘'} {Math.abs(product.growthRate).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏆</div>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                      아직 베스트셀러 상품 데이터가 없습니다.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
