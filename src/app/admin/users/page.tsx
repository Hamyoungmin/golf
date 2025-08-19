'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CheckIcon, 
  XMarkIcon,
  EyeIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { user: currentUser } = useAuth();

  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    try {
      let q;
      if (filter === 'all') {
        q = query(collection(db, 'users'));
      } else {
        q = query(
          collection(db, 'users'), 
          where('status', '==', filter)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate(),
      })) as User[];
      
      // 클라이언트 사이드에서 생성일 기준으로 정렬 (최신순)
      const sortedUsers = usersData.sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error('사용자 목록 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 승인
  const approveUser = async (uid: string) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: currentUser.uid,
        updatedAt: new Date()
      });
      
      alert('사용자가 승인되었습니다.');
      fetchUsers(); // 목록 새로고침
    } catch (error) {
      console.error('사용자 승인 실패:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  // 사용자 거부
  const rejectUser = async (uid: string, reason?: string) => {
    if (!currentUser) return;
    
    const rejectionReason = reason || prompt('거부 사유를 입력해주세요:');
    if (!rejectionReason) return;
    
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status: 'rejected',
        rejectionReason,
        approvedBy: currentUser.uid,
        updatedAt: new Date()
      });
      
      alert('사용자가 거부되었습니다.');
      fetchUsers(); // 목록 새로고침
    } catch (error) {
      console.error('사용자 거부 실패:', error);
      alert('거부 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: '승인 대기',
      approved: '승인됨',
      rejected: '거부됨'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">사용자 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            회원가입 신청을 검토하고 승인/거부할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: '승인 대기', count: users.filter(u => u.status === 'pending').length },
            { key: 'approved', label: '승인됨', count: users.filter(u => u.status === 'approved').length },
            { key: 'rejected', label: '거부됨', count: users.filter(u => u.status === 'rejected').length },
            { key: 'all', label: '전체', count: users.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'pending' | 'approved' | 'rejected')}
              className={`${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              {tab.label}
              <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">사용자가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'pending' && '승인 대기 중인 사용자가 없습니다.'}
                {filter === 'approved' && '승인된 사용자가 없습니다.'}
                {filter === 'rejected' && '거부된 사용자가 없습니다.'}
                {filter === 'all' && '등록된 사용자가 없습니다.'}
              </p>
            </li>
          ) : (
            users.map((user) => (
              <li key={user.uid}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                        {getStatusBadge(user.status)}
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">상호명:</span> {user.companyName}
                        </div>
                        <div>
                          <span className="font-medium">사업자번호:</span> {user.businessNumber}
                        </div>
                        <div>
                          <span className="font-medium">연락처:</span> {user.phone}
                        </div>
                        <div>
                          <span className="font-medium">신청일:</span> {formatDate(user.createdAt)}
                        </div>
                      </div>

                      {/* 사진 미리보기 */}
                      <div className="mt-3 flex space-x-4">
                        {user.shopInteriorPhotoUrl && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">샵 내부</p>
                            <img 
                              src={user.shopInteriorPhotoUrl} 
                              alt="샵 내부" 
                              className="h-16 w-16 object-cover rounded cursor-pointer"
                              onClick={() => window.open(user.shopInteriorPhotoUrl, '_blank')}
                            />
                          </div>
                        )}
                        {user.shopSignPhotoUrl && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">샵 간판</p>
                            <img 
                              src={user.shopSignPhotoUrl} 
                              alt="샵 간판" 
                              className="h-16 w-16 object-cover rounded cursor-pointer"
                              onClick={() => window.open(user.shopSignPhotoUrl, '_blank')}
                            />
                          </div>
                        )}
                      </div>

                      {/* 거부 사유 표시 */}
                      {user.status === 'rejected' && user.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-md">
                          <p className="text-sm text-red-800">
                            <span className="font-medium">거부 사유:</span> {user.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* 승인 정보 표시 */}
                      {user.status === 'approved' && user.approvedAt && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">승인일:</span> {formatDate(user.approvedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    {user.status === 'pending' && (
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => approveUser(user.uid)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          승인
                        </button>
                        <button
                          onClick={() => rejectUser(user.uid)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          거부
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
