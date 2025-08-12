'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, updateUserProfile } from '@/lib/users';
import { User as UserType, Address } from '@/types';

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
    zipCode: '',
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
            businessNumber: '',
            companyName: '',
          });
          
          if (data.address) {
            setAddressData(data.address);
          }
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
        address: addressData,
      };

      await updateUserProfile(user.uid, updateData);
      alert('회원정보가 성공적으로 수정되었습니다.');
      
      // 데이터 다시 로드
      const updatedData = await getUserData(user.uid);
      setUserData(updatedData);
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
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">회원정보 수정</h1>
          <p className="text-gray-600 mt-2">개인정보를 안전하게 관리하세요.</p>
        </div>
        <Link 
          href="/mypage"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← 마이페이지
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="이름을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="010-0000-0000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록번호 *
                </label>
                <input
                  type="text"
                  value={formData.businessNumber}
                  onChange={(e) => handleFormChange('businessNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="000-00-00000"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상호명 *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleFormChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="상호명을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 주소 정보 */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">주소 정보</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우편번호
                  </label>
                  <input
                    type="text"
                    value={addressData.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="우편번호"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시/도
                  </label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="시/도"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시/군/구
                </label>
                <input
                  type="text"
                  value={addressData.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="시/군/구"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세주소
                </label>
                <input
                  type="text"
                  value={addressData.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="상세주소"
                />
              </div>
            </div>
          </div>

          {/* 비밀번호 변경 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">비밀번호 변경</h3>
            <p className="text-blue-700 mb-4">
              보안을 위해 비밀번호 변경은 별도 인증 과정을 거쳐야 합니다.
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                alert('비밀번호 변경 기능은 추후 제공될 예정입니다.');
              }}
            >
              비밀번호 변경
            </button>
          </div>

          {/* 회원 탈퇴 안내 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">회원 탈퇴</h3>
            <p className="text-red-700 mb-4">
              회원 탈퇴 시 모든 개인정보와 주문 내역이 삭제되며, 복구할 수 없습니다.
            </p>
            <button
              type="button"
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              onClick={() => {
                if (confirm('정말로 회원 탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                  alert('회원 탈퇴 기능은 고객센터로 문의해주세요.');
                }
              }}
            >
              회원 탈퇴
            </button>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/mypage"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
