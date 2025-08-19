'use client';

import React, { useState } from 'react';
import { updateUserProfile, grantAdminRole } from '@/lib/users';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SetupAdminPage() {
  const { user, userData } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otherUserEmail, setOtherUserEmail] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);

  const makeAdmin = async () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 현재 로그인한 사용자를 관리자로 만들기
      if (user && user.email === email) {
        await updateUserProfile(user.uid, { role: 'admin' });
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

  const grantAdminToOtherUser = async () => {
    if (!otherUserEmail) {
      alert('이메일을 입력해주세요.');
      return;
    }

    setGrantLoading(true);
    try {
      const result = await grantAdminRole(otherUserEmail);
      alert(result.message);
      if (result.success) {
        setOtherUserEmail('');
      }
    } catch (error) {
      console.error('관리자 권한 부여 실패:', error);
      alert('관리자 권한 부여에 실패했습니다.');
    } finally {
      setGrantLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '50px auto', padding: '20px' }}>
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '30px',
        backgroundColor: '#fff'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
            관리자 설정
        </h1>

        {/* 안내 메시지 */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{
            padding: '15px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '5px' 
            }}>
            초기 관리자 설정 페이지입니다. 
            </p>
            <p style={{ 
              fontSize: '12px', 
              color: '#d32f2f' 
            }}>
              ⚠️ 보안을 위해 설정 후 이 페이지를 삭제하세요.
            </p>
          </div>
        </div>
        
          {user ? (
            <>
            {/* 현재 계정 정보 */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ 
                fontWeight: 'bold', 
                marginBottom: '15px',
                fontSize: '18px',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '8px'
              }}>
                현재 로그인 계정
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    이메일
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f5f5f5',
                    fontSize: '14px'
                  }}>
                    {user.email}
                  </div>
                </div>
                
              <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    현재 권한
                  </label>
                  <div style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: userData?.role === 'admin' ? '#e8f5e8' : '#f5f5f5',
                    fontSize: '14px',
                    color: userData?.role === 'admin' ? '#2e7d32' : '#333'
                  }}>
                    {userData?.role === 'admin' ? '✓ 관리자' : '일반 사용자'}
                  </div>
                </div>
              </div>
              </div>

            {userData?.role !== 'admin' ? (
              <>
                {/* 관리자 설정 */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '15px',
                    fontSize: '18px',
                    borderBottom: '1px solid #e0e0e0',
                    paddingBottom: '8px'
                  }}>
                    관리자 권한 부여
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '5px',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                      확인을 위해 이메일을 다시 입력하세요
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={makeAdmin}
                    disabled={loading}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                  >
                    {loading ? '처리 중...' : '관리자로 설정'}
                  </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 관리자 액세스 */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '15px',
                    fontSize: '18px',
                    borderBottom: '1px solid #e0e0e0',
                    paddingBottom: '8px'
                  }}>
                    관리자 메뉴
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <Link 
                      href="/admin"
                      style={{
                        display: 'block',
                        padding: '12px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: '#333',
                        backgroundColor: '#f9f9f9',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      📊 대시보드
                    </Link>

                    <Link 
                      href="/admin/products"
                      style={{
                        display: 'block',
                        padding: '12px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: '#333',
                        backgroundColor: '#f9f9f9',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      📦 상품관리
                    </Link>

                    <Link 
                      href="/admin/orders"
                      style={{
                        display: 'block',
                        padding: '12px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: '#333',
                        backgroundColor: '#f9f9f9',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      🛍️ 주문관리
                    </Link>

                    <Link 
                      href="/admin/payments"
                      style={{
                        display: 'block',
                        padding: '12px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: '#333',
                        backgroundColor: '#f9f9f9',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      💰 결제관리
                    </Link>

                    <Link 
                      href="/admin/users"
                      style={{
                        display: 'block',
                        padding: '12px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: '#333',
                        backgroundColor: '#f9f9f9',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      👥 사용자관리
                    </Link>

                    <Link 
                      href="/"
                      style={{
                        display: 'block',
                        padding: '12px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        color: '#333',
                        backgroundColor: '#f9f9f9',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}
                    >
                      🏠 홈페이지
                    </Link>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <Link
                    href="/admin"
                      style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                  >
                    관리자 페이지로 이동
                    </Link>
                  </div>
                </div>

                {/* 다른 사용자에게 관리자 권한 부여 */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '15px',
                    fontSize: '18px',
                    borderBottom: '1px solid #e0e0e0',
                    paddingBottom: '8px'
                  }}>
                    다른 사용자에게 관리자 권한 부여
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '5px',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                      관리자로 지정할 사용자의 이메일
                    </label>
                    <input
                      type="email"
                      value={otherUserEmail}
                      onChange={(e) => setOtherUserEmail(e.target.value)}
                      placeholder="예: dudals7334@naver.com"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={grantAdminToOtherUser}
                      disabled={grantLoading}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: grantLoading ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: grantLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {grantLoading ? '처리 중...' : '관리자 권한 부여'}
                    </button>
                  </div>
                </div>
              </>
              )}
            </>
          ) : (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              fontWeight: 'bold', 
              marginBottom: '15px',
              fontSize: '18px',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '8px'
            }}>
              로그인 필요
            </h3>
            
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              color: '#666'
            }}>
              <p style={{ marginBottom: '15px', fontSize: '16px' }}>먼저 로그인해주세요.</p>
              <Link 
                href="/login"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                로그인 페이지로 이동
              </Link>
            </div>
            </div>
          )}

      </div>
    </div>
  );
}
