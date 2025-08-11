import ProductList from '@/components/ProductList';

const titleistWoods = [
  { id: 1, name: 'TSR2 15도 TSP111 50 SR', price: '가격문의', image: null },
  { id: 2, name: 'TSR3 15도 TSP110 60 S', price: '가격문의', image: null },
  { id: 3, name: 'TSi2 15도 TSP322 55 SR', price: '가격문의', image: null },
  { id: 4, name: 'TSi3 15도 TENSEI CK Pro Orange 70 S', price: '가격문의', image: null },
  { id: 5, name: 'TS2 15도 Tour AD 60 SR', price: '가격문의', image: null },
  { id: 6, name: 'TS3 15도 TENSEI CK Pro Orange 70 S', price: '가격문의', image: null },
  { id: 7, name: '917F2 15도 Diamana D+ 70 S', price: '가격문의', image: null },
  { id: 8, name: '915F 15도 Tour AD DI-7 S', price: '가격문의', image: null },
  { id: 9, name: 'TSR1 18도 TSP322 45 A', price: '가격문의', image: null },
  { id: 10, name: 'TSi1 18도 TSP322 45 L', price: '가격문의', image: null }
];

export default function TitleistWoods() {
  return (
    <ProductList 
      title="타이틀리스트 우드"
      subtitle="| TITLEIST WOODS"
      products={titleistWoods}
      totalCount={titleistWoods.length}
      category="타이틀리스트 우드"
    />
  );
}
