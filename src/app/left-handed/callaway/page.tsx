import ProductList from '@/components/ProductList';

const callawayLeftHanded = [
  { id: 1, name: 'PARADYM 10.5도 왼손용 Project X HZRDUS Smoke IM10 60', price: '가격문의', image: null },
  { id: 2, name: 'ROGUE ST MAX 10.5도 왼손용 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null },
  { id: 3, name: 'EPIC MAX LS 9.5도 왼손용 Project X HZRDUS Smoke IM10', price: '가격문의', image: null },
  { id: 4, name: 'EPIC SPEED 10.5도 왼손용 Diamana 50 for Callaway S', price: '가격문의', image: null },
  { id: 5, name: 'MAVRIK LITE 12도 왼손용 Diamana 40 for Callaway L', price: '가격문의', image: null },
  { id: 6, name: 'MAVRIK 10.5도 왼손용 4 SR', price: '가격문의', image: null },
  { id: 7, name: 'ROGUE STAR 10.5도 왼손용 Speeder EVOLUTION R', price: '가격문의', image: null },
  { id: 8, name: 'XR16 10.5도 왼손용 SR', price: '가격문의', image: null },
  { id: 9, name: 'WHITE HOT VERSA TWELVE DB 왼손용 말렛', price: '가격문의', image: null },
  { id: 10, name: 'JAWS RAW 56도 왼손용 NSPRO 950GH', price: '가격문의', image: null },
  { id: 11, name: 'APEX DCB 7I-P 왼손용 NSPRO 950GH', price: '가격문의', image: null },
  { id: 12, name: 'ROGUE ST MAX 15도 왼손용 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null }
];

export default function CallawayLeftHanded() {
  return (
    <ProductList 
      title="캘러웨이 왼손용"
      subtitle="| CALLAWAY LEFT-HANDED"
      products={callawayLeftHanded}
      totalCount={callawayLeftHanded.length}
      category="캘러웨이 왼손용"
    />
  );
}
