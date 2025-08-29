'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PendingApproval from './PendingApproval';
import AccountRejected from './AccountRejected';
import { usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, userData, loading, isAdmin } = useAuth();
  const pathname = usePathname();

  // 로딩 중이면 로딩 스피너 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 로그인하지 않은 사용자는 정상적으로 접근 허용 (로그인/회원가입 페이지 등)
  if (!user) {
    return <>{children}</>;
  }

  // 로그인했지만 사용자 데이터가 없는 경우 (에러 상황)
  if (!userData) {
    return <>{children}</>;
  }

  // 관리자 이메일 목록
  const ADMIN_EMAILS = [
    'dudals7334@naver.com',
    'rentalgolf@gmail.com'
  ];

  // 관리자 페이지 접근 시 권한 체크
  if (pathname.startsWith('/admin')) {
    if (!isAdmin || !user?.email || !ADMIN_EMAILS.includes(user.email)) {
      // 관리자가 아닌 경우 메인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return null;
    }
  }

  // 거부된 사용자
  if (userData.status === 'rejected') {
    return <AccountRejected />;
  }

  // 승인 대기 중인 사용자 (관리자 제외)
  if (userData.status === 'pending' && !userData.isAdmin && userData.role !== 'admin') {
    // 승인 대기 사용자는 홈페이지, 로그인/회원가입 페이지만 접근 허용
    const allowedPaths = ['/login', '/register', '/'];
    if (!allowedPaths.includes(pathname)) {
      return <PendingApproval />;
    }
  }

  // 승인된 사용자 또는 관리자는 정상 접근 허용
  return <>{children}</>;
};

export default AuthGuard;
