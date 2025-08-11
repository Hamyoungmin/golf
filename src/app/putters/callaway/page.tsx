import ProductList from '@/components/ProductList';

const callawayPutters = [
  { id: 1, name: 'WHITE HOT VERSA TWELVE DB 말렛 카본, 스틸 복합 샤프트', price: '가격문의', image: null },
  { id: 2, name: 'WHITE HOT VERSA DOUBLE WIDE DB 블레이드 와이드 스틸샤프트', price: '가격문의', image: null },
  { id: 3, name: 'WHITE HOT RX #9 반달 스틸샤프트', price: '가격문의', image: null },
  { id: 4, name: 'DFX 2-BALL 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 5, name: 'ODYSSEY O-WORKS BLACK #7 스틸샤프트', price: '가격문의', image: null },
  { id: 6, name: 'ODYSSEY O-WORKS BLACK 2-BALL 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 7, name: 'ODYSSEY STROKE LAB BLACK TEN 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 8, name: 'ODYSSEY TRI-BALL SRT 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 9, name: 'WHITE HOT PRO 2.0 #7 스틸샤프트', price: '가격문의', image: null },
  { id: 10, name: 'ODYSSEY METAL-X MILLED 2-BALL 말렛 스틸샤프트', price: '가격문의', image: null }
];

export default function CallawayPutters() {
  return (
    <ProductList 
      title="캘러웨이 퍼터"
      subtitle="| CALLAWAY PUTTERS"
      products={callawayPutters}
      totalCount={callawayPutters.length}
      category="캘러웨이 퍼터"
    />
  );
}
