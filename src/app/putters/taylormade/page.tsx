import ProductList from '@/components/ProductList';

const taylormadePutters = [
  { id: 1, name: 'SPIDER GT MAX 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 2, name: 'SPIDER GT TM-1 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 3, name: 'SPIDER X COPPER 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 4, name: 'SPIDER X NAVY 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 5, name: 'SPIDER TOUR RED 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 6, name: 'SPIDER TOUR DOUBLE BEND 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 7, name: 'P790 TM1 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 8, name: 'TP COLLECTION BANDON 3 스틸샤프트', price: '가격문의', image: null },
  { id: 9, name: 'TP COLLECTION ARDMORE 3 스틸샤프트', price: '가격문의', image: null },
  { id: 10, name: 'DADDY LONG LEGS 말렛 스틸샤프트', price: '가격문의', image: null }
];

export default function TaylormadePutters() {
  return (
    <ProductList 
      title="테일러메이드 퍼터"
      subtitle="| TAYLORMADE PUTTERS"
      products={taylormadePutters}
      totalCount={taylormadePutters.length}
      category="테일러메이드 퍼터"
    />
  );
}
