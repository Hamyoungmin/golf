'use client';

import React, { useState, useEffect } from 'react';
import { 
  SpeakerWaveIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Notice } from '@/types';
import { 
  getNotices, 
  createNotice, 
  updateNotice, 
  deleteNotice, 
  toggleNoticeFixed, 
  toggleNoticeVisibility,
  initializeNotices
} from '@/lib/notices';
import { useAuth } from '@/contexts/AuthContext';

export default function NoticesPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isFixed: false,
    isVisible: true
  });
  const [submitting, setSubmitting] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      // 초기 데이터 생성 (필요시)
      await initializeNotices();
      
      // 공지사항 목록 로드
      const noticesList = await getNotices();
      setNotices(noticesList);
    } catch (error) {
      console.error('공지사항 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 새 공지사항 작성 처리
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!user?.uid) {
      alert('로그인이 필요합니다.');
      return;
    }

    setSubmitting(true);
    try {
      const noticeData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        isFixed: formData.isFixed,
        isVisible: formData.isVisible,
        author: user.uid
      };

      const noticeId = await createNotice(noticeData);
      
      if (noticeId) {
        alert('공지사항이 성공적으로 등록되었습니다.');
        setFormData({
          title: '',
          content: '',
          isFixed: false,
          isVisible: true
        });
        setShowForm(false);
        await loadNotices(); // 목록 새로고침
      } else {
        alert('공지사항 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 등록 오류:', error);
      alert('공지사항 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 공지사항 삭제
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 공지사항을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const success = await deleteNotice(id);
      if (success) {
        alert('공지사항이 삭제되었습니다.');
        await loadNotices();
      } else {
        alert('공지사항 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 삭제 오류:', error);
      alert('공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

  // 상단 고정 토글
  const handleToggleFixed = async (id: string, currentFixed: boolean) => {
    try {
      const success = await toggleNoticeFixed(id, !currentFixed);
      if (success) {
        await loadNotices();
      } else {
        alert('설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('고정 설정 변경 오류:', error);
      alert('설정 변경 중 오류가 발생했습니다.');
    }
  };

  // 게시 상태 토글
  const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const success = await toggleNoticeVisibility(id, !currentVisible);
      if (success) {
        await loadNotices();
      } else {
        alert('게시 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시 상태 변경 오류:', error);
      alert('게시 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '8px'
            }}>
              공지사항 관리
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666',
              margin: 0
            }}>
              고객에게 전달할 공지사항을 작성하고 관리합니다.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#fff',
              backgroundColor: '#007bff',
              cursor: 'pointer'
            }}
          >
            + 새 공지사항
          </button>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            fontSize: '16px',
            color: '#666'
          }}>
            📋 공지사항을 불러오는 중...
          </div>
        )}

      {/* 공지사항 작성 폼 */}
      {showForm && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            새 공지사항 작성
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  제목 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="공지사항 제목을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  내용 <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  rows={6}
                  placeholder="공지사항 내용을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    name="isFixed"
                    checked={formData.isFixed}
                    onChange={handleFormChange}
                    style={{ marginRight: '8px' }} 
                  />
                  <span style={{ fontSize: '14px' }}>상단 고정</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleFormChange}
                    style={{ marginRight: '8px' }} 
                  />
                  <span style={{ fontSize: '14px' }}>즉시 게시</span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      title: '',
                      content: '',
                      isFixed: false,
                      isVisible: true
                    });
                  }}
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#666',
                    backgroundColor: '#f9f9f9',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  취소
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#fff',
                    backgroundColor: submitting ? '#6c757d' : '#007bff',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? '등록 중...' : '게시'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 공지사항 목록 */}
      {!loading && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            fontSize: '18px',
            borderBottom: '1px solid #e0e0e0',
            paddingBottom: '8px'
          }}>
            공지사항 목록 ({notices.length}개)
          </h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            backgroundColor: '#fff',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                    제목
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                    상태
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                    조회수
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                    작성일
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#666', borderBottom: '1px solid #ddd' }}>
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {notices.length > 0 ? (
                  notices.map((notice, index) => (
                    <tr key={notice.id} style={{ 
                      borderBottom: index < notices.length - 1 ? '1px solid #e0e0e0' : 'none'
                    }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {notice.isFixed && (
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '500',
                              backgroundColor: '#fee',
                              color: '#c33'
                            }}>
                              고정
                            </span>
                          )}
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                              {notice.title}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {notice.content}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            backgroundColor: notice.isVisible ? '#e8f5e8' : '#f0f0f0',
                            color: notice.isVisible ? '#2d7a2d' : '#666',
                            textAlign: 'center'
                          }}>
                            {notice.isVisible ? '게시중' : '비공개'}
                          </span>
                          <button
                            onClick={() => handleToggleVisibility(notice.id, notice.isVisible)}
                            style={{
                              padding: '2px 6px',
                              fontSize: '11px',
                              color: notice.isVisible ? '#dc3545' : '#28a745',
                              backgroundColor: 'transparent',
                              border: `1px solid ${notice.isVisible ? '#dc3545' : '#28a745'}`,
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {notice.isVisible ? '비공개' : '게시'}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        👁 {notice.views.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {formatDate(notice.createdAt)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <button
                            onClick={() => handleToggleFixed(notice.id, notice.isFixed)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              color: notice.isFixed ? '#dc3545' : '#28a745',
                              backgroundColor: 'transparent',
                              border: `1px solid ${notice.isFixed ? '#dc3545' : '#28a745'}`,
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {notice.isFixed ? '고정해제' : '상단고정'}
                          </button>
                          <button 
                            onClick={() => handleDelete(notice.id, notice.title)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '12px',
                              color: '#dc3545',
                              backgroundColor: 'transparent',
                              border: '1px solid #dc3545',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                      <p style={{ fontSize: '14px', margin: 0 }}>
                        등록된 공지사항이 없습니다. 새 공지사항을 작성해보세요.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
