import ProductList from '@/components/ProductList';

const bridgestoneWomens = [
  { id: 1, name: 'TOUR B JGR 여성용 12도 Air Speeder BS-JGR for Women', price: '가격문의', image: null },
  { id: 2, name: 'B-LD 여성용 12도 Air Speeder BS-LD for Women', price: '가격문의', image: null },
  { id: 3, name: 'J715 LADIES B3 12도 여성용 Air Speeder J15-11W for Women', price: '가격문의', image: null },
  { id: 4, name: 'PHYZ LADIES 12도 여성용 PHYZ for Women', price: '가격문의', image: null },
  { id: 5, name: 'TOUR B JGR 여성용 18도 Air Speeder BS-JGR for Women', price: '가격문의', image: null },
  { id: 6, name: 'B-LD 여성용 18도 Air Speeder BS-LD for Women', price: '가격문의', image: null },
  { id: 7, name: 'TOUR B JGR LADIES IRON 7-P 여성용 Air Speeder BS-JGR', price: '가격문의', image: null },
  { id: 8, name: 'B-LD LADIES IRON 7-P 여성용 Air Speeder BS-LD', price: '가격문의', image: null },
  { id: 9, name: 'PHYZ LADIES IRON 7-P 여성용 PHYZ for Women', price: '가격문의', image: null },
  { id: 10, name: 'TOUR B JGR 여성용 U4 24도 Air Speeder BS-JGR for Women', price: '가격문의', image: null },
  { id: 11, name: 'B-LD LADIES PUTTER 여성용 말렛 32인치 스틸샤프트', price: '가격문의', image: null },
  { id: 12, name: 'TOUR B LADIES WEDGE 56도 여성용 NSPRO 850GH neo', price: '가격문의', image: null }
];

export default function BridgestoneWomens() {
  return (
    <ProductList 
      title="브리지스톤 여성용"
      subtitle="| BRIDGESTONE WOMENS"
      products={bridgestoneWomens}
      totalCount={bridgestoneWomens.length}
      category="브리지스톤 여성용"
    />
  );
}
