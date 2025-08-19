'use client';

import React, { useState } from 'react';
import { 
  SpeakerWaveIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function NoticesPage() {
  const [showForm, setShowForm] = useState(false);

  // 더미 공지사항 데이터
  const notices = [
    {
      id: 1,
      title: '골프상회 홈페이지 리뉴얼 안내',
      content: '더 나은 서비스 제공을 위해 홈페이지를 리뉴얼했습니다...',
      isFixed: true,
      isVisible: true,
      createdAt: '2024-01-15',
      views: 1247
    },
    {
      id: 2,
      title: '설연휴 배송 안내',
      content: '설연휴 기간 중 배송 일정에 대해 안내드립니다...',
      isFixed: false,
      isVisible: true,
      createdAt: '2024-01-10',
      views: 856
    },
    {
      id: 3,
      title: '신제품 입고 안내 - 캘러웨이 2024 신상',
      content: '캘러웨이 2024년 신제품이 입고되었습니다...',
      isFixed: false,
      isVisible: true,
      createdAt: '2024-01-05',
      views: 432
    },
    {
      id: 4,
      title: '회원 등급 혜택 안내',
      content: '회원 등급별 혜택에 대해 안내드립니다...',
      isFixed: false,
      isVisible: false,
      createdAt: '2023-12-28',
      views: 678
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">공지사항 관리</h1>
            <p className="text-gray-600">고객에게 전달할 공지사항을 작성하고 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 inline mr-2" />
            새 공지사항
          </button>
        </div>
      </div>

      {/* 공지사항 작성 폼 */}
      {showForm && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">새 공지사항 작성</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용
                </label>
                <textarea
                  rows={6}
                  placeholder="공지사항 내용을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">상단 고정</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-700">즉시 게시</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  게시
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 공지사항 목록 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">공지사항 목록</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {notice.isFixed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                          고정
                        </span>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {notice.content}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      notice.isVisible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {notice.isVisible ? '게시중' : '비공개'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <EyeIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {notice.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{notice.createdAt}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
