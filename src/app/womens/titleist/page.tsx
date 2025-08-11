import ProductList from '@/components/ProductList';

const titleistWomens = [
  { id: 1, name: 'TSR2 여성용 10.5도 TSP111 50 L', price: '가격문의', image: null },
  { id: 2, name: 'TSR1 여성용 11.5도 TSP322 45 A', price: '가격문의', image: null },
  { id: 3, name: 'TSi2 여성용 10.5도 TSP322 55 L', price: '가격문의', image: null },
  { id: 4, name: 'TSi1 여성용 11.5도 TSP322 45 A', price: '가격문의', image: null },
  { id: 5, name: 'TS2 여성용 10.5도 Tour AD 60 L', price: '가격문의', image: null },
  { id: 6, name: 'T300 여성용 6-P L TENSEI AM2 BLUE', price: '가격문의', image: null },
  { id: 7, name: 'T200 여성용 6-P L TENSEI AM2 BLUE', price: '가격문의', image: null },
  { id: 8, name: 'TSR2 여성용 U3 21도 TSP111 50 L', price: '가격문의', image: null },
  { id: 9, name: 'TSi2 여성용 15도 TSP322 55 L', price: '가격문의', image: null },
  { id: 10, name: 'Scotty Cameron Newport 2 여성용 스틸샤프트 32인치', price: '가격문의', image: null },
  { id: 11, name: 'Vokey SM9 56도 여성용 NSPRO 950GH neo', price: '가격문의', image: null },
  { id: 12, name: 'TSR1 여성용 18도 TSP322 45 A', price: '가격문의', image: null }
];

export default function TitleistWomens() {
  return (
    <ProductList 
      title="타이틀리스트 여성용"
      subtitle="| TITLEIST WOMENS"
      products={titleistWomens}
      totalCount={titleistWomens.length}
      category="타이틀리스트 여성용"
    />
  );
}
