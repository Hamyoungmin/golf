'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon 
} from '@heroicons/react/24/outline';
import { 
  db,
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  updateDoc,
  serverTimestamp,
  orderBy
} from '@/lib/firebase';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const { user: currentUser } = useAuth();

  // 모든 상태별 카운트 가져오기
  const fetchCounts = async () => {
    try {
      const statusTypes = ['pending', 'approved', 'rejected'] as const;
      const countPromises = statusTypes.map(async (status) => {
        const q = query(collection(db, 'users'), where('status', '==', status));
        const snapshot = await getDocs(q);
        return { status, count: snapshot.size };
      });
      
      const results = await Promise.all(countPromises);
      const newCounts = { pending: 0, approved: 0, rejected: 0 };
      results.forEach(result => {
        newCounts[result.status] = result.count;
      });
      
      setCounts(newCounts);
    } catch (error) {
      console.error('카운트 가져오기 실패:', error);
    }
  };

  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('status', '==', filter)
      );
      
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map((doc: any) => ({
        ...doc.data(),
        uid: doc.id,
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

  // 사용자 승인 (API 사용)
  const approveUser = async (uid: string) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    const { customConfirm } = await import('@/utils/alertUtils');
    const confirmed = await customConfirm('정말로 이 사용자를 승인하시겠습니까?', '사용자 승인');
    if (!confirmed) {
      return;
    }
    
    try {
      console.log('승인 시작:', uid, '관리자:', currentUser.uid);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: uid,
          action: 'approve',
          adminUid: currentUser.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '승인 처리에 실패했습니다.');
      }

      const result = await response.json();
      const { triggerCustomAlert } = await import('@/utils/alertUtils');
      triggerCustomAlert(result.message, result.success ? 'success' : 'error');
      fetchUsers(); // 목록 새로고침
      fetchCounts(); // 카운트 새로고침
    } catch (error) {
      console.error('사용자 승인 실패:', error);
      const { triggerCustomAlert } = await import('@/utils/alertUtils');
      triggerCustomAlert(`승인 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : error}`, 'error');
    }
  };

  // 사용자 거부 (직접 Firebase 접근)
  const rejectUser = async (uid: string, reason?: string) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (!reason) {
      const { customPrompt } = await import('@/utils/alertUtils');
      reason = await customPrompt('거부 사유를 입력해주세요:', '', '거부 사유');
      if (!reason) return;
    }
    const rejectionReason = reason;
    
    const { customConfirm } = await import('@/utils/alertUtils');
    const confirmed = await customConfirm('정말로 이 사용자를 거부하시겠습니까?', '사용자 거부');
    if (!confirmed) {
      return;
    }
    
    try {
      console.log('거부 시작:', uid, '관리자:', currentUser.uid);
      const userRef = doc(db, 'users', uid);
      const updateData = {
        status: 'rejected',
        rejectionReason,
        rejectedBy: currentUser.uid,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('업데이트 데이터:', updateData);
      await updateDoc(userRef, updateData);
      
      const { triggerCustomAlert } = await import('@/utils/alertUtils');
      triggerCustomAlert('사용자가 거부되었습니다.', 'success');
      fetchUsers(); // 목록 새로고침
      fetchCounts(); // 카운트 새로고침
    } catch (error) {
      console.error('사용자 거부 실패:', error);
      const { triggerCustomAlert } = await import('@/utils/alertUtils');
      triggerCustomAlert(`거부 처리 중 오류가 발생했습니다: ${error}`, 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  useEffect(() => {
    fetchCounts();
  }, []);

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
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '10px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          사용자 관리
        </h1>
        <p style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '14px',
          color: '#666'
        }}>
          회원가입 신청을 검토하고 승인/거부할 수 있습니다.
        </p>

      {/* 필터 탭 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          사용자 상태별 필터
        </h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px'
        }}>
          {[
            { key: 'pending', label: '승인 대기', count: counts.pending },
            { key: 'approved', label: '승인됨', count: counts.approved },
            { key: 'rejected', label: '거부됨', count: counts.rejected }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'pending' | 'approved' | 'rejected')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                color: filter === tab.key ? '#fff' : '#666',
                backgroundColor: filter === tab.key ? '#007bff' : '#f9f9f9',
                cursor: 'pointer'
              }}
            >
              {tab.label}
              <span style={{
                padding: '2px 6px',
                borderRadius: '10px',
                backgroundColor: filter === tab.key ? 'rgba(255,255,255,0.3)' : '#e0e0e0',
                fontSize: '12px'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 사용자 목록 */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ 
          fontWeight: 'bold', 
          marginBottom: '15px',
          fontSize: '18px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          사용자 목록 ({users.length}개)
        </h3>
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}>
          {users.length === 0 ? (
            <div style={{ 
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>👤</div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>사용자가 없습니다</h3>
              <p style={{ fontSize: '14px' }}>
                {filter === 'pending' && '승인 대기 중인 사용자가 없습니다.'}
                {filter === 'approved' && '승인된 사용자가 없습니다.'}
                {filter === 'rejected' && '거부된 사용자가 없습니다.'}
              </p>
            </div>
          ) : (
            users.map((user, index) => (
              <div key={user.uid}>
                <div style={{ 
                  padding: '20px',
                  borderBottom: index < users.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {user.name}
                          </p>
                          <p style={{ fontSize: '14px', color: '#666' }}>
                            {user.email}
                          </p>
                        </div>
                        {getStatusBadge(user.status)}
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        <div>
                          <span style={{ fontWeight: '500' }}>상호명:</span> {user.companyName}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500' }}>사업자번호:</span> {user.businessNumber}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500' }}>연락처:</span> {user.phone}
                        </div>
                        <div>
                          <span style={{ fontWeight: '500' }}>신청일:</span> {formatDate(user.createdAt)}
                        </div>
                      </div>

                      {/* 사진 미리보기 */}
                      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                        {user.shopInteriorPhotoUrl && (
                          <div>
                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>샵 내부</p>
                            <img 
                              src={user.shopInteriorPhotoUrl} 
                              alt="샵 내부" 
                              style={{
                                width: '64px',
                                height: '64px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: '1px solid #ddd',
                                backgroundColor: '#f5f5f5'
                              }}
                              onClick={() => window.open(user.shopInteriorPhotoUrl, '_blank')}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <p style="fontSize: 12px; color: #666; marginBottom: 4px;">샵 내부</p>
                                    <div style="
                                      width: 64px;
                                      height: 64px;
                                      backgroundColor: #f5f5f5;
                                      border: 1px solid #ddd;
                                      borderRadius: 4px;
                                      display: flex;
                                      alignItems: center;
                                      justifyContent: center;
                                      fontSize: 12px;
                                      color: #999;
                                    ">📷 이미지 없음</div>
                                  `;
                                }
                              }}
                            />
                          </div>
                        )}
                        {user.shopSignPhotoUrl && (
                          <div>
                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>샵 간판</p>
                            <img 
                              src={user.shopSignPhotoUrl} 
                              alt="샵 간판" 
                              style={{
                                width: '64px',
                                height: '64px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                border: '1px solid #ddd',
                                backgroundColor: '#f5f5f5'
                              }}
                              onClick={() => window.open(user.shopSignPhotoUrl, '_blank')}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <p style="fontSize: 12px; color: #666; marginBottom: 4px;">샵 간판</p>
                                    <div style="
                                      width: 64px;
                                      height: 64px;
                                      backgroundColor: #f5f5f5;
                                      border: 1px solid #ddd;
                                      borderRadius: 4px;
                                      display: flex;
                                      alignItems: center;
                                      justifyContent: center;
                                      fontSize: 12px;
                                      color: #999;
                                    ">📷 이미지 없음</div>
                                  `;
                                }
                              }}
                            />
                          </div>
                        )}
                        {!user.shopInteriorPhotoUrl && !user.shopSignPhotoUrl && (
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            📷 업로드된 사진이 없습니다
                          </div>
                        )}
                      </div>

                      {/* 거부 사유 표시 */}
                      {user.status === 'rejected' && user.rejectionReason && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#fee',
                          border: '1px solid #fcc',
                          borderRadius: '4px',
                          marginBottom: '10px'
                        }}>
                          <p style={{ fontSize: '14px', color: '#c33' }}>
                            <span style={{ fontWeight: '500' }}>거부 사유:</span> {user.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* 승인 정보 표시 */}
                      {user.status === 'approved' && user.approvedAt && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#e8f4fd',
                          border: '1px solid #bee5eb',
                          borderRadius: '4px',
                          marginBottom: '10px'
                        }}>
                          <p style={{ fontSize: '14px', color: '#0c5460' }}>
                            <span style={{ fontWeight: '500' }}>승인일:</span> {formatDate(user.approvedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    {user.status === 'pending' && (
                      <div style={{ marginLeft: '15px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => approveUser(user.uid)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#fff',
                            backgroundColor: '#007bff',
                            cursor: 'pointer'
                          }}
                        >
                          ✓ 승인
                        </button>
                        <button
                          onClick={() => rejectUser(user.uid)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#fff',
                            backgroundColor: '#dc3545',
                            cursor: 'pointer'
                          }}
                        >
                          ✗ 거부
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
