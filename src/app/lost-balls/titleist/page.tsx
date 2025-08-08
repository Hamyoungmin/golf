import ProductList from '@/components/ProductList';

const titleistProducts = [
  { id: 1, name: '타이틀리스트 Pro V1 로스트볼', price: '가격문의', image: null },
  { id: 2, name: '타이틀리스트 Pro V1x 로스트볼', price: '가격문의', image: null },
  { id: 3, name: '타이틀리스트 AVX 로스트볼', price: '가격문의', image: null },
  { id: 4, name: '타이틀리스트 Tour Speed 로스트볼', price: '가격문의', image: null },
  { id: 5, name: '타이틀리스트 NXT 로스트볼', price: '가격문의', image: null },
  { id: 6, name: '타이틀리스트 DT TruSoft 로스트볼', price: '가격문의', image: null },
  { id: 7, name: '타이틀리스트 Velocity 로스트볼', price: '가격문의', image: null },
  { id: 8, name: '타이틀리스트 TruFeel 로스트볼', price: '가격문의', image: null }
];

export default function TitleistLostBalls() {
  return (
    <ProductList 
      title="타이틀리스트"
      subtitle="| TITLEIST LOST BALLS"
      products={titleistProducts}
      totalCount={35}
      category="타이틀리스트 로스트볼"
    />
  );
}
