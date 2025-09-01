import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 관리자 페이지 경로 확인
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Firebase Auth는 클라이언트 사이드에서 처리하므로 
    // 서버사이드 미들웨어에서는 단순히 요청을 통과시킴
    // 실제 인증은 AdminLayout과 AuthGuard에서 처리
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
