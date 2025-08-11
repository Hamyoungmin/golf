import ProductList from '@/components/ProductList';

const taylormadeDrivers = [
  { id: 1, name: 'STEALTH HD 10.5도 TENSEI RED TM50', price: '가격문의', image: null },
  { id: 2, name: '스텔스 HD 10.5 SR TENSEI RED TM50(2022)', price: '가격문의', image: null },
  { id: 3, name: 'SIM2 MAX 10.5도 VENTUS Blue 6 SR', price: '가격문의', image: null },
  { id: 4, name: 'SIM MAX 10.5도 VENTUS BLUE 6 S', price: '가격문의', image: null },
  { id: 5, name: 'SIM 글로레 9.5 S Air Speeder TM', price: '가격문의', image: null },
  { id: 6, name: 'M6 9 S FUBUKI TM5 2019', price: '가격문의', image: null },
  { id: 7, name: 'M6 10.5 S Tour AD IZ-6', price: '가격문의', image: null },
  { id: 8, name: 'M4(2021) 10.5 R FUBUKI TM5 2019', price: '가격문의', image: null },
  { id: 9, name: 'M4 10.5도 FUBUKI TM5 R', price: '가격문의', image: null },
  { id: 10, name: 'M4 10.5도 FUBUKI TM5 SR', price: '가격문의', image: null },
  { id: 11, name: 'M4 10.5 S FUBUKI TM5', price: '가격문의', image: null },
  { id: 12, name: 'P790 4~P KBS TOUR 130 S', price: '가격문의', image: null },
  { id: 13, name: 'P770 4~P KBS TOUR 120 S', price: '가격문의', image: null }
];

export default function TaylormadeDrivers() {
  return (
    <ProductList 
      title="테일러메이드 드라이버"
      subtitle="| TAYLORMADE DRIVERS"
      products={taylormadeDrivers}
      totalCount={taylormadeDrivers.length}
      category="테일러메이드 드라이버"
    />
  );
}
