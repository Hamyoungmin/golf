import ProductList from '@/components/ProductList';

const titleistLeftHanded = [
  { id: 1, name: 'TSR3 9.5도 왼손용 TSP110 60 S', price: '가격문의', image: null },
  { id: 2, name: 'TSR2 10.5도 왼손용 TSP111 50 SR', price: '가격문의', image: null },
  { id: 3, name: 'TSi3 9.5도 왼손용 TENSEI CK Pro Orange 70 S', price: '가격문의', image: null },
  { id: 4, name: 'TSi2 10.5도 왼손용 TSP322 55 SR', price: '가격문의', image: null },
  { id: 5, name: 'TS3 9.5도 왼손용 TENSEI CK Pro Orange 70 S', price: '가격문의', image: null },
  { id: 6, name: 'TS2 10.5도 왼손용 Tour AD 60 SR', price: '가격문의', image: null },
  { id: 7, name: '917D2 9.5도 왼손용 Diamana D+ 70 S', price: '가격문의', image: null },
  { id: 8, name: '915D3 9.5도 왼손용 Tour AD DI-7 S', price: '가격문의', image: null },
  { id: 9, name: 'TSR1 10.5도 왼손용 TSP322 45 A', price: '가격문의', image: null },
  { id: 10, name: 'TSi1 10.5도 왼손용 TSP322 45 L', price: '가격문의', image: null },
  { id: 11, name: 'Scotty Cameron Newport 2 왼손용 스틸샤프트', price: '가격문의', image: null },
  { id: 12, name: 'Vokey SM9 56도 왼손용 NSPRO 950GH', price: '가격문의', image: null }
];

export default function TitleistLeftHanded() {
  return (
    <ProductList 
      title="타이틀리스트 왼손용"
      subtitle="| TITLEIST LEFT-HANDED"
      products={titleistLeftHanded}
      totalCount={titleistLeftHanded.length}
      category="타이틀리스트 왼손용"
    />
  );
}
