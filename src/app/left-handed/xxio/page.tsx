import ProductList from '@/components/ProductList';

const xxioLeftHanded = [
  { id: 1, name: 'XXIO 13 왼손용 드라이버 10.5도 R', price: '가격문의', image: null },
  { id: 2, name: 'XXIO 13 왼손용 페어웨이우드 3W 15도 R', price: '가격문의', image: null },
  { id: 3, name: 'XXIO 12 왼손용 드라이버 10.5도 S', price: '가격문의', image: null },
  { id: 4, name: 'XXIO 12 왼손용 유틸리티 3U 19도 R', price: '가격문의', image: null },
  { id: 5, name: 'XXIO X 왼손용 드라이버 10.5도 R', price: '가격문의', image: null },
  { id: 6, name: 'XXIO X 왼손용 페어웨이우드 5W 18도 S', price: '가격문의', image: null },
  { id: 7, name: 'XXIO 11 왼손용 드라이버 10.5도 R', price: '가격문의', image: null },
  { id: 8, name: 'XXIO 11 왼손용 웨지 SW 56도 R', price: '가격문의', image: null },
  { id: 9, name: 'XXIO Prime 왼손용 드라이버 10.5도 R', price: '가격문의', image: null },
  { id: 10, name: 'XXIO Prime 왼손용 퍼터 블레이드 타입', price: '가격문의', image: null }
];

export default function XXIOLeftHanded() {
  return (
    <ProductList 
      title="젝시오 왼손용"
      subtitle="| XXIO LEFT-HANDED"
      products={xxioLeftHanded}
      totalCount={xxioLeftHanded.length}
      category="젝시오 왼손용"
    />
  );
}
