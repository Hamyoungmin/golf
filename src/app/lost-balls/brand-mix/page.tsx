import ProductList from '@/components/ProductList';

const brandMixProducts = [
  { id: 1, name: '브랜드 혼합 로스트볼 1', price: '가격문의', image: null },
  { id: 2, name: '브랜드 혼합 로스트볼 2', price: '가격문의', image: null },
  { id: 3, name: '브랜드 혼합 로스트볼 3', price: '가격문의', image: null },
  { id: 4, name: '브랜드 혼합 로스트볼 4', price: '가격문의', image: null },
  { id: 5, name: '브랜드 혼합 로스트볼 5', price: '가격문의', image: null },
  { id: 6, name: '브랜드 혼합 로스트볼 6', price: '가격문의', image: null },
  { id: 7, name: '브랜드 혼합 로스트볼 7', price: '가격문의', image: null },
  { id: 8, name: '브랜드 혼합 로스트볼 8', price: '가격문의', image: null },
  { id: 9, name: '브랜드 혼합 로스트볼 9', price: '가격문의', image: null },
  { id: 10, name: '브랜드 혼합 로스트볼 10', price: '가격문의', image: null }
];

export default function BrandMixLostBalls() {
  return (
    <ProductList 
      title="브랜드 혼합"
      subtitle="| BRAND MIX LOST BALLS"
      products={brandMixProducts}
      totalCount={50}
      category="브랜드 혼합 로스트볼"
    />
  );
}
