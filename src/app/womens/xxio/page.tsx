import ProductList from '@/components/ProductList';

const xxioWomens = [
  { id: 1, name: '젝시오 MP1200 11.5도', price: '550,000원', image: '/y1.jpg' },
  { id: 2, name: 'XXIO 13 여성용 드라이버 12.5도 L', price: '가격문의', image: null },
  { id: 3, name: 'XXIO 13 여성용 페어웨이우드 5W 18도 L', price: '가격문의', image: null },
  { id: 4, name: 'XXIO 12 여성용 드라이버 12.5도 A', price: '가격문의', image: null },
  { id: 5, name: 'XXIO 12 여성용 유틸리티 4U 22도 L', price: '가격문의', image: null },
  { id: 6, name: 'XXIO X 여성용 드라이버 12.5도 L', price: '가격문의', image: null },
  { id: 7, name: 'XXIO X 여성용 페어웨이우드 7W 21도 A', price: '가격문의', image: null },
  { id: 8, name: 'XXIO 11 여성용 드라이버 12.5도 L', price: '가격문의', image: null },
  { id: 9, name: 'XXIO 11 여성용 웨지 AW 52도 L', price: '가격문의', image: null },
  { id: 10, name: 'XXIO Prime 여성용 드라이버 12.5도 L', price: '가격문의', image: null },
  { id: 11, name: 'XXIO Prime 여성용 퍼터 말렛 타입', price: '가격문의', image: null }
];

export default function XXIOWomens() {
  return (
    <ProductList 
      title="젝시오 여성용"
      subtitle="| XXIO WOMENS"
      products={xxioWomens}
      totalCount={xxioWomens.length}
      category="젝시오 여성용"
    />
  );
}
