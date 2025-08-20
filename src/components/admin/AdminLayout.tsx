'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { loading } = useAuth();

  // 권한 체크 제거 - 모든 사용자 접근 허용
  // useEffect(() => {
  //   if (!loading && (!user || !isAdmin)) {
  //     console.log('⚠️ 관리자 페이지 접근 거부:', { user, isAdmin });
  //     router.push('/login');
  //   }
  // }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // 권한 체크 제거 - 모든 사용자 접근 허용
  // if (!user || !isAdmin) {
  //   return null;
  // }

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
