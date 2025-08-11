'use client';

import { useState, useEffect } from 'react';

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 골프 관련 이미지들 (Unsplash에서 고품질 골프 이미지)
  const golfImages = [
    {
      url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: '아름다운 골프 코스에서의 완벽한 샷'
    },
    {
      url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: '프리미엄 골프 클럽 컬렉션'
    },
    {
      url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cec365d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: '정밀한 퍼팅을 위한 최고급 퍼터'
    },
    {
      url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: '전문가를 위한 골프 아이언 세트'
    },
    {
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: '완벽한 골프 라운드를 위한 모든 것'
    }
  ];

  // 자동 슬라이딩 (7초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % golfImages.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [golfImages.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + golfImages.length) % golfImages.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % golfImages.length);
  };

  return (
    <section className="image-slider">
      <div className="slider-container">
        <div className="slider-wrapper">
          {golfImages.map((image, index) => (
            <div key={index} className={`slide ${index === currentSlide ? 'active' : ''}`}>
              <img 
                src={image.url} 
                alt={image.title}
                className="slide-image"
              />
              <div className="slide-overlay">
                <h3 className="slide-title">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* 이전/다음 버튼 */}
        <button className="slider-button prev" onClick={goToPrevious}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button className="slider-button next" onClick={goToNext}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>

        {/* 인디케이터 점들 */}
        <div className="slider-indicators">
          {golfImages.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageSlider;
