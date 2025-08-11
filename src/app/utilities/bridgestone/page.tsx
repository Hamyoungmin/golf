import ProductList from '@/components/ProductList';

const bridgestoneUtilities = [
  { id: 1, name: 'TOUR B X U3 21도 TOUR AD DI-6 S', price: '가격문의', image: null },
  { id: 2, name: 'TOUR B XD-3 U3 21도 TOUR AD PT-6', price: '가격문의', image: null },
  { id: 3, name: 'TOUR B JGR U3 21도 Air Speeder BS-JGR', price: '가격문의', image: null },
  { id: 4, name: 'J715 B3 U3 21도 S Tour AD J15-11W', price: '가격문의', image: null },
  { id: 5, name: 'B3 DD U3 21도 SR TENSEI BS Red 40', price: '가격문의', image: null },
  { id: 6, name: 'J815 U3 21도 Diamana B60', price: '가격문의', image: null },
  { id: 7, name: '투어B JGR U3 21도 TG2-5 SR', price: '가격문의', image: null },
  { id: 8, name: '투어B XD-3 U3 21도 TX1 - 6S', price: '가격문의', image: null },
  { id: 9, name: 'TOUR B 213 U3 21도 NSPRO MODUS3 TOUR 120', price: '가격문의', image: null }
];

export default function BridgestoneUtilities() {
  return (
    <ProductList 
      title="브리지스톤 유틸리티"
      subtitle="| BRIDGESTONE UTILITIES"
      products={bridgestoneUtilities}
      totalCount={bridgestoneUtilities.length}
      category="브리지스톤 유틸리티"
    />
  );
}
