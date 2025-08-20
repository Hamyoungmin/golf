'use client';

import { useState, useEffect, useRef } from 'react';
import { Notice } from '@/types';
import { getPublishedNotices } from '@/lib/notices';

const NoticeButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  // 데이터 로드
  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      console.log('NoticeButton: 공지사항 로드 시작');
      const publishedNotices = await getPublishedNotices();
      console.log('NoticeButton: 로드된 공지사항:', publishedNotices);
      console.log('NoticeButton: 공지사항 개수:', publishedNotices.length);
      
      // 최근 5개만 표시
      setNotices(publishedNotices.slice(0, 5));
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    setIsPopupOpen(true);
    // 팝업 열 때마다 최신 공지사항 로드
    loadNotices();
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // 팝업 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <>
      <button 
        className="notice-button" 
        onClick={handleButtonClick}
        title="공지사항 보기"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        <div className="notice-badge">
          <span>NEW</span>
        </div>
      </button>

      {isPopupOpen && (
        <div className="notice-popup-overlay">
          <div className="notice-popup" ref={popupRef}>
            <div className="notice-popup-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                공지사항
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="refresh-button" 
                  onClick={loadNotices}
                  title="새로고침"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '4px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 2v6h6"/>
                    <path d="M21 12A9 9 0 0 0 6 5.3L3 8"/>
                    <path d="M21 22v-6h-6"/>
                    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/>
                  </svg>
                </button>
                <button className="close-button" onClick={handleClosePopup}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="notice-popup-content">
              {loading ? (
                <div className="notice-item" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    📋 공지사항을 불러오는 중...
                  </div>
                </div>
              ) : notices.length > 0 ? (
                notices.map((notice) => (
                  <div key={notice.id} className="notice-item">
                    <div className="notice-date">{formatDate(notice.createdAt)}</div>
                    <div className="notice-title">
                      {notice.isFixed && '📌 '}
                      {notice.title}
                    </div>
                    <div className="notice-content">
                      {notice.content.length > 100 
                        ? notice.content.substring(0, 100) + '...' 
                        : notice.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="notice-item" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    등록된 공지사항이 없습니다.
                  </div>
                </div>
              )}
              
              {/* 더보기 링크 */}
              {notices.length > 0 && (
                <div style={{ textAlign: 'center', padding: '15px', borderTop: '1px solid #e0e0e0' }}>
                  <a 
                    href="/notice" 
                    style={{ 
                      color: '#007bff', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    onClick={handleClosePopup}
                  >
                    전체 공지사항 보기 →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoticeButton;
