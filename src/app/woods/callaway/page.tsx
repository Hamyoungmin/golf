import ProductList from '@/components/ProductList';

const callawayWoods = [
  { id: 1, name: 'PARADYM 15도 Project X HZRDUS Smoke IM10 60', price: '가격문의', image: null },
  { id: 2, name: 'ROGUE ST MAX 15도 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null },
  { id: 3, name: 'EPIC MAX LS 15도 Project X HZRDUS Smoke IM10', price: '가격문의', image: null },
  { id: 4, name: 'EPIC SPEED 15도 Diamana 50 for Callaway S', price: '가격문의', image: null },
  { id: 5, name: 'MAVRIK LITE 20.5도 Diamana 40 for Callaway L', price: '가격문의', image: null },
  { id: 6, name: 'MAVRIK 15도 4 SR', price: '가격문의', image: null },
  { id: 7, name: 'ROGUE STAR 15도 Speeder EVOLUTION R', price: '가격문의', image: null },
  { id: 8, name: 'XR16 FAIRWAY 15도 SR', price: '가격문의', image: null },
  { id: 9, name: 'EPIC MAX FAST 15도 R FAST Driver Speeder Evolution', price: '가격문의', image: null },
  { id: 10, name: 'ROGUE ST MAX FAST 15도 S Speeder NX 40', price: '가격문의', image: null }
];

export default function CallawayWoods() {
  return (
    <ProductList 
      title="캘러웨이 우드"
      subtitle="| CALLAWAY WOODS"
      products={callawayWoods}
      totalCount={callawayWoods.length}
      category="캘러웨이 우드"
    />
  );
}
