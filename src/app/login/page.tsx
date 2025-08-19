'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { userData } = useAuth();
  const { showToast, ToastComponent } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Firebase가 활성화되어 있는지 확인
      const isFirebaseEnabled = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      
      if (!isFirebaseEnabled) {
        // Firebase가 비활성화된 경우 특정 이메일만 관리자 로그인 허용
        const adminEmails = ['dudals7334@naver.com'];
        
        if (adminEmails.includes(formData.email)) {
          console.log('🔧 Firebase가 비활성화됨 - 관리자 임시 로그인 처리');
          // localStorage에 임시 관리자 이메일 저장
          localStorage.setItem('tempAdminEmail', formData.email);
          showToast('🎉 관리자로 로그인되었습니다!', 'success');
          setTimeout(() => router.push('/admin'), 1000);
          return;
        } else {
          setError('관리자 권한이 없는 이메일입니다.');
          return;
        }
      }

      // Firebase 로그인
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ 로그인 성공:', userCredential.user);
      }
      
      // AuthContext에서 사용자 데이터를 가져올 때까지 잠시 대기
      setTimeout(() => {
        // 로그인 성공 - 페이지 이동은 AuthContext에서 처리될 예정
        showToast('✨ 로그인에 성공했습니다!', 'success');
        setTimeout(() => router.push('/'), 1000); // 메인 페이지로 이동
      }, 1000);
      
    } catch (error: unknown) {
      console.error('❌ 로그인 실패:', error);
      console.log('🔍 에러 상세 정보:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as {code?: string})?.code || 'Unknown code',
        stack: (error as {stack?: string})?.stack || 'No stack trace'
      });
      
      // 에러 메시지 설정
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          setError('등록되지 않은 이메일입니다.');
        } else if (error.message.includes('wrong-password') || error.message.includes('invalid-credential')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (error.message.includes('invalid-email')) {
          setError('유효하지 않은 이메일 주소입니다.');
        } else if (error.message.includes('too-many-requests')) {
          setError('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.message.includes('network-request-failed')) {
          setError('네트워크 오류입니다. 인터넷 연결을 확인해주세요.');
        } else {
          setError(`로그인 실패: ${error.message}`);
        }
      } else {
        setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastComponent />
      <div className="container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <div style={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '40px',
          backgroundColor: '#fff'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            로그인
          </h1>
        
        {error && (
          <div style={{
            backgroundColor: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#e53e3e'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div style={{ 
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          계정이 없으신가요?{' '}
          <Link 
            href="/register" 
            style={{ 
              color: '#ff6b35',
              textDecoration: 'underline'
            }}
          >
            회원가입
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
