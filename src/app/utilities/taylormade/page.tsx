import ProductList from '@/components/ProductList';

const taylormadeUtilities = [
  { id: 1, name: 'STEALTH U3 21도 TENSEI RED TM50', price: '가격문의', image: null },
  { id: 2, name: 'SIM2 MAX U3 21도 VENTUS Blue 6 SR', price: '가격문의', image: null },
  { id: 3, name: 'SIM MAX U3 21도 VENTUS BLUE 6 S', price: '가격문의', image: null },
  { id: 4, name: 'STEALTH 5번 L', price: '가격문의', image: null },
  { id: 5, name: 'STEALTH 5번 TENSEI RED TM40 L', price: '가격문의', image: null },
  { id: 6, name: 'STEALTH 5번 TENSEI RED TM40 A', price: '가격문의', image: null },
  { id: 7, name: 'M6 RESCUE U3 19 S TENSEI CK BLUE HY 80', price: '가격문의', image: null },
  { id: 8, name: 'M4 5번 TUNED PERFORMANCE 45 L', price: '가격문의', image: null },
  { id: 9, name: 'M2(2017) U3 19 S REAX 90 KR', price: '가격문의', image: null },
  { id: 10, name: 'M2(2017) U3 19 S N.S.PRO ZELOS 7 HYBRID', price: '가격문의', image: null }
];

export default function TaylormadeUtilities() {
  return (
    <ProductList 
      title="테일러메이드 유틸리티"
      subtitle="| TAYLORMADE UTILITIES"
      products={taylormadeUtilities}
      totalCount={taylormadeUtilities.length}
      category="테일러메이드 유틸리티"
    />
  );
}
