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
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">공지사항</h1>
        </div>
        <Link 
          href="/notice"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← 목록으로
        </Link>
      </div>

      {/* 공지사항 상세 */}
      <div className="max-w-4xl mx-auto">
        <article className="bg-white border rounded-lg overflow-hidden">
          {/* 제목 영역 */}
          <header className="p-6 border-b bg-gray-50">
            <div className="mb-3">
              {notice.isFixed && (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full mr-3">
                  고정
                </span>
              )}
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${notice.isFixed ? 'text-red-600' : 'text-gray-900'}`}>
              {notice.title}
            </h1>
            
            {/* 메타 정보 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{formatDate(notice.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>조회 {formatNumber(notice.views)}</span>
              </div>
            </div>
          </header>

          {/* 내용 영역 */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {notice.content}
              </div>
            </div>
          </div>
        </article>

        {/* 이전/다음 공지사항 */}
        <div className="mt-8 bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">다른 공지사항</h3>
          <div className="space-y-3">
            {prevNotice && (
              <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">이전글</span>
                  <Link 
                    href={`/notice/${prevNotice.id}`}
                    className="font-medium hover:text-blue-500 transition-colors"
                  >
                    {prevNotice.title}
                  </Link>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </div>
            )}
            
            {nextNotice && (
              <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">다음글</span>
                  <Link 
                    href={`/notice/${nextNotice.id}`}
                    className="font-medium hover:text-blue-500 transition-colors"
                  >
                    {nextNotice.title}
                  </Link>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            )}
            
            {!prevNotice && !nextNotice && (
              <div className="text-center text-gray-500 py-4">
                다른 공지사항이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/notice"
            className="flex-1 bg-gray-600 text-white text-center py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            목록으로 돌아가기
          </Link>
          <Link
            href="/"
            className="flex-1 border border-gray-300 text-center py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
