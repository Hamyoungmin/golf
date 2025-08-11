import ProductList from '@/components/ProductList';

const bridgestoneWoods = [
  { id: 1, name: 'TOUR B X 15도 TOUR AD DI-6 S', price: '가격문의', image: null },
  { id: 2, name: 'TOUR B XD-3 15도 TOUR AD PT-6', price: '가격문의', image: null },
  { id: 3, name: 'TOUR B XD-3 15도 디아마나BF 6S', price: '가격문의', image: null },
  { id: 4, name: 'TOUR B JGR 15도 Air Speeder BS-JGR', price: '가격문의', image: null },
  { id: 5, name: 'J715 B3 15도 S Tour AD J15-11W', price: '가격문의', image: null },
  { id: 6, name: 'B3 DD 15도 SR TENSEI BS Red 40', price: '가격문의', image: null },
  { id: 7, name: 'J815 15도 Diamana B60', price: '가격문의', image: null },
  { id: 8, name: '투어B JGR 15도 TG2-5 SR', price: '가격문의', image: null },
  { id: 9, name: '투어B XD-3 15도 TX1 - 6S', price: '가격문의', image: null }
];

export default function BridgestoneWoods() {
  return (
    <ProductList 
      title="브리지스톤 우드"
      subtitle="| BRIDGESTONE WOODS"
      products={bridgestoneWoods}
      totalCount={bridgestoneWoods.length}
      category="브리지스톤 우드"
    />
  );
}
