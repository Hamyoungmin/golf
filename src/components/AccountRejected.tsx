'use client';

import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const AccountRejected: React.FC = () => {
  const { signOut, userData } = useAuth();

  if (!userData || userData.status !== 'rejected') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-3 text-lg font-medium text-gray-900">
              회원가입이 거부되었습니다
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              제출해주신 서류 검토 결과 승인이 어려운 상황입니다.
            </p>
          </div>

          {userData.rejectionReason && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    거부 사유
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{userData.rejectionReason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium">재신청 안내</p>
              <p className="mt-1">
                문제가 해결되신 후 다시 회원가입을 신청해주세요.
                궁금한 점이 있으시면 고객센터로 문의해주시기 바랍니다.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountRejected;
