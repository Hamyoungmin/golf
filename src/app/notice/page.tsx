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
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">공지사항</h1>
        <p className="text-gray-600">골프상회의 새로운 소식을 확인하세요.</p>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400 animate-spin">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">공지사항을 불러오는 중...</h3>
        </div>
      )}

      {/* 공지사항 목록 */}
      {!loading && (
        <div className="bg-white border rounded-lg">
          {/* 테이블 헤더 */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-semibold text-sm text-gray-700">
            <div className="col-span-1 text-center">번호</div>
            <div className="col-span-6">제목</div>
            <div className="col-span-2 text-center">작성일</div>
            <div className="col-span-1 text-center">조회수</div>
          </div>

          {/* 공지사항 리스트 */}
          <div className="divide-y divide-gray-200">
            {currentNotices.map((notice, index) => (
              <div key={notice.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="md:grid md:grid-cols-12 gap-4 items-center">
                  {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
                  <div className="col-span-1 text-center mb-2 md:mb-0">
                    {notice.isFixed ? (
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                        고정
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">{startIndex + index + 1}</span>
                    )}
                  </div>
                  
                  <div className="col-span-6">
                    <Link 
                      href={`/notice/${notice.id}`}
                      onClick={() => handleNoticeClick(notice.id)}
                      className="hover:text-blue-500 transition-colors"
                    >
                      <h3 className={`${notice.isFixed ? 'font-bold text-red-600' : 'font-medium'} text-lg md:text-base mb-1`}>
                        {notice.title}
                      </h3>
                    </Link>
                    
                    {/* 모바일에서 표시할 메타 정보 */}
                    <div className="md:hidden text-sm text-gray-500 space-x-4">
                      <span>{formatDate(notice.createdAt)}</span>
                      <span>조회 {formatNumber(notice.views)}</span>
                    </div>
                  </div>
                  
                  {/* 데스크톱에서만 표시 */}
                  <div className="hidden md:block col-span-2 text-center text-sm text-gray-600">
                    {formatDate(notice.createdAt)}
                  </div>
                  <div className="hidden md:block col-span-1 text-center text-sm text-gray-600">
                    {formatNumber(notice.views)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 공지사항이 없는 경우 */}
          {notices.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto text-gray-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <path d="M8 12h8"/>
                  <path d="M8 16h6"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">등록된 공지사항이 없습니다</h3>
              <p className="text-gray-600">새로운 공지사항이 등록되면 알려드리겠습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border rounded ${
                  currentPage === page
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* 하단 링크 */}
      {!loading && (
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      )}
    </div>
  );
}
