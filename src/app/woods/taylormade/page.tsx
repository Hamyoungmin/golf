import ProductList from '@/components/ProductList';

const taylormadeWoods = [
  { id: 1, name: 'STEALTH HD 15도 TENSEI RED TM50', price: '가격문의', image: null },
  { id: 2, name: 'SIM2 MAX 15도 VENTUS Blue 6 SR', price: '가격문의', image: null },
  { id: 3, name: 'SIM MAX 15도 VENTUS BLUE 6 S', price: '가격문의', image: null },
  { id: 4, name: 'SIM 글로레 15도 S Air Speeder TM', price: '가격문의', image: null },
  { id: 5, name: 'M6 15도 S FUBUKI TM5 2019', price: '가격문의', image: null },
  { id: 6, name: 'M6 RESCUE U3 19 S TENSEI CK BLUE HY 80', price: '가격문의', image: null },
  { id: 7, name: 'M4 15도 FUBUKI TM5 R', price: '가격문의', image: null },
  { id: 8, name: 'M4 5번 TUNED PERFORMANCE 45 L', price: '가격문의', image: null },
  { id: 9, name: 'M2(2017) U3 19 S REAX 90 KR', price: '가격문의', image: null },
  { id: 10, name: 'M2(2017) U3 19 S N.S.PRO ZELOS 7 HYBRID', price: '가격문의', image: null }
];

export default function TaylormadeWoods() {
  return (
    <ProductList 
      title="테일러메이드 우드"
      subtitle="| TAYLORMADE WOODS"
      products={taylormadeWoods}
      totalCount={taylormadeWoods.length}
      category="테일러메이드 우드"
    />
  );
}
