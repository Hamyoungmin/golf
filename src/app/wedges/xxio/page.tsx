import ProductList from '@/components/ProductList';

const xxioWedges = [
  { id: 1, name: 'XXIO 13 웨지 SW 56도 S', price: '가격문의', image: null },
  { id: 2, name: 'XXIO 13 웨지 AW 52도 R', price: '가격문의', image: null },
  { id: 3, name: 'XXIO 12 웨지 SW 56도 R', price: '가격문의', image: null },
  { id: 4, name: 'XXIO 12 웨지 LW 60도 SR', price: '가격문의', image: null },
  { id: 5, name: 'XXIO X 웨지 SW 56도 S', price: '가격문의', image: null },
  { id: 6, name: 'XXIO X 웨지 AW 52도 R', price: '가격문의', image: null },
  { id: 7, name: 'XXIO 11 웨지 SW 56도 R', price: '가격문의', image: null },
  { id: 8, name: 'XXIO 11 웨지 LW 60도 S', price: '가격문의', image: null },
  { id: 9, name: 'XXIO Prime 웨지 SW 56도 R', price: '가격문의', image: null },
  { id: 10, name: 'XXIO Prime 웨지 AW 52도 S', price: '가격문의', image: null }
];

export default function XXIOWedges() {
  return (
    <ProductList 
      title="젝시오 웨지"
      subtitle="| XXIO WEDGES"
      products={xxioWedges}
      totalCount={xxioWedges.length}
      category="젝시오 웨지"
    />
  );
}
