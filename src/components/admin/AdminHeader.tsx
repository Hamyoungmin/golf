'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const AdminHeader: React.FC = () => {
  const { userData, signOut } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200" style={{ height: '60px' }}>
      <div className="px-6 flex items-center justify-between h-full">
        <div className="flex items-center" style={{ marginLeft: '2cm' }}>
          <h2 className="text-lg font-medium text-gray-800">
            관리 시스템
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* 사용자 정보 */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {userData?.name || userData?.email || '시스템 관리자'}
            </p>
            <p className="text-xs text-gray-500 flex items-center justify-end">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
              온라인
            </p>
          </div>

          {/* 사용자 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-100 rounded-full"
            >
              <UserCircleIcon className="h-9 w-9" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  쇼핑몰로 이동
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
