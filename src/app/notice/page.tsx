'use client';

import { useState } from 'react';
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

// 임시 공지사항 데이터
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

export default function NoticePage() {
  const [notices] = useState<Notice[]>(sampleNotices);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">공지사항</h1>
        <p className="text-gray-600">팬더골프의 새로운 소식을 확인하세요.</p>
      </div>

      {/* 공지사항 목록 */}
      <div className="bg-white border rounded-lg">
        {/* 테이블 헤더 */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-semibold text-sm text-gray-700">
          <div className="col-span-1 text-center">번호</div>
          <div className="col-span-6">제목</div>
          <div className="col-span-2 text-center">작성자</div>
          <div className="col-span-2 text-center">작성일</div>
          <div className="col-span-1 text-center">조회수</div>
        </div>

        {/* 공지사항 리스트 */}
        <div className="divide-y divide-gray-200">
          {currentNotices.map((notice) => (
            <div key={notice.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="md:grid md:grid-cols-12 gap-4 items-center">
                {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
                <div className="col-span-1 text-center mb-2 md:mb-0">
                  {notice.isImportant ? (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                      중요
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">{notice.id}</span>
                  )}
                </div>
                
                <div className="col-span-6">
                  <Link 
                    href={`/notice/${notice.id}`}
                    className="hover:text-orange-500 transition-colors"
                  >
                    <h3 className={`${notice.isImportant ? 'font-bold text-red-600' : 'font-medium'} text-lg md:text-base mb-1`}>
                      {notice.title}
                    </h3>
                  </Link>
                  
                  {/* 모바일에서 표시할 메타 정보 */}
                  <div className="md:hidden text-sm text-gray-500 space-x-4">
                    <span>{notice.author}</span>
                    <span>{formatDate(notice.createdAt)}</span>
                    <span>조회 {formatNumber(notice.views)}</span>
                  </div>
                </div>
                
                {/* 데스크톱에서만 표시 */}
                <div className="hidden md:block col-span-2 text-center text-sm text-gray-600">
                  {notice.author}
                </div>
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
        {notices.length === 0 && (
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
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
                    ? 'bg-orange-500 text-white border-orange-500'
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
      <div className="mt-8 text-center">
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
