'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    message: '',
    agreePrivacy: false
  });
  
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: '', label: '문의 유형을 선택하세요' },
    { value: 'product', label: '상품 문의' },
    { value: 'order', label: '주문/결제 문의' },
    { value: 'delivery', label: '배송 문의' },
    { value: 'return', label: '반품/교환 문의' },
    { value: 'membership', label: '회원 관련 문의' },
    { value: 'technical', label: '기술적 문제' },
    { value: 'partnership', label: '제휴 문의' },
    { value: 'other', label: '기타' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return false;
    }
    
    if (!formData.email.trim()) {
      alert('이메일을 입력해주세요.');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      alert('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    
    if (!formData.category) {
      alert('문의 유형을 선택해주세요.');
      return false;
    }
    
    if (!formData.subject.trim()) {
      alert('제목을 입력해주세요.');
      return false;
    }
    
    if (!formData.message.trim()) {
      alert('문의 내용을 입력해주세요.');
      return false;
    }
    
    if (!formData.agreePrivacy) {
      alert('개인정보 수집 및 이용에 동의해주세요.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // 실제로는 API로 문의사항을 전송해야 함
      await new Promise(resolve => setTimeout(resolve, 2000)); // 임시 딜레이
      
      alert('문의사항이 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.');
      
      // 폼 초기화
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        subject: '',
        message: '',
        agreePrivacy: false
      });
    } catch (error) {
      console.error('문의 전송 오류:', error);
      alert('문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">문의하기</h1>
        <p className="text-gray-600">궁금한 사항이나 문의사항을 남겨주시면 빠르게 답변드리겠습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 연락처 정보 */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-6">연락처 정보</h2>
            
            <div className="space-y-6">
              {/* 전화 */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">전화 문의</h3>
                  <p className="text-gray-600 text-sm mb-2">24시간 연중무휴</p>
                  <p className="font-medium">010-7236-8400</p>
                </div>
              </div>

              {/* 이메일 */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">이메일 문의</h3>
                  <p className="text-gray-600 text-sm mb-2">24시간 접수 가능</p>
                  <p className="font-medium">crover.kk@gmail.com</p>
                </div>
              </div>

              {/* 주소 */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">오시는 길</h3>
                  <p className="text-gray-600 text-sm">
                    경기도 수원시 권선구 세지로28번길 15-30 104호<br />
                    골프상회
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 링크 */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold mb-3">자주 묻는 질문</h3>
              <p className="text-sm text-gray-600 mb-4">
                문의하시기 전에 FAQ를 확인해보세요.
              </p>
              <Link
                href="/faq"
                className="block w-full px-4 py-2 bg-gray-100 text-center rounded-lg hover:bg-gray-200 transition-colors"
              >
                FAQ 보기
              </Link>
            </div>
          </div>
        </div>

        {/* 문의 폼 */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이메일을 입력하세요"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="010-0000-0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문의 유형 *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="문의 제목을 입력하세요"
                />
              </div>

              {/* 문의 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  문의 내용 *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="문의하실 내용을 자세히 입력해주세요.&#10;&#10;• 상품 문의 시 상품명을 정확히 기재해주세요&#10;• 주문 문의 시 주문번호를 함께 기재해주세요&#10;• 첨부 파일이 필요한 경우 이메일로 별도 발송해주세요"
                />
              </div>

              {/* 개인정보 동의 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onChange={handleInputChange}
                    className="mt-1 mr-3"
                  />
                  <div className="text-sm">
                    <span className="font-medium">개인정보 수집 및 이용에 동의합니다. (필수)</span>
                    <div className="text-gray-600 mt-2">
                      <p className="mb-1">• 수집항목: 이름, 이메일, 연락처, 문의내용</p>
                      <p className="mb-1">• 수집목적: 문의사항 처리 및 답변</p>
                      <p className="mb-1">• 보유기간: 문의 처리 완료 후 1년</p>
                      <p>개인정보 처리에 동의하지 않을 권리가 있으며, 동의 거부 시 문의 접수가 제한될 수 있습니다.</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? '전송 중...' : '문의하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 추가 안내 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">문의 답변 안내</h3>
        <div className="text-blue-700 space-y-2">
          <p>• 접수된 문의는 영업일 기준 1-2일 내에 답변드립니다.</p>
          <p>• 주말 및 공휴일에는 답변이 지연될 수 있습니다.</p>
          <p>• 급한 문의사항은 전화로 연락해주시기 바랍니다.</p>
          <p>• 답변은 등록하신 이메일로 발송됩니다.</p>
        </div>
      </div>
    </div>
  );
}
