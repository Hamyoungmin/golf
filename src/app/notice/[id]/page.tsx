'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Notice {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  isImportant: boolean;
  views: number;
}

// 임시 공지사항 데이터 (실제로는 API에서 가져와야 함)
const sampleNotices: Notice[] = [
  {
    id: 1,
    title: '[중요] 설날 연휴 배송 및 고객센터 운영 안내',
    content: `안녕하세요. 팬더골프입니다.

설날 연휴로 인한 배송 및 고객센터 운영 안내드립니다.

📅 연휴 기간: 2024년 2월 9일(금) ~ 2월 12일(월)

🚛 배송 안내:
- 2월 8일(목) 오후 3시 이후 주문건은 2월 13일(화)부터 순차 발송됩니다.
- 연휴 기간 중에는 배송이 중단됩니다.

📞 고객센터 운영:
- 연휴 기간 중 고객센터는 운영하지 않습니다.
- 2월 13일(화)부터 정상 운영합니다.

불편을 드려 죄송하며, 연휴 후 신속하게 처리해드리겠습니다.

감사합니다.`,
    author: '관리자',
    createdAt: new Date('2024-02-05'),
    isImportant: true,
    views: 1250
  },
  {
    id: 2,
    title: '신규 회원 가입 이벤트 안내',
    content: `팬더골프에 오신 것을 환영합니다!

신규 회원 가입 이벤트를 진행합니다.

🎁 이벤트 혜택:
- 회원가입 시 5,000원 할인 쿠폰 지급
- 첫 주문 시 배송비 무료 (3만원 미만 주문도 가능)

📅 이벤트 기간: 2024년 1월 1일 ~ 2024년 12월 31일

많은 관심과 참여 부탁드립니다.`,
    author: '관리자',
    createdAt: new Date('2024-01-15'),
    isImportant: false,
    views: 892
  },
  {
    id: 3,
    title: '개인정보 처리방침 개정 안내',
    content: `개인정보 처리방침이 개정되어 안내드립니다.

📅 시행일: 2024년 1월 10일

주요 변경사항:
1. 개인정보 처리 목적 명시 강화
2. 개인정보 보유기간 세분화
3. 고객 권리 보장 내용 추가

자세한 내용은 개인정보 처리방침 페이지에서 확인하실 수 있습니다.`,
    author: '관리자',
    createdAt: new Date('2024-01-08'),
    isImportant: false,
    views: 456
  },
  {
    id: 4,
    title: '겨울철 골프용품 관리 팁',
    content: `겨울철 골프용품 관리 방법을 안내드립니다.

🏌️‍♂️ 겨울철 골프클럽 관리:
- 사용 후에는 반드시 물기를 제거해주세요
- 실내 건조한 곳에 보관하세요
- 정기적으로 그립 상태를 점검하세요

⛳ 골프공 관리:
- 온도 변화가 적은 곳에 보관
- 직사광선 피해서 보관

적절한 관리로 오래 사용하세요!`,
    author: '관리자',
    createdAt: new Date('2023-12-20'),
    isImportant: false,
    views: 234
  },
  {
    id: 5,
    title: '사이트 개편 완료 안내',
    content: `안녕하세요. 팬더골프입니다.

사이트 개편 작업이 완료되어 안내드립니다.

✨ 개선사항:
- 모바일 최적화 완료
- 검색 기능 향상
- 페이지 로딩 속도 개선
- 사용자 인터페이스 개선

더욱 편리해진 팬더골프를 이용해주세요.

감사합니다.`,
    author: '관리자',
    createdAt: new Date('2023-12-01'),
    isImportant: false,
    views: 678
  }
];

export default function NoticeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noticeId = Number(params.id);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제로는 API에서 공지사항을 가져와야 함
    const fetchNotice = () => {
      setLoading(true);
      
      const foundNotice = sampleNotices.find(n => n.id === noticeId);
      
      if (foundNotice) {
        // 조회수 증가 (실제로는 API 호출)
        const updatedNotice = { ...foundNotice, views: foundNotice.views + 1 };
        setNotice(updatedNotice);
      } else {
        setNotice(null);
      }
      
      setLoading(false);
    };

    fetchNotice();
  }, [noticeId]);

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
  const currentIndex = sampleNotices.findIndex(n => n.id === noticeId);
  const prevNotice = currentIndex > 0 ? sampleNotices[currentIndex - 1] : null;
  const nextNotice = currentIndex < sampleNotices.length - 1 ? sampleNotices[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">공지사항을 불러오는 중...</div>
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
              {notice.isImportant && (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full mr-3">
                  중요
                </span>
              )}
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${notice.isImportant ? 'text-red-600' : 'text-gray-900'}`}>
              {notice.title}
            </h1>
            
            {/* 메타 정보 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>{notice.author}</span>
              </div>
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
