import ProductList from '@/components/ProductList';

const callawayProducts = [
  { id: 1, name: '캘러웨이 Chrome Soft 로스트볼', price: '가격문의', image: null },
  { id: 2, name: '캘러웨이 Chrome Soft X 로스트볼', price: '가격문의', image: null },
  { id: 3, name: '캘러웨이 ERC Soft 로스트볼', price: '가격문의', image: null },
  { id: 4, name: '캘러웨이 Supersoft 로스트볼', price: '가격문의', image: null },
  { id: 5, name: '캘러웨이 Warbird 로스트볼', price: '가격문의', image: null },
  { id: 6, name: '캘러웨이 HEX Diablo 로스트볼', price: '가격문의', image: null },
  { id: 7, name: '캘러웨이 Tour i(z) 로스트볼', price: '가격문의', image: null },
  { id: 8, name: '캘러웨이 Big Bertha 로스트볼', price: '가격문의', image: null }
];

export default function CallawayLostBalls() {
  return (
    <ProductList 
      title="캘러웨이"
      subtitle="| CALLAWAY LOST BALLS"
      products={callawayProducts}
      totalCount={28}
      category="캘러웨이 로스트볼"
    />
  );
}
