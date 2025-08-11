import ProductList from '@/components/ProductList';

const callawayWomens = [
  { id: 1, name: 'PARADYM 여성용 10.5도 Project X HZRDUS Smoke IM10 50 L', price: '가격문의', image: null },
  { id: 2, name: 'ROGUE ST MAX 여성용 12도 Fujikura VENTUS Blue 5 A', price: '가격문의', image: null },
  { id: 3, name: 'EPIC MAX FAST 여성용 12도 FAST Driver Speeder Evolution L', price: '가격문의', image: null },
  { id: 4, name: 'MAVRIK LITE 여성용 13도 Diamana 40 for Callaway A', price: '가격문의', image: null },
  { id: 5, name: 'ROGUE STAR 여성용 12도 Speeder EVOLUTION A', price: '가격문의', image: null },
  { id: 6, name: 'ROGUE ST MAX 여성용 18도 Fujikura VENTUS Blue 5 A', price: '가격문의', image: null },
  { id: 7, name: 'APEX DCB 여성용 7I-P A Diamana 50 for Callaway', price: '가격문의', image: null },
  { id: 8, name: 'ROGUE ST MAX LITE 여성용 6-P L Speeder NX 30', price: '가격문의', image: null },
  { id: 9, name: 'ROGUE ST MAX 여성용 U3 21도 Fujikura VENTUS Blue 5 A', price: '가격문의', image: null },
  { id: 10, name: 'WHITE HOT VERSA DOUBLE WIDE DB 여성용 블레이드 32인치', price: '가격문의', image: null },
  { id: 11, name: 'JAWS RAW 여성용 56도 NSPRO 950GH neo', price: '가격문의', image: null },
  { id: 12, name: 'MAVRIK LITE 여성용 20.5도 Diamana 40 for Callaway A', price: '가격문의', image: null }
];

export default function CallawayWomens() {
  return (
    <ProductList 
      title="캘러웨이 여성용"
      subtitle="| CALLAWAY WOMENS"
      products={callawayWomens}
      totalCount={callawayWomens.length}
      category="캘러웨이 여성용"
    />
  );
}
