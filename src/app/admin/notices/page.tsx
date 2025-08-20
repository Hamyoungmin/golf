'use client';

import React, { useState } from 'react';
import { 
  SpeakerWaveIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function NoticesPage() {
  const [showForm, setShowForm] = useState(false);

  // 더미 공지사항 데이터
  const notices = [
    {
      id: 1,
      title: '골프상회 홈페이지 리뉴얼 안내',
      content: '더 나은 서비스 제공을 위해 홈페이지를 리뉴얼했습니다...',
      isFixed: true,
      isVisible: true,
      createdAt: '2024-01-15',
      views: 1247
    },
    {
      id: 2,
      title: '설연휴 배송 안내',
      content: '설연휴 기간 중 배송 일정에 대해 안내드립니다...',
      isFixed: false,
      isVisible: true,
      createdAt: '2024-01-10',
      views: 856
    },
    {
      id: 3,
      title: '신제품 입고 안내 - 캘러웨이 2024 신상',
      content: '캘러웨이 2024년 신제품이 입고되었습니다...',
      isFixed: false,
      isVisible: true,
      createdAt: '2024-01-05',
      views: 432
    },
    {
      id: 4,
      title: '회원 등급 혜택 안내',
      content: '회원 등급별 혜택에 대해 안내드립니다...',
      isFixed: false,
      isVisible: false,
      createdAt: '2023-12-28',
      views: 678
    }
  ];

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '8px'
            }}>
              공지사항 관리
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: 0
            }}>
              고객에게 전달할 공지사항을 작성하고 관리합니다.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
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
            + 새 공지사항
          </button>
        </div>

      {/* 공지사항 작성 폼 */}
      {showForm && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            새 공지사항 작성
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  제목
                </label>
                <input
                  type="text"
                  placeholder="공지사항 제목을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  내용
                </label>
                <textarea
                  rows={6}
                  placeholder="공지사항 내용을 입력하세요"
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
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  <span style={{ fontSize: '14px' }}>상단 고정</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" defaultChecked style={{ marginRight: '8px' }} />
                  <span style={{ fontSize: '14px' }}>즉시 게시</span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '8px 16px',
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
                <button style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#fff',
                  backgroundColor: '#007bff',
                  cursor: 'pointer'
                }}>
                  게시
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 공지사항 목록 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          공지사항 목록 ({notices.length}개)
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
                  제목
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  상태
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  조회수
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  작성일
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {notices.map((notice, index) => (
                <tr key={notice.id} style={{ 
                  borderBottom: index < notices.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {notice.isFixed && (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: '#fee',
                          color: '#c33'
                        }}>
                          고정
                        </span>
                      )}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                          {notice.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {notice.content}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      borderRadius: '12px',
                      backgroundColor: notice.isVisible ? '#e8f5e8' : '#f0f0f0',
                      color: notice.isVisible ? '#2d7a2d' : '#666'
                    }}>
                      {notice.isVisible ? '게시중' : '비공개'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    👁 {notice.views.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {notice.createdAt}
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
                        수정
                      </button>
                      <button style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        color: '#dc3545',
                        backgroundColor: 'transparent',
                        border: '1px solid #dc3545',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        삭제
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
