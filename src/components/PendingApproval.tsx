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
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  승인 대기 안내
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    사업자 인증이 완료된 회원만 상품 주문이 가능합니다.
                    제출해주신 서류를 검토한 후 승인 처리해드리겠습니다.
                  </p>
                  <ul className="mt-2 list-disc list-inside">
                    <li>일반적으로 1-2일 내에 승인이 완료됩니다.</li>
                    <li>문의사항이 있으시면 고객센터로 연락해주세요.</li>
                  </ul>
                </div>
              </div>
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

export default PendingApproval;
