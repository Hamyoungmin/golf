import ProductList from '@/components/ProductList';

const honmaPutters = [
  { id: 1, name: 'TW-PT01 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 2, name: 'TW-PT02 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 3, name: 'TW-PT03 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 4, name: 'BERES PT-02 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 5, name: 'BERES PT-01 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 6, name: 'TW747 PT 001 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 7, name: 'TW747 PT 002 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 8, name: 'Be ZEAL PT-01 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 9, name: 'Be ZEAL PT-02 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 10, name: 'TW717 PT 001 블레이드 스틸샤프트', price: '가격문의', image: null }
];

export default function HonmaPutters() {
  return (
    <ProductList 
      title="혼마 퍼터"
      subtitle="| HONMA PUTTERS"
      products={honmaPutters}
      totalCount={honmaPutters.length}
      category="혼마 퍼터"
    />
  );
}
