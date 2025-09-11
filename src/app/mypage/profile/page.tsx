'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, updateUserProfile } from '@/lib/users';
import { User as UserType, Address } from '@/types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    businessNumber: '',
    companyName: '',
  });

  const [addressData, setAddressData] = useState<Address>({
    street: '',
    city: '',
    state: '',
  });

  const [shopPhotos, setShopPhotos] = useState({
    shopInteriorPhoto: null as File | null,
    shopSignPhoto: null as File | null
  });

  const [currentPhotoUrls, setCurrentPhotoUrls] = useState({
    shopInteriorPhotoUrl: '',
    shopSignPhotoUrl: ''
  });

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  // 사용자 정보 로드
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await getUserData(user.uid);
        
        if (data) {
          setUserData(data);
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            businessNumber: data.businessNumber || '',
            companyName: data.companyName || '',
          });
          
          if (data.address) {
            setAddressData(data.address);
          }
          
          setCurrentPhotoUrls({
            shopInteriorPhotoUrl: data.shopInteriorPhotoUrl || '',
            shopSignPhotoUrl: data.shopSignPhotoUrl || ''
          });
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const fieldName = e.target.name as 'shopInteriorPhoto' | 'shopSignPhoto';
    
    setShopPhotos(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  // 파일 업로드 함수
  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return false;
    }
    
    if (!formData.phone.trim()) {
      alert('연락처를 입력해주세요.');
      return false;
    }
    
    if (!formData.businessNumber.trim()) {
      alert('사업자등록번호를 입력해주세요.');
      return false;
    }
    
    if (!formData.companyName.trim()) {
      alert('상호명을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) return;

    setSaving(true);

    try {
      const updateData: Partial<UserType> = {
        name: formData.name,
        phone: formData.phone,
        businessNumber: formData.businessNumber,
        companyName: formData.companyName,
        address: addressData,
        updatedAt: new Date(),
      };

      // 새로 업로드할 사진이 있는 경우 업로드
      if (shopPhotos.shopInteriorPhoto) {
        const shopInteriorPhotoUrl = await uploadFile(
          shopPhotos.shopInteriorPhoto,
          `users/${user.uid}/shop_interior_updated.jpg`
        );
        updateData.shopInteriorPhotoUrl = shopInteriorPhotoUrl;
      }

      if (shopPhotos.shopSignPhoto) {
        const shopSignPhotoUrl = await uploadFile(
          shopPhotos.shopSignPhoto,
          `users/${user.uid}/shop_sign_updated.jpg`
        );
        updateData.shopSignPhotoUrl = shopSignPhotoUrl;
      }

      await updateUserProfile(user.uid, updateData);
      alert('회원정보가 성공적으로 수정되었습니다.');
      
      // 저장 완료 후 마이페이지로 이동
      router.push('/mypage');
    } catch (error) {
      console.error('회원정보 수정 오류:', error);
      alert('회원정보 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">회원정보를 불러오는 중...</div>
      </div>
    );
  }

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
          회원정보 수정
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
          <strong>개인정보를 안전하게 관리하세요.</strong>
        </div>
        
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
              value={user?.email || ''}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: '#f5f5f5',
                color: '#666'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              * 이메일은 변경할 수 없습니다.
            </p>
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
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
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
              연락처 *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
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
              value={formData.businessNumber}
              onChange={(e) => handleFormChange('businessNumber', e.target.value)}
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
              상호명 *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleFormChange('companyName', e.target.value)}
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

          {/* 주소 정보 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              기본주소
            </label>
            <input
              type="text"
              value={addressData.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              placeholder="시/도"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                marginBottom: '8px'
              }}
            />
            <input
              type="text"
              value={addressData.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="시/군/구"
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
              나머지 주소(선택 입력 가능)
            </label>
            <input
              type="text"
              value={addressData.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          {/* 샵 내부 사진 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              샵 내부 사진
            </label>
            {currentPhotoUrls.shopInteriorPhotoUrl && (
              <div style={{ marginBottom: '10px' }}>
                <img 
                  src={currentPhotoUrls.shopInteriorPhotoUrl} 
                  alt="현재 샵 내부 사진" 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'cover', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }} 
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  현재 등록된 사진
                </p>
              </div>
            )}
            <input
              type="file"
              name="shopInteriorPhoto"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: '#fff'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              * 새 사진을 선택하면 기존 사진이 교체됩니다.
            </p>
          </div>

          {/* 샵 간판 사진 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              샵 간판 사진
            </label>
            {currentPhotoUrls.shopSignPhotoUrl && (
              <div style={{ marginBottom: '10px' }}>
                <img 
                  src={currentPhotoUrls.shopSignPhotoUrl} 
                  alt="현재 샵 간판 사진" 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'cover', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }} 
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  현재 등록된 사진
                </p>
              </div>
            )}
            <input
              type="file"
              name="shopSignPhoto"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: '#fff'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              * 새 사진을 선택하면 기존 사진이 교체됩니다.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: saving ? '#ccc' : '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '20px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? '저장 중...' : '정보 저장'}
          </button>
        </form>

      </div>
    </div>
  );
}
