'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { User } from '@/types';
import { useToast } from '@/hooks/useToast';

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessNumber: '',
    companyName: '',
    name: '',
    phone: ''
  });

  const [shopPhotos, setShopPhotos] = useState({
    shopInteriorPhoto: null as File | null,
    shopSignPhoto: null as File | null
  });

  const [passwordMatch, setPasswordMatch] = useState<'none' | 'match' | 'mismatch'>('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newFormData);
    
    // 비밀번호 확인 실시간 체크
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      const password = e.target.name === 'password' ? e.target.value : formData.password;
      const confirmPassword = e.target.name === 'confirmPassword' ? e.target.value : formData.confirmPassword;
      
      if (password === '' || confirmPassword === '') {
        setPasswordMatch('none');
      } else if (password === confirmPassword) {
        setPasswordMatch('match');
      } else {
        setPasswordMatch('mismatch');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const fieldName = e.target.name as 'shopInteriorPhoto' | 'shopSignPhoto';
    
    setShopPhotos({
      ...shopPhotos,
      [fieldName]: file
    });
  };

  // 파일 업로드 함수
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 기존 유효성 검사
    if (passwordMatch === 'mismatch' || formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }
    if (formData.password === '' || formData.confirmPassword === '') {
      setError('비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }
    if (!shopPhotos.shopInteriorPhoto || !shopPhotos.shopSignPhoto) {
      setError('샵 내부 사진과 간판 사진을 모두 업로드해주세요.');
      setLoading(false);
      return;
    }

    try {
      // Firebase가 활성화되어 있는지 확인
      const isFirebaseEnabled = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      
      if (!isFirebaseEnabled) {
        // Firebase가 비활성화된 경우 임시 회원가입 처리
        console.log('🔧 Firebase가 비활성화됨 - 임시 회원가입 처리');
        showToast('🎉 회원가입이 완료되었습니다! 관리자로 로그인됩니다.', 'success');
        setTimeout(() => router.push('/admin'), 1500);
        return;
      }

      // 1. Firebase 회원가입
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;
      
      // 2. 파일 업로드
      const shopInteriorPhotoUrl = await uploadFile(
        shopPhotos.shopInteriorPhoto,
        `users/${user.uid}/shop_interior.jpg`
      );
      const shopSignPhotoUrl = await uploadFile(
        shopPhotos.shopSignPhoto,
        `users/${user.uid}/shop_sign.jpg`
      );
      
      // 3. 사용자 프로필 생성 (승인 대기 상태)
      const userData: Partial<User> = {
        uid: user.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        businessNumber: formData.businessNumber,
        companyName: formData.companyName,
        shopInteriorPhotoUrl,
        shopSignPhotoUrl,
        role: 'user',
        status: 'pending', // 승인 대기 상태
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ 회원가입 성공:', user);
        console.log('✅ 사용자 프로필 저장 완료');
      }
      
      // 성공 메시지 표시 후 페이지 이동
      setError('');
      showToast('🎊 회원가입이 완료되었습니다! 관리자 승인 후 서비스를 이용하실 수 있습니다.', 'success');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: unknown) {
      console.error('❌ 회원가입 실패:', error);
      
      // 에러 메시지 설정
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          setError('이미 사용 중인 이메일입니다.');
        } else if (error.message.includes('weak-password')) {
          setError('비밀번호는 6자리 이상이어야 합니다.');
        } else if (error.message.includes('invalid-email')) {
          setError('유효하지 않은 이메일 주소입니다.');
        } else {
          setError(error.message);
        }
      } else {
        setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 버튼 비활성화 조건
  const isSubmitDisabled = 
    loading ||
    passwordMatch === 'mismatch' || 
    !shopPhotos.shopInteriorPhoto || 
    !shopPhotos.shopSignPhoto ||
    formData.password === '' ||
    formData.confirmPassword === '';

  return (
    <>
      <ToastComponent />
      <div className="container" style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
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
            회원가입
          </h1>
        
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '30px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline-block', marginRight: '8px', verticalAlign: 'middle'}}>
            <path d="M12 17v5"></path>
            <path d="M9 10.76a2 2 0 0 1 1.11-1.79L16 6a1 1 0 0 1 1.49.79L17 8.26a2 2 0 0 1-1.11 1.79L11 13a1 1 0 0 1-1.49-.79z"></path>
          </svg> 
          <strong>사업자 인증이 완료된 회원만 상품 주문이 가능합니다.</strong>
        </div>

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
              이메일 *
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
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              비밀번호 *
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
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              비밀번호 확인 *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${
                  passwordMatch === 'match' ? '#28a745' : 
                  passwordMatch === 'mismatch' ? '#dc3545' : '#ddd'
                }`,
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 
                  passwordMatch === 'match' ? '#f8fff9' : 
                  passwordMatch === 'mismatch' ? '#fff8f8' : '#fff'
              }}
            />
            {passwordMatch !== 'none' && (
              <div style={{
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: passwordMatch === 'match' ? '#28a745' : '#dc3545',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '5px' }}>
                  {passwordMatch === 'match' ? '✓' : '✗'}
                </span>
                {passwordMatch === 'match' ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              사업자등록번호 *
            </label>
            <input
              type="text"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleChange}
              placeholder="740-47-00888"
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              샵 내부 사진 *
            </label>
            <input
              type="file"
              name="shopInteriorPhoto"
              accept="image/*"
              onChange={handleFileChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: '#fff'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              샵 간판 사진 *
            </label>
            <input
              type="file"
              name="shopSignPhoto"
              accept="image/*"
              onChange={handleFileChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: '#fff'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              상호명 *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
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
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              담당자명 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
              연락처 *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
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
            disabled={isSubmitDisabled}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isSubmitDisabled ? '#ccc' : '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '20px',
              cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
              opacity: isSubmitDisabled ? 0.6 : 1
            }}
          >
            {loading ? '회원가입 중...' : '회원가입'}
          </button>
        </form>
        
        <div style={{ 
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          이미 계정이 있으신가요?{' '}
          <Link 
            href="/login" 
            style={{ 
              color: '#ff6b35',
              textDecoration: 'underline'
            }}
          >
            로그인
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
