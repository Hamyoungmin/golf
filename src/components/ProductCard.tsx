'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number | string;
  name: string;
  price: string;
  image: string | null;
}

interface ProductCardProps {
  product: Product;
  category?: string;
}

const ProductCard = ({ product, category }: ProductCardProps) => {
  // 카테고리별 URL 매핑
  const getCategoryPath = (category?: string) => {
    if (!category) return 'products';
    
    const categoryLower = category.toLowerCase();
    
    // 브랜드별 카테고리 패턴 처리 (브랜드명 카테고리명 → 카테고리명/브랜드명)
    const brandMapping: { [key: string]: string } = {
      'callaway': 'callaway',
      '캘러웨이': 'callaway',
      'titleist': 'titleist', 
      '타이틀리스트': 'titleist',
      'taylormade': 'taylormade',
      '테일러메이드': 'taylormade',
      'bridgestone': 'bridgestone',
      '브리지스톤': 'bridgestone',
      'honma': 'honma',
      '혼마': 'honma',
      'xxio': 'xxio'
    };
    
    // 브랜드별 카테고리 확인 (예: "캘러웨이 드라이버" → "drivers/callaway")
    for (const [brandKr, brandEn] of Object.entries(brandMapping)) {
      if (categoryLower.includes(brandKr)) {
        if (categoryLower.includes('드라이버') || categoryLower.includes('driver')) {
          return `drivers/${brandEn}`;
        } else if (categoryLower.includes('우드') || categoryLower.includes('wood')) {
          return `woods/${brandEn}`;
        } else if (categoryLower.includes('아이언') || categoryLower.includes('iron')) {
          return `irons/${brandEn}`;
        } else if (categoryLower.includes('웨지') || categoryLower.includes('wedge')) {
          return `wedges/${brandEn}`;
        } else if (categoryLower.includes('퍼터') || categoryLower.includes('putter')) {
          return `putters/${brandEn}`;
        } else if (categoryLower.includes('유틸리티') || categoryLower.includes('utility')) {
          return `utilities/${brandEn}`;
        } else if (categoryLower.includes('여성용') || categoryLower.includes('women')) {
          return `womens/${brandEn}`;
        } else if (categoryLower.includes('왼손용') || categoryLower.includes('left')) {
          return `left-handed/${brandEn}`;
        }
      }
    }
    
    // 일반 카테고리 처리
    switch (categoryLower) {
      case '드라이버':
      case 'drivers':
        return 'drivers';
      case '우드':
      case 'woods':
        return 'woods';
      case '아이언':
      case 'irons':
        return 'irons';
      case '웨지':
      case 'wedges':
        return 'wedges';
      case '퍼터':
      case 'putters':
        return 'putters';
      case '유틸리티':
      case 'utilities':
        return 'utilities';
      case '여성용':
      case 'womens':
        return 'womens';
      case '키즈':
      case 'kids':
        return 'kids';
      case '왼손용':
      case '좌타용':
      case 'left-handed':
        return 'left-handed';
      default:
        return 'products';
    }
  };

  const categoryPath = getCategoryPath(category);
  return (
    <div className="product-card" style={{ position: 'relative', cursor: 'pointer' }}>
      <Link href={`/${categoryPath}/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-image">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              width={250}
              height={200}
              style={{objectFit: 'cover'}}
            />
          ) : (
            <span>이미지 없음</span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-price">{product.price}</p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginTop: '10px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              0
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              0
            </span>
          </div>
        </div>
      </Link>

    </div>
  );
};

export default ProductCard;