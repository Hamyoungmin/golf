import ProductList from '@/components/ProductList';

const titleistDrivers = [
  { id: 1, name: 'TSR4 8.25도 TSP110 60 X', price: '가격문의', image: null },
  { id: 2, name: 'TSR3 9도 TSP110 60 S', price: '가격문의', image: null },
  { id: 3, name: 'TSR2 10도 TSP111 50 SR', price: '가격문의', image: null },
  { id: 4, name: 'TSR1 10도 TSP322 45', price: '가격문의', image: null },
  { id: 5, name: 'TSi3 10 S ATTAS 6☆ 7', price: '가격문의', image: null },
  { id: 6, name: 'TSi2 10도 TSP322 55 SR', price: '가격문의', image: null },
  { id: 7, name: 'TS2 10.5 SR Tour AD 60', price: '가격문의', image: null },
  { id: 8, name: 'TS3 9.5도 TENSEI CK Pro Orange 70 X', price: '가격문의', image: null },
  { id: 9, name: '917D3 9.5도 Diamana D+ 70 S', price: '가격문의', image: null },
  { id: 10, name: '915D3 9.5도 Tour AD DI-7 S', price: '가격문의', image: null }
];

export default function TitleistDrivers() {
  return (
    <ProductList 
      title="타이틀리스트 드라이버"
      subtitle="| TITLEIST DRIVERS"
      products={titleistDrivers}
      totalCount={titleistDrivers.length}
      category="타이틀리스트 드라이버"
    />
  );
}
