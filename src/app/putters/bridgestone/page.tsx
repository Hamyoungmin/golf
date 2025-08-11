import ProductList from '@/components/ProductList';

const bridgestonePutters = [
  { id: 1, name: 'TOUR B JGR PUTTER 01 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 2, name: 'TOUR B JGR PUTTER 02 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 3, name: 'B-LD PT-01 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 4, name: 'B-LD PT-02 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 5, name: 'B-LD PT-03 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 6, name: 'TOURSTAGE PT-01 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 7, name: 'TOURSTAGE PT-02 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 8, name: 'J15 PUTTER 01 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 9, name: 'J15 PUTTER 02 말렛 스틸샤프트', price: '가격문의', image: null }
];

export default function BridgestonePutters() {
  return (
    <ProductList 
      title="브리지스톤 퍼터"
      subtitle="| BRIDGESTONE PUTTERS"
      products={bridgestonePutters}
      totalCount={bridgestonePutters.length}
      category="브리지스톤 퍼터"
    />
  );
}
