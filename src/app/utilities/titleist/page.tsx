import ProductList from '@/components/ProductList';

const titleistUtilities = [
  { id: 1, name: 'TSi3 US U2 18 X TENSEI AV RAW WHITE HY 90', price: '가격문의', image: null },
  { id: 2, name: 'TSR2 U3 21도 TSP111 50 SR', price: '가격문의', image: null },
  { id: 3, name: 'TSR3 U3 21도 TSP110 60 S', price: '가격문의', image: null },
  { id: 4, name: 'TSi2 U3 21도 TSP322 55 SR', price: '가격문의', image: null },
  { id: 5, name: 'TS2 23 S N.S.PRO 950GH neo', price: '가격문의', image: null },
  { id: 6, name: 'TS3 U3 21도 TENSEI CK Pro Orange 70 S', price: '가격문의', image: null },
  { id: 7, name: '915H U3 21 S N.S.PRO 950GH UTILITY', price: '가격문의', image: null },
  { id: 8, name: '917H U3 21도 Diamana D+ 70 S', price: '가격문의', image: null },
  { id: 9, name: 'TSR1 U4 24도 TSP322 45 A', price: '가격문의', image: null },
  { id: 10, name: 'TSi1 U4 24도 TSP322 45 L', price: '가격문의', image: null }
];

export default function TitleistUtilities() {
  return (
    <ProductList 
      title="타이틀리스트 유틸리티"
      subtitle="| TITLEIST UTILITIES"
      products={titleistUtilities}
      totalCount={titleistUtilities.length}
      category="타이틀리스트 유틸리티"
    />
  );
}
