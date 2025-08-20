'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Notice } from '@/types';
import { getNotice, getPublishedNotices, incrementNoticeViews } from '@/lib/notices';

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = params.id as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotice();
  }, [noticeId]);

  const fetchNotice = async () => {
    setLoading(true);
    try {
      // 현재 공지사항 가져오기
      const currentNotice = await getNotice(noticeId);
      
      if (currentNotice) {
        // 조회수 증가
        await incrementNoticeViews(noticeId);
        
        // 조회수가 증가된 데이터 다시 가져오기
        const updatedNotice = await getNotice(noticeId);
        setNotice(updatedNotice);
        
        // 전체 공지사항 목록도 가져오기 (이전/다음 탐색용)
        const allNoticesList = await getPublishedNotices();
        setAllNotices(allNoticesList);
      } else {
        setNotice(null);
      }
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
      setNotice(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 이전/다음 공지사항 찾기
  const currentIndex = allNotices.findIndex(n => n.id === noticeId);
  const prevNotice = currentIndex > 0 ? allNotices[currentIndex - 1] : null;
  const nextNotice = currentIndex < allNotices.length - 1 ? allNotices[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400 animate-spin">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">공지사항을 불러오는 중...</h3>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M8 12h8"/>
              <path d="M8 16h6"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">공지사항을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 공지사항이 존재하지 않거나 삭제되었습니다.</p>
          <Link 
            href="/notice" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            공지사항 목록으로
          </Link>
        </div>
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
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '30px' 
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: 0 
            }}>
              공지사항
            </h1>
          </div>
          <Link 
            href="/notice"
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              color: '#666',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#fff',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            ← 목록으로
          </Link>
        </div>

        {/* 공지사항 상세 */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <article style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}>
            {/* 제목 영역 */}
            <header style={{ 
              padding: '25px', 
              borderBottom: '1px solid #ddd', 
              backgroundColor: '#f9f9f9' 
            }}>
              <div style={{ marginBottom: '15px' }}>
                {notice.isFixed && (
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: '#fee',
                    color: '#c33',
                    fontSize: '12px',
                    fontWeight: '500',
                    borderRadius: '20px',
                    marginRight: '10px'
                  }}>
                    고정
                  </span>
                )}
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '20px',
                color: notice.isFixed ? '#c33' : '#333',
                lineHeight: '1.4',
                margin: '0 0 20px 0'
              }}>
                {notice.title}
              </h1>
              
              {/* 메타 정보 */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'center', 
                gap: '20px', 
                fontSize: '14px', 
                color: '#666' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{formatDate(notice.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>조회 {formatNumber(notice.views)}</span>
                </div>
              </div>
            </header>

            {/* 내용 영역 */}
            <div style={{ padding: '30px' }}>
              <div style={{ 
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#333',
                whiteSpace: 'pre-wrap'
              }}>
                {notice.content}
              </div>
            </div>
          </article>

          {/* 이전/다음 공지사항 */}
          <div style={{ 
            marginTop: '30px', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '25px',
            backgroundColor: '#fff'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              다른 공지사항
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {prevNotice && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>이전글</span>
                    <Link 
                      href={`/notice/${prevNotice.id}`}
                      style={{
                        fontWeight: '500',
                        color: '#333',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                    >
                      {prevNotice.title}
                    </Link>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#ccc' }}>
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </div>
              )}
              
              {nextNotice && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>다음글</span>
                    <Link 
                      href={`/notice/${nextNotice.id}`}
                      style={{
                        fontWeight: '500',
                        color: '#333',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                    >
                      {nextNotice.title}
                    </Link>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#ccc' }}>
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              )}
              
              {!prevNotice && !nextNotice && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  padding: '20px',
                  fontSize: '14px'
                }}>
                  다른 공지사항이 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div style={{ 
            marginTop: '30px', 
            display: 'flex', 
            flexDirection: 'row', 
            gap: '15px'
          }}>
            <Link
              href="/notice"
              style={{
                flex: '1',
                backgroundColor: '#6c757d',
                color: '#fff',
                textAlign: 'center',
                padding: '12px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
            >
              목록으로 돌아가기
            </Link>
            <Link
              href="/"
              style={{
                flex: '1',
                border: '1px solid #ddd',
                color: '#666',
                textAlign: 'center',
                padding: '12px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#fff',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              홈으로 가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
