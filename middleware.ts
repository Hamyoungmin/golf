import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 관리자 페이지 경로 확인
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 쿠키에서 인증 정보 확인 (Firebase Auth는 클라이언트 사이드에서 처리)
    // 여기서는 클라이언트로 리다이렉트하여 인증 확인
    const url = request.nextUrl.clone();
    
    // 관리자 인증 확인 페이지를 거쳐가도록 설정
    const authCheckParam = url.searchParams.get('authCheck');
    if (!authCheckParam) {
      url.searchParams.set('authCheck', 'true');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
