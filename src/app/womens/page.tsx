import ProductList from '@/components/ProductList';

const womensProducts = [
  { id: 1, name: 'XXIO 12 Ladies 드라이버', price: '가격문의', image: null },
  { id: 2, name: 'Callaway REVA Ladies 세트', price: '가격문의', image: null },
  { id: 3, name: 'TaylorMade KALEA Ladies 아이언', price: '가격문의', image: null },
  { id: 4, name: 'PING G Le3 Ladies 퍼터', price: '가격문의', image: null },
  { id: 5, name: 'Cobra F-MAX Airspeed Ladies', price: '가격문의', image: null },
  { id: 6, name: 'Mizuno JPX Ladies 세트', price: '가격문의', image: null },
  { id: 7, name: 'Wilson Staff Ladies 드라이버', price: '가격문의', image: null },
  { id: 8, name: 'Honma BEZEAL Ladies 아이언', price: '가격문의', image: null },
  { id: 9, name: 'Titleist TSi1 Ladies 드라이버', price: '가격문의', image: null },
  { id: 10, name: 'Srixon Z-FORGED Ladies 웨지', price: '가격문의', image: null }
];

export default function Womens() {
  return (
    <ProductList 
      title="여성용"
      subtitle="| Ladies"
      products={womensProducts}
      totalCount={28}
      category="여성용"
    />
  );
}
