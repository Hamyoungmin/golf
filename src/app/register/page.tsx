'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';

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
      // Firebase 회원가입
      const user = await signUp(formData.email, formData.password);
      console.log('회원가입 성공:', user);
      console.log('추가 정보:', {
        businessNumber: formData.businessNumber,
        companyName: formData.companyName,
        name: formData.name,
        phone: formData.phone,
        shopPhotos: {
          shopInteriorPhoto: shopPhotos.shopInteriorPhoto?.name,
          shopSignPhoto: shopPhotos.shopSignPhoto?.name
        }
      });
      
      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      router.push('/login');
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      setError(error.message);
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
              placeholder="000-00-00000"
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
  );
}
