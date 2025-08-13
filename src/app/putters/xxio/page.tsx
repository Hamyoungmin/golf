import ProductList from '@/components/ProductList';

const xxioPutters = [
  { id: 1, name: 'XXIO 13 퍼터 블레이드 타입', price: '가격문의', image: null },
  { id: 2, name: 'XXIO 13 퍼터 말렛 타입', price: '가격문의', image: null },
  { id: 3, name: 'XXIO 12 퍼터 블레이드 타입', price: '가격문의', image: null },
  { id: 4, name: 'XXIO 12 퍼터 말렛 타입', price: '가격문의', image: null },
  { id: 5, name: 'XXIO X 퍼터 블레이드 타입', price: '가격문의', image: null },
  { id: 6, name: 'XXIO X 퍼터 말렛 타입', price: '가격문의', image: null },
  { id: 7, name: 'XXIO 11 퍼터 블레이드 타입', price: '가격문의', image: null },
  { id: 8, name: 'XXIO 11 퍼터 말렛 타입', price: '가격문의', image: null },
  { id: 9, name: 'XXIO Prime 퍼터 블레이드 타입', price: '가격문의', image: null },
  { id: 10, name: 'XXIO Prime 퍼터 말렛 타입', price: '가격문의', image: null }
];

export default function XXIOPutters() {
  return (
    <ProductList 
      title="젝시오 퍼터"
      subtitle="| XXIO PUTTERS"
      products={xxioPutters}
      totalCount={xxioPutters.length}
      category="젝시오 퍼터"
    />
  );
}
