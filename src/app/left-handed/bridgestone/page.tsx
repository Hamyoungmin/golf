import ProductList from '@/components/ProductList';

const bridgestoneLeftHanded = [
  { id: 1, name: 'TOUR B X 10.5도 왼손용 TOUR AD DI-6 S', price: '가격문의', image: null },
  { id: 2, name: 'TOUR B XD-3 10.5도 왼손용 TOUR AD PT-6', price: '가격문의', image: null },
  { id: 3, name: 'TOUR B XD-3 10.5도 왼손용 디아마나BF 6S', price: '가격문의', image: null },
  { id: 4, name: 'TOUR B JGR 10.5도 왼손용 Air Speeder BS-JGR', price: '가격문의', image: null },
  { id: 5, name: 'J715 B3 10.5도 왼손용 S Tour AD J15-11W', price: '가격문의', image: null },
  { id: 6, name: 'B3 DD 10.5도 왼손용 SR TENSEI BS Red 40', price: '가격문의', image: null },
  { id: 7, name: 'J815 10.5도 왼손용 Diamana B60', price: '가격문의', image: null },
  { id: 8, name: '투어B JGR 10.5도 왼손용 TG2-5 SR', price: '가격문의', image: null },
  { id: 9, name: 'TOUR B JGR PUTTER 01 왼손용 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 10, name: 'TOUR B BRM 56도 왼손용 NSPRO 950GH', price: '가격문의', image: null },
  { id: 11, name: 'TOUR B 213 6-P 왼손용 NSPRO MODUS3 TOUR 120', price: '가격문의', image: null }
];

export default function BridgestoneLeftHanded() {
  return (
    <ProductList 
      title="브리지스톤 왼손용"
      subtitle="| BRIDGESTONE LEFT-HANDED"
      products={bridgestoneLeftHanded}
      totalCount={bridgestoneLeftHanded.length}
      category="브리지스톤 왼손용"
    />
  );
}
