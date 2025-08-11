'use client';

import { useState, useEffect, useRef } from 'react';

const PhoneCall = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const phoneNumber = '010-7236-8400';
  const contactName = '권혁규';

  const handleButtonClick = () => {
    setIsPopupOpen(true);
  };

  const handleCallClick = () => {
    window.location.href = `tel:${phoneNumber}`;
    setIsPopupOpen(false);
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
        className="phone-call" 
        onClick={handleButtonClick}
        title="연락처 보기"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.95 21q-3.125 0-6.175-1.362-3.05-1.363-5.425-3.738-2.375-2.375-3.737-5.425Q3.25 7.425 3.25 4.3q0-.45.3-.75t.75-.3H8.1q.35 0 .625.225t.325.575l.65 3.5q.05.35-.012.637-.063.288-.288.513L7.15 10.9q1.05 1.8 2.638 3.387Q11.375 15.875 13.1 16.85l2.3-2.25q.225-.225.525-.287.3-.063.575-.013l3.5.65q.35.1.575.363.225.262.225.637v3.8q0 .45-.3.75t-.75.3Z"/>
        </svg>
      </button>

      {isPopupOpen && (
        <div className="phone-popup-overlay">
          <div className="phone-popup" ref={popupRef}>
            <div className="phone-popup-header">
              <h3>연락처</h3>
              <button className="close-button" onClick={handleClosePopup}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="phone-popup-content">
              <div className="contact-info">
                <div className="contact-name">{contactName}</div>
                <div className="contact-number">{phoneNumber}</div>
              </div>
              
              <div className="popup-buttons">
                <button className="call-button" onClick={handleCallClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.95 21q-3.125 0-6.175-1.362-3.05-1.363-5.425-3.738-2.375-2.375-3.737-5.425Q3.25 7.425 3.25 4.3q0-.45.3-.75t.75-.3H8.1q.35 0 .625.225t.325.575l.65 3.5q.05.35-.012.637-.063.288-.288.513L7.15 10.9q1.05 1.8 2.638 3.387Q11.375 15.875 13.1 16.85l2.3-2.25q.225-.225.525-.287.3-.063.575-.013l3.5.65q.35.1.575.363.225.262.225.637v3.8q0 .45-.3.75t-.75.3Z"/>
                  </svg>
                  전화걸기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhoneCall;
