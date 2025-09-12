/**
 * 상품 이미지 관련 유틸리티 함수들
 */

// 카테고리별 placeholder 이미지 매핑 (더 다양한 이미지)
const categoryPlaceholders: Record<string, string> = {
  // 드라이버
  'drivers': '/d1.jpg',
  'driver': '/d1.jpg',
  
  // 우드
  'woods': '/w.jpg',
  'wood': '/w.jpg',
  
  // 퍼터
  'putters': '/p1.jpg',
  'putter': '/p1.jpg',
  
  // 유틸리티
  'utilities': '/u1.jpg',
  'utility': '/u1.jpg',
  
  // 웨지
  'wedges': '/y1.jpg',
  'wedge': '/y1.jpg',
  
  // 여성용
  'womens': '/z1.jpg',
  'women': '/z1.jpg',
  
  // 왼손잡이용
  'left-handed': '/d1.jpg',
  'lefthanded': '/d1.jpg',
  
  // 키즈용
  'kids': '/z1.jpg',
  'kid': '/z1.jpg',
  
  // 아이언 (기본)
  'irons': '/placeholder.jpg',
  'iron': '/placeholder.jpg',
  
  // 기타
  'others': '/placeholder.jpg',
  'other': '/placeholder.jpg',
  'default': '/placeholder.jpg'
};

// 브랜드별 placeholder 이미지 매핑 (옵션)
const brandPlaceholders: Record<string, string> = {
  'titleist': '/titleist-logo.jpg',
  'callaway': '/callaway-logo.jpg',
  'taylormade': '/taylormade-logo.jpg',
  'bridgestone': '/bridgestone-logo.jpg',
  'xxio': '/xxio-logo.jpg'
};

/**
 * 경로에서 카테고리를 추출하는 함수
 * @param pagePath 페이지 경로 (예: "drivers/titleist", "putters/ping")
 * @returns 카테고리 이름
 */
export function getCategoryFromPath(pagePath: string): string {
  const parts = pagePath.split('/');
  return parts[0] || 'default';
}

/**
 * 상품에 적절한 이미지 URL을 반환하는 함수
 * @param product 상품 객체
 * @param pagePath 현재 페이지 경로 (카테고리 추출용)
 * @returns 이미지 URL
 */
export function getProductImageUrl(product: unknown, pagePath?: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prod = product as any;
  // 1. 실제 상품 이미지가 있으면 첫 번째 이미지 사용
  if (prod.images && prod.images.length > 0 && prod.images[0]) {
    return prod.images[0];
  }
  
  // 2. 페이지 경로에서 카테고리 추출
  if (pagePath) {
    const category = getCategoryFromPath(pagePath);
    const placeholder = categoryPlaceholders[category];
    if (placeholder) {
      return placeholder;
    }
  }
  
  // 3. 상품 카테고리에서 placeholder 선택
  if (product.category) {
    const placeholder = categoryPlaceholders[product.category.toLowerCase()];
    if (placeholder) {
      return placeholder;
    }
  }
  
  // 4. 브랜드별 placeholder (옵션)
  if (product.brand) {
    const brandPlaceholder = brandPlaceholders[product.brand.toLowerCase()];
    if (brandPlaceholder) {
      return brandPlaceholder;
    }
  }
  
  // 5. 기본 placeholder
  return categoryPlaceholders.default;
}

/**
 * ProductList에 전달할 상품 데이터 포맷팅 함수
 * @param products 원본 상품 배열
 * @param pagePath 현재 페이지 경로
 * @returns 포맷된 상품 배열
 */
export function formatProductsForList(products: unknown[], pagePath?: string) {
  return products.map(product => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prod = product as any;
    return {
      id: prod.id,
      name: prod.name,
      price: `₩${Number(prod.price).toLocaleString()}`,
      image: getProductImageUrl(product, pagePath)
    };
  });
}

/**
 * 카테고리별 다양한 placeholder 이미지 배열
 * 같은 카테고리 내에서도 다양성을 위해 사용
 */
const categoryVariations: Record<string, string[]> = {
  'drivers': ['/placeholder-driver.jpg', '/d1.jpg'],
  'woods': ['/placeholder-wood.jpg', '/w.jpg'],
  'putters': ['/placeholder-putter.jpg', '/p1.jpg'],
  'utilities': ['/placeholder-utility.jpg', '/u1.jpg'],
  'wedges': ['/placeholder-wedge.jpg', '/y1.jpg'],
  'womens': ['/placeholder-womens.jpg', '/z1.jpg']
};

/**
 * 상품 이름과 카테고리를 기반으로 다양한 placeholder를 제공하는 함수
 * @param category 카테고리
 * @param productId 상품 ID (다양성을 위한 시드)
 * @param productName 상품명 (추가 다양성)
 * @returns placeholder 이미지 URL
 */
export function getVariedPlaceholder(category: string, productId: string | number, productName?: string): string {
  const variations = categoryVariations[category.toLowerCase()];
  if (!variations || variations.length === 0) {
    return categoryPlaceholders[category.toLowerCase()] || categoryPlaceholders.default;
  }
  
  // 상품 ID와 이름을 기반으로 일관된 인덱스 선택
  const seed = productId.toString().length + (productName ? productName.length : 0);
  const index = Math.abs(seed) % variations.length;
  return variations[index];
}

/**
 * 관리자 페이지용 - 더 다양한 이미지를 보여주는 함수
 * @param product 상품 객체
 * @returns 이미지 URL
 */
export function getAdminProductImage(product: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prod = product as any;
  // 1. 실제 업로드된 이미지가 있으면 사용
  if (prod.images && prod.images.length > 0 && prod.images[0]) {
    return prod.images[0];
  }
  
  // 2. 브랜드별로 다른 이미지 사용
  const brandImages: Record<string, string> = {
    'titleist': '/titleist-logo.jpg',
    'callaway': '/callaway-logo.jpg', 
    'taylormade': '/taylormade-logo.jpg',
    'bridgestone': '/bridgestone-logo.jpg',
    'xxio': '/xxio-logo.jpg'
  };
  
  if (product.brand && brandImages[product.brand.toLowerCase()]) {
    return brandImages[product.brand.toLowerCase()];
  }
  
  // 3. 카테고리별 다양한 이미지 사용
  return getVariedPlaceholder(product.category || 'default', product.id, product.name);
}
