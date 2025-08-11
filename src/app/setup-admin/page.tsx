'use client';

import React, { useState } from 'react';
import { updateUserProfile } from '@/lib/users';
import { useAuth } from '@/contexts/AuthContext';

export default function SetupAdminPage() {
  const { user, userData } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const makeAdmin = async () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 현재 로그인한 사용자를 관리자로 만들기
      if (user && user.email === email) {
        await updateUserProfile(user.uid, { isAdmin: true });
        alert('관리자 권한이 부여되었습니다. 페이지를 새로고침해주세요.');
        window.location.reload();
      } else {
        alert('현재 로그인한 계정의 이메일과 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('관리자 설정 실패:', error);
      alert('관리자 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            관리자 설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            초기 관리자 설정 페이지입니다. 
            <br />
            보안을 위해 설정 후 이 페이지를 삭제하세요.
          </p>
        </div>
        
        <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          {user ? (
            <>
              <div>
                <p className="text-sm text-gray-600">현재 로그인한 계정:</p>
                <p className="font-medium">{user.email}</p>
                {userData?.isAdmin && (
                  <p className="text-green-600 text-sm mt-2">✓ 이미 관리자입니다</p>
                )}
              </div>

              {!userData?.isAdmin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      확인을 위해 이메일을 다시 입력하세요
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <button
                    onClick={makeAdmin}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? '처리 중...' : '관리자로 설정'}
                  </button>
                </>
              )}

              {userData?.isAdmin && (
                <div className="space-y-4">
                  <a
                    href="/admin"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    관리자 페이지로 이동
                  </a>
                  <p className="text-xs text-red-600 text-center">
                    ⚠️ 주의: 이 페이지(/setup-admin)는 보안을 위해 삭제해주세요
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-center text-gray-600">먼저 로그인해주세요.</p>
              <a
                href="/login"
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                로그인 페이지로 이동
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
