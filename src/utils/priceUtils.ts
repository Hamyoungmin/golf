/**
 * 가격 관련 유틸리티 함수들
 */

/**
 * 안전하게 가격을 포맷팅하는 함수
 * @param price 가격 (string | number)
 * @returns 포맷된 가격 문자열 (예: "₩1,234,567")
 */
export function formatPrice(price: string | number | null | undefined): string {
  // null, undefined, 빈 문자열 처리
  if (price === null || price === undefined || price === '') {
    return '₩0';
  }

  // 문자열인 경우 숫자로 변환
  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
  
  // 변환 실패 시 0으로 처리
  if (isNaN(numericPrice) || numericPrice < 0) {
    console.warn('유효하지 않은 가격 값:', price, '-> 0원으로 처리');
    return '₩0';
  }

  // 정상적인 경우 포맷팅
  return `₩${Math.floor(numericPrice).toLocaleString()}`;
}

/**
 * 가격 문자열을 숫자로 안전하게 변환
 * @param price 가격 문자열
 * @returns 숫자 가격 (변환 실패 시 0)
 */
export function parsePrice(price: string | number | null | undefined): number {
  if (price === null || price === undefined || price === '') {
    return 0;
  }

  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
  
  if (isNaN(numericPrice) || numericPrice < 0) {
    return 0;
  }

  return Math.floor(numericPrice);
}

/**
 * 가격 입력값 검증
 * @param priceInput 사용자 입력 가격
 * @returns 검증 결과와 메시지
 */
export function validatePrice(priceInput: string): { isValid: boolean; message?: string; value?: number } {
  if (!priceInput || priceInput.trim() === '') {
    return { isValid: false, message: '가격을 입력해주세요.' };
  }

  // 숫자가 아닌 문자 제거 후 검증
  const cleanPrice = priceInput.replace(/[^\d.-]/g, '');
  const numericPrice = parseFloat(cleanPrice);

  if (isNaN(numericPrice)) {
    return { isValid: false, message: '올바른 숫자를 입력해주세요.' };
  }

  if (numericPrice < 0) {
    return { isValid: false, message: '가격은 0원 이상이어야 합니다.' };
  }

  if (numericPrice > 99999999) {
    return { isValid: false, message: '가격이 너무 큽니다. (최대: 99,999,999원)' };
  }

  return { isValid: true, value: Math.floor(numericPrice) };
}

/**
 * ProductList 컴포넌트용 상품 데이터 포맷팅
 * @param products 원본 상품 배열
 * @param imagePath 이미지 경로 (optional)
 * @returns 포맷된 상품 배열
 */
export function formatProductsForDisplay(products: unknown[], imagePath?: string) {
  return products.map(product => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prod = product as any;
    return {
      id: prod.id,
      name: prod.name || '상품명 없음',
      price: formatPrice(prod.price),
      image: prod.images?.[0] || (imagePath ? imagePath : '/placeholder.jpg')
    };
  });
}

/**
 * 콤마가 포함된 가격 문자열을 숫자로 변환 (입력 필드용)
 * @param formattedPrice 포맷된 가격 문자열 (예: "1,234,567")
 * @returns 숫자
 */
export function unformatPrice(formattedPrice: string): string {
  return formattedPrice.replace(/[^\d]/g, '');
}

/**
 * 실시간 가격 입력 포맷팅 (천단위 콤마)
 * @param value 입력 값
 * @returns 포맷된 문자열
 */
export function formatPriceInput(value: string): string {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');
  
  if (numbers === '') return '';
  
  // 천단위 콤마 추가
  return Number(numbers).toLocaleString();
}
