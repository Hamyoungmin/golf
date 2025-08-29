'use client';

import React, { useState, useEffect } from 'react';
import { 
  getInventoryStats,
  getInventoryProducts,
  adjustStock,
  getProductStockHistory,
  getStockStatusText,
  getStockStatusColor
} from '@/lib/inventory';
import { Product, InventoryStats, StockHistory, StockAdjustment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function InventoryPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity: '',
    reason: ''
  });

  // 데이터 로드
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [stats, productList] = await Promise.all([
        getInventoryStats(),
        getInventoryProducts()
      ]);
      setInventoryStats(stats);
      setProducts(productList);
    } catch (error) {
      console.error('재고 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'drivers', 'woods', 'irons', 'wedges', 'putters', 'utilities'];
  const categoryLabels: Record<string, string> = {
    all: '전체',
    drivers: '드라이버',
    woods: '우드',
    irons: '아이언',
    wedges: '웨지',
    putters: '퍼터',
    utilities: '유틸리티'
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (showLowStock && product.stock >= 0) return false;
    return true;
  });

  const handleAdjustStock = async () => {
    if (!selectedProduct || !user || !adjustmentForm.quantity || !adjustmentForm.reason) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const quantityChange = parseInt(adjustmentForm.quantity);
    let adjustmentType: 'increase' | 'decrease' | 'set';
    let adjustmentQuantity: number;

    if (quantityChange > 0) {
      adjustmentType = 'increase';
      adjustmentQuantity = quantityChange;
    } else if (quantityChange < 0) {
      adjustmentType = 'decrease';
      adjustmentQuantity = Math.abs(quantityChange);
    } else {
      alert('0이 아닌 숫자를 입력해주세요.');
      return;
    }

    const adjustment: StockAdjustment = {
      productId: selectedProduct.id,
      quantity: adjustmentQuantity,
      type: adjustmentType,
      reason: adjustmentForm.reason
    };

    const success = await adjustStock(adjustment, user.uid);
    if (success) {
      alert('재고가 성공적으로 조정되었습니다.');
      setShowAdjustModal(false);
      setAdjustmentForm({ quantity: '', reason: '' });
      loadInventoryData(); // 데이터 새로고침
    } else {
      alert('재고 조정에 실패했습니다.');
    }
  };

  const handleShowHistory = async (product: Product) => {
    setSelectedProduct(product);
    setLoading(true);
    try {
      const history = await getProductStockHistory(product.id);
      setStockHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('재고 이력 조회 오류:', error);
      alert('재고 이력 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  };

  if (loading) {
  return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{ fontSize: '18px' }}>재고 데이터를 불러오는 중...</div>
      </div>
    );
  }

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
          상품 재고 현황을 실시간으로 관리하고 모니터링합니다.
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
                {inventoryStats.lowStockProducts.toLocaleString()}개
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>재고 부족(0개 미만)</div>
            </div>
            
            <div style={{ 
              padding: '20px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              textAlign: 'center',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                {inventoryStats.outOfStockProducts.toLocaleString()}개
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
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: selectedCategory === category ? '#fff' : '#666',
                    backgroundColor: selectedCategory === category ? '#007bff' : '#f9f9f9',
                    cursor: 'pointer'
                  }}
                >
                  {categoryLabels[category]}
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
                <span style={{ fontSize: '14px', color: '#666' }}>재고 부족/품절만 표시</span>
              </label>
              <button 
                onClick={() => loadInventoryData()}
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
                  backgroundColor: '#28a745',
                  cursor: 'pointer'
                }}
              >
                🔄 새로고침
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
            재고 목록 ({filteredProducts.length}개)
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
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} style={{ 
                    borderBottom: index < filteredProducts.length - 1 ? '1px solid #e0e0e0' : 'none'
                  }}>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                      {product.name}
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
                        {categoryLabels[product.category] || product.category}
                    </span>
                  </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {product.stock}개
                  </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '500',
                        color: getStockStatusColor(product.stock)
                      }}>
                        {getStockStatusText(product.stock)}
                    </span>
                  </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      ₩{parseInt(product.price).toLocaleString()}
                  </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => openAdjustModal(product)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#007bff',
                            backgroundColor: 'transparent',
                            border: '1px solid #007bff',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                      조정
                    </button>
                        <button 
                          onClick={() => handleShowHistory(product)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#666',
                            backgroundColor: 'transparent',
                            border: '1px solid #666',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                      이력
                    </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

            {filteredProducts.length === 0 && (
              <div style={{ 
                padding: '40px 20px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  표시할 상품이 없습니다
                </h3>
                <p style={{ fontSize: '14px' }}>
                  선택한 필터에 해당하는 상품이 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 재고 조정 모달 */}
        {showAdjustModal && selectedProduct && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '120px',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                재고 조정 - {selectedProduct.name}
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  현재 재고: <strong>{selectedProduct.stock}개</strong>
                </p>
              </div>



              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  재고 변경량
                </label>
                <input
                  type="number"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm({
                    ...adjustmentForm, 
                    quantity: e.target.value
                  })}
                  placeholder="양수는 증가, 음수는 감소 (예: 5, -3)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  💡 양수를 입력하면 재고가 증가하고, 음수를 입력하면 재고가 감소합니다.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  사유
                </label>
                <textarea
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({
                    ...adjustmentForm, 
                    reason: e.target.value
                  })}
                  placeholder="재고 조정 사유를 입력하세요"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustmentForm({ quantity: '', reason: '' });
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#666',
                    backgroundColor: '#f9f9f9',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleAdjustStock}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#fff',
                    backgroundColor: '#007bff',
                    cursor: 'pointer'
                  }}
                >
                  조정 완료
                </button>
        </div>
            </div>
          </div>
        )}

        {/* 재고 이력 모달 */}
        {showHistoryModal && selectedProduct && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '120px',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  margin: 0
                }}>
                  재고 이력 - {selectedProduct.name}
                </h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  닫기
                </button>
              </div>

              {stockHistory.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: '#666' 
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                  <p>재고 이력이 없습니다.</p>
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  {stockHistory.map((history, index) => (
                    <div 
                      key={history.id} 
                      style={{
                        padding: '15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '500',
                          color: '#007bff'
                        }}>
                          {history.type === 'adjustment' ? '재고 조정' : 
                           history.type === 'restock' ? '입고' :
                           history.type === 'sale' ? '판매' : '반품'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {history.createdAt.toLocaleDateString('ko-KR')} {history.createdAt.toLocaleTimeString('ko-KR')}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                        <strong>{history.previousStock}개</strong> → <strong>{history.newStock}개</strong>
                        <span style={{ 
                          color: history.newStock > history.previousStock ? '#28a745' : '#dc3545',
                          marginLeft: '8px'
                        }}>
                          ({history.newStock > history.previousStock ? '+' : ''}{history.newStock - history.previousStock}개)
                        </span>
                      </div>
                      {history.reason && (
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          사유: {history.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
