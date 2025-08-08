import ProductList from '@/components/ProductList';

const lostBallProducts = [
  { id: 1, name: 'Titleist Pro V1 혼합 A급', price: '가격문의', image: null },
  { id: 2, name: 'Callaway Chrome Soft 혼합 A급', price: '가격문의', image: null },
  { id: 3, name: 'TaylorMade TP5 혼합 A급', price: '가격문의', image: null },
  { id: 4, name: 'Bridgestone Tour B 혼합 A급', price: '가격문의', image: null },
  { id: 5, name: 'Srixon Z-STAR 혼합 A급', price: '가격문의', image: null },
  { id: 6, name: '브랜드 혼합 A급 (50개)', price: '가격문의', image: null },
  { id: 7, name: '브랜드 혼합 B급 (100개)', price: '가격문의', image: null },
  { id: 8, name: 'Titleist Pro V1x 혼합 A급', price: '가격문의', image: null },
  { id: 9, name: 'Callaway ERC Soft 혼합 A급', price: '가격문의', image: null },
  { id: 10, name: 'TaylorMade TP5x 혼합 A급', price: '가격문의', image: null }
];

export default function LostBalls() {
  return (
    <ProductList 
      title="로스트볼"
      subtitle="| Lost Balls"
      products={lostBallProducts}
      totalCount={32}
      category="로스트볼"
    />
  );
}
