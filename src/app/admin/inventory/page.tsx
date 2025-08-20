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
          재고 관리
        </h1>
        <p style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '14px',
          color: '#666'
        }}>
          상품 재고 현황을 관리하고 모니터링합니다.
        </p>

      {/* 통계 카드 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          재고 현황 요약
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
              {inventoryStats.totalProducts.toLocaleString()}개
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>전체 상품</div>
          </div>
          
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
              {inventoryStats.lowStockItems.toLocaleString()}개
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>재고 부족</div>
          </div>
          
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
              {inventoryStats.outOfStockItems.toLocaleString()}개
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>품절 상품</div>
          </div>
          
          <div style={{ 
            padding: '20px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
              ₩{(inventoryStats.totalValue / 10000).toFixed(0)}만
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>총 재고 가치</div>
          </div>
        </div>
      </div>

      {/* 필터 및 컨트롤 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          재고 필터 및 관리
        </h3>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px'
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: selectedCategory === category ? '#fff' : '#666',
                  backgroundColor: selectedCategory === category ? '#007bff' : '#f9f9f9',
                  cursor: 'pointer'
                }}
              >
                {category === 'all' ? '전체' : category}
              </button>
            ))}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px', color: '#666' }}>재고 부족만 표시</span>
            </label>
            <button 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#fff',
                backgroundColor: '#007bff',
                cursor: 'pointer'
              }}
            >
              + 재고 조정
            </button>
          </div>
        </div>
      </div>

      {/* 재고 목록 테이블 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          재고 목록 ({filteredItems.length}개)
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
                  상품명
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  카테고리
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  현재 재고
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  최소 재고
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  상태
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  단가
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id} style={{ 
                  borderBottom: index < filteredItems.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '12px',
                      backgroundColor: '#f0f0f0',
                      color: '#666'
                    }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {item.currentStock}개
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {item.minStock}개
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '500',
                      color: item.status === 'low' ? '#f39c12' : item.status === 'out' ? '#e74c3c' : '#27ae60'
                    }}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    ₩{item.price.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        color: '#007bff',
                        backgroundColor: 'transparent',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        입고
                      </button>
                      <button style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        color: '#28a745',
                        backgroundColor: 'transparent',
                        border: '1px solid #28a745',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        조정
                      </button>
                      <button style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        color: '#666',
                        backgroundColor: 'transparent',
                        border: '1px solid #666',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        이력
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
