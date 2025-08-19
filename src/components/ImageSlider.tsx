'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 골프 브랜드 로고 이미지들
  const golfImages = [
    {
      url: '/taylormade-logo.jpg',
      title: 'Callaway Golf - 혁신과 성능의 만남'
    },
    {
      url: '/callaway-logo.jpg',
      title: 'TaylorMade - Speed. Distance. Performance.'
    },
    {
      url: '/bridgestone-logo.jpg',
      title: 'Bridgestone Golf - 정밀한 볼의 기술력'
    },
    {
      url: '/xxio-logo.jpg',
      title: 'XXIO - Experience the Difference'
    },
    {
      url: '/titleist-logo.jpg',
      title: 'Titleist - The #1 Ball in Golf'
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
              <Image 
                src={image.url} 
                alt={image.title}
                fill
                style={{
                  objectFit: 'cover',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}
                priority={index === 0}
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
