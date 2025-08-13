import ProductList from '@/components/ProductList';

const xxioUtilities = [
  { id: 1, name: 'XXIO 13 유틸리티 3U 19도 S', price: '가격문의', image: null },
  { id: 2, name: 'XXIO 13 유틸리티 4U 22도 R', price: '가격문의', image: null },
  { id: 3, name: 'XXIO 12 유틸리티 3U 19도 R', price: '가격문의', image: null },
  { id: 4, name: 'XXIO 12 유틸리티 5U 25도 SR', price: '가격문의', image: null },
  { id: 5, name: 'XXIO X 유틸리티 3U 19도 S', price: '가격문의', image: null },
  { id: 6, name: 'XXIO X 유틸리티 4U 22도 R', price: '가격문의', image: null },
  { id: 7, name: 'XXIO 11 유틸리티 3U 19도 R', price: '가격문의', image: null },
  { id: 8, name: 'XXIO 11 유틸리티 4U 22도 S', price: '가격문의', image: null },
  { id: 9, name: 'XXIO Prime 유틸리티 3U 19도 R', price: '가격문의', image: null },
  { id: 10, name: 'XXIO Prime 유틸리티 4U 22도 S', price: '가격문의', image: null }
];

export default function XXIOUtilities() {
  return (
    <ProductList 
      title="젝시오 유틸리티"
      subtitle="| XXIO UTILITIES"
      products={xxioUtilities}
      totalCount={xxioUtilities.length}
      category="젝시오 유틸리티"
    />
  );
}
