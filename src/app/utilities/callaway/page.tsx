import ProductList from '@/components/ProductList';

const callawayUtilities = [
  { id: 1, name: 'PARADYM U3 21도 Project X HZRDUS Smoke IM10 60', price: '가격문의', image: null },
  { id: 2, name: 'ROGUE ST MAX U3 21도 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null },
  { id: 3, name: 'EPIC MAX U3 21도 Project X HZRDUS Smoke IM10', price: '가격문의', image: null },
  { id: 4, name: 'APEX DCB U3 21도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 5, name: 'MAVRIK LITE U4 24도 Diamana 40 for Callaway L', price: '가격문의', image: null },
  { id: 6, name: 'MAVRIK U3 21도 4 SR', price: '가격문의', image: null },
  { id: 7, name: 'ROGUE STAR U3 21도 Speeder EVOLUTION R', price: '가격문의', image: null },
  { id: 8, name: 'XR16 U3 21도 SR', price: '가격문의', image: null },
  { id: 9, name: 'EPIC MAX FAST U3 21도 R FAST Driver Speeder Evolution', price: '가격문의', image: null },
  { id: 10, name: 'ROGUE ST MAX FAST U3 21도 S Speeder NX 40', price: '가격문의', image: null }
];

export default function CallawayUtilities() {
  return (
    <ProductList 
      title="캘러웨이 유틸리티"
      subtitle="| CALLAWAY UTILITIES"
      products={callawayUtilities}
      totalCount={callawayUtilities.length}
      category="캘러웨이 유틸리티"
    />
  );
}
