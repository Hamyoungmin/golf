'use client';

import { useState, useEffect, useRef } from 'react';

const NoticeButton = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // 팝업 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  return (
    <>
      <button 
        className="notice-button" 
        onClick={handleButtonClick}
        title="공지사항 보기"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        <div className="notice-badge">
          <span>NEW</span>
        </div>
      </button>

      {isPopupOpen && (
        <div className="notice-popup-overlay">
          <div className="notice-popup" ref={popupRef}>
            <div className="notice-popup-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                공지사항
              </h3>
              <button className="close-button" onClick={handleClosePopup}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="notice-popup-content">
              <div className="notice-item">
                <div className="notice-date">2024.08.11</div>
                <div className="notice-title">🎉 골프상회 도매몰 24시간 운영 시작!</div>
                <div className="notice-content">
                  이제 골프상회에서 24시간 연중무휴로 서비스를 제공합니다. 
                  언제든지 필요한 골프용품을 주문하실 수 있습니다.
                </div>
              </div>

              <div className="notice-item">
                <div className="notice-date">2024.08.10</div>
                <div className="notice-title">📋 사업자 인증 안내</div>
                <div className="notice-content">
                  상품 주문은 사업자 인증이 완료된 회원만 가능합니다. 
                  회원가입 시 사업자등록증과 매장 사진을 첨부해주세요.
                </div>
              </div>

              <div className="notice-item">
                <div className="notice-date">2024.08.09</div>
                <div className="notice-title">⚡ 실시간 재고 업데이트</div>
                <div className="notice-content">
                  모든 상품 재고가 실시간으로 업데이트됩니다. 
                  품절 상품은 자동으로 주문이 제한됩니다.
                </div>
              </div>

              <div className="notice-item">
                <div className="notice-date">2024.08.08</div>
                <div className="notice-title">🚚 배송 정책 안내</div>
                <div className="notice-content">
                  전국 무료배송 서비스를 제공하며, 주문 후 1-2일 내 발송됩니다. 
                  도서산간 지역은 추가 배송일이 소요될 수 있습니다.
                </div>
              </div>

              <div className="notice-item">
                <div className="notice-date">2024.08.07</div>
                <div className="notice-title">💰 도매가격 혜택</div>
                <div className="notice-content">
                  사업자 회원 대상으로 최대 30% 할인된 도매가격을 제공합니다. 
                  대량 주문 시 추가 할인 혜택이 있습니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoticeButton;
