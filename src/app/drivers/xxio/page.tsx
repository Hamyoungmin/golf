import ProductList from '@/components/ProductList';

const xxioDrivers = [
  { id: 1, name: 'XXIO 13 드라이버 11.5도 S', price: '가격문의', image: null },
  { id: 2, name: 'XXIO 13 드라이버 10.5도 R', price: '가격문의', image: null },
  { id: 3, name: 'XXIO 12 드라이버 9.5도 S', price: '가격문의', image: null },
  { id: 4, name: 'XXIO 12 드라이버 10.5도 SR', price: '가격문의', image: null },
  { id: 5, name: 'XXIO X 드라이버 9.5도 R', price: '가격문의', image: null },
  { id: 6, name: 'XXIO X 드라이버 10.5도 S', price: '가격문의', image: null },
  { id: 7, name: 'XXIO 11 드라이버 11.5도 R', price: '가격문의', image: null },
  { id: 8, name: 'XXIO 11 드라이버 10.5도 S', price: '가격문의', image: null },
  { id: 9, name: 'XXIO Prime 드라이버 11.5도 R', price: '가격문의', image: null },
  { id: 10, name: 'XXIO Prime 드라이버 10.5도 S', price: '가격문의', image: null }
];

export default function XXIODrivers() {
  return (
    <ProductList 
      title="젝시오 드라이버"
      subtitle="| XXIO DRIVERS"
      products={xxioDrivers}
      totalCount={xxioDrivers.length}
      category="젝시오 드라이버"
    />
  );
}
