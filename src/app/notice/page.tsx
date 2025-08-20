'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Notice } from '@/types';
import { getPublishedNotices, incrementNoticeViews } from '@/lib/notices';

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 데이터 로드
  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const publishedNotices = await getPublishedNotices();
      setNotices(publishedNotices);
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(notices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = notices.slice(startIndex, endIndex);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 공지사항 클릭 시 조회수 증가
  const handleNoticeClick = async (noticeId: string) => {
    await incrementNoticeViews(noticeId);
    // 조회수 증가 후 목록 새로고침 (선택적)
    // await loadNotices();
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '10px',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            공지사항
          </h1>
          <p style={{
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '14px',
            color: '#666'
          }}>
            골프상회의 새로운 소식을 확인하세요.
          </p>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            fontSize: '16px',
            color: '#666'
          }}>
            📋 공지사항을 불러오는 중...
          </div>
        )}

        {/* 공지사항 목록 */}
        {!loading && (
          <div>
            {/* 공지사항 개수 표시 */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontWeight: 'bold', 
                marginBottom: '15px',
                fontSize: '18px',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '8px'
              }}>
                전체 공지사항 ({notices.length}개)
              </h3>
            </div>

            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: '#fff',
              overflowX: 'auto'
            }}>
              {/* 테이블 헤더 */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '80px 1fr 150px 100px', 
                gap: '15px', 
                padding: '15px 20px', 
                borderBottom: '1px solid #ddd', 
                backgroundColor: '#f5f5f5', 
                fontWeight: '500', 
                fontSize: '14px', 
                color: '#666' 
              }}>
                <div style={{ textAlign: 'center' }}>번호</div>
                <div>제목</div>
                <div style={{ textAlign: 'center' }}>작성일</div>
                <div style={{ textAlign: 'center' }}>조회수</div>
              </div>

              {/* 공지사항 리스트 */}
              <div>
                {currentNotices.map((notice, index) => (
                  <div key={notice.id} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '80px 1fr 150px 100px', 
                    gap: '15px', 
                    padding: '15px 20px',
                    borderBottom: index < currentNotices.length - 1 ? '1px solid #e0e0e0' : 'none',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* 번호/고정 표시 */}
                    <div style={{ textAlign: 'center' }}>
                      {notice.isFixed ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: '#fee',
                          color: '#c33'
                        }}>
                          고정
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontSize: '14px' }}>
                          {startIndex + index + 1}
                        </span>
                      )}
                    </div>
                    
                    {/* 제목 */}
                    <div>
                      <Link 
                        href={`/notice/${notice.id}`}
                        onClick={() => handleNoticeClick(notice.id)}
                        style={{ textDecoration: 'none' }}
                      >
                        <h3 style={{ 
                          fontSize: '16px',
                          fontWeight: notice.isFixed ? 'bold' : '500',
                          color: notice.isFixed ? '#c33' : '#333',
                          margin: 0,
                          cursor: 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = notice.isFixed ? '#c33' : '#333'}
                        >
                          {notice.title}
                        </h3>
                      </Link>
                    </div>
                    
                    {/* 작성일 */}
                    <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
                      {formatDate(notice.createdAt)}
                    </div>

                    {/* 조회수 */}
                    <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
                      👁 {formatNumber(notice.views)}
                    </div>
                  </div>
                ))}
              </div>

              {/* 공지사항이 없는 경우 */}
              {notices.length === 0 && !loading && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', margin: '0 0 10px 0' }}>
                    등록된 공지사항이 없습니다
                  </h3>
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    새로운 공지사항이 등록되면 알려드리겠습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '30px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                  color: currentPage === 1 ? '#ccc' : '#666',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }
                }}
              >
                이전
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: currentPage === page ? '#007bff' : '#fff',
                    color: currentPage === page ? '#fff' : '#666',
                    borderColor: currentPage === page ? '#007bff' : '#ddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== page) {
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== page) {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }
                  }}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  color: currentPage === totalPages ? '#ccc' : '#666',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }
                }}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* 하단 링크 */}
        {!loading && (
          <div style={{ 
            marginTop: '30px', 
            textAlign: 'center' 
          }}>
            <Link 
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: '#fff',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
            >
              홈으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
