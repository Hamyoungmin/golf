'use client';

import React from 'react';
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const PendingApproval: React.FC = () => {
  const { signOut, userData } = useAuth();

  if (!userData || userData.status !== 'pending') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-3 text-lg font-medium text-gray-900">
              승인 대기 중
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              회원가입이 완료되었습니다.<br />
              관리자 승인 후 서비스를 이용하실 수 있습니다.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              신청 정보: {userData?.email}
            </p>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  승인 처리 안내
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>• 영업일 기준 1-2일 내 승인 처리됩니다</p>
                  <p>• 사업자 등록증 확인 후 승인됩니다</p>
                  <p>• 문의사항은 고객센터로 연락해주세요</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={signOut}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              로그아웃
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              다른 계정으로 로그인하시거나 승인 후 다시 접속해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;