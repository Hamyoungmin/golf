import ProductList from '@/components/ProductList';

const bridgestoneDrivers = [
  { id: 1, name: 'TOUR B X 10.5도 TOUR AD DI-6 S', price: '가격문의', image: null },
  { id: 2, name: 'TOUR B XD-3 9.5도 TOUR AD PT-6', price: '가격문의', image: null },
  { id: 3, name: 'TOUR B XD-3 9.5도 디아마나BF 6S', price: '가격문의', image: null },
  { id: 4, name: 'TOUR B JGR 10.5도 Air Speeder BS-JGR', price: '가격문의', image: null },
  { id: 5, name: 'TOUR B JGR HF2 5~P Air Speeder for JGR', price: '가격문의', image: null },
  { id: 6, name: 'TOUR B 213 4~P NSPRO MODUS3 TOUR 120', price: '가격문의', image: null },
  { id: 7, name: 'TOUR B X-CB 4~P NSPRO MODUS3 TOUR 105', price: '가격문의', image: null },
  { id: 8, name: 'J715 B3 9.5 S Tour AD J15-11W', price: '가격문의', image: null },
  { id: 9, name: 'B3 DD 10.5 SR TENSEI BS Red 40', price: '가격문의', image: null }
];

export default function BridgestoneDrivers() {
  return (
    <ProductList 
      title="브리지스톤 드라이버"
      subtitle="| BRIDGESTONE DRIVERS"
      products={bridgestoneDrivers}
      totalCount={bridgestoneDrivers.length}
      category="브리지스톤 드라이버"
    />
  );
}
