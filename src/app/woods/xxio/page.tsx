import ProductList from '@/components/ProductList';

const xxioWoods = [
  { id: 1, name: 'XXIO 13 페어웨이우드 3W 15도 S', price: '가격문의', image: null },
  { id: 2, name: 'XXIO 13 페어웨이우드 5W 18도 R', price: '가격문의', image: null },
  { id: 3, name: 'XXIO 12 페어웨이우드 3W 15도 R', price: '가격문의', image: null },
  { id: 4, name: 'XXIO 12 페어웨이우드 5W 18도 SR', price: '가격문의', image: null },
  { id: 5, name: 'XXIO X 페어웨이우드 3W 15도 S', price: '가격문의', image: null },
  { id: 6, name: 'XXIO X 페어웨이우드 7W 21도 R', price: '가격문의', image: null },
  { id: 7, name: 'XXIO 11 페어웨이우드 3W 15도 R', price: '가격문의', image: null },
  { id: 8, name: 'XXIO 11 페어웨이우드 5W 18도 S', price: '가격문의', image: null },
  { id: 9, name: 'XXIO Prime 페어웨이우드 3W 15도 R', price: '가격문의', image: null },
  { id: 10, name: 'XXIO Prime 페어웨이우드 5W 18도 S', price: '가격문의', image: null }
];

export default function XXIOWoods() {
  return (
    <ProductList 
      title="젝시오 우드"
      subtitle="| XXIO WOODS"
      products={xxioWoods}
      totalCount={xxioWoods.length}
      category="젝시오 우드"
    />
  );
}
