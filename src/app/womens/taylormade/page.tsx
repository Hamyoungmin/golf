import ProductList from '@/components/ProductList';

const taylormadeWomens = [
  { id: 1, name: 'STEALTH 2 HD 여성용 12도 TENSEI RED TM40 A', price: '가격문의', image: null },
  { id: 2, name: 'SIM2 MAX 여성용 12도 VENTUS Blue 5 A', price: '가격문의', image: null },
  { id: 3, name: 'SIM MAX 여성용 12도 VENTUS BLUE 5 A', price: '가격문의', image: null },
  { id: 4, name: 'M6 여성용 12도 A FUBUKI TM5 2019', price: '가격문의', image: null },
  { id: 5, name: 'M4 여성용 12도 FUBUKI TM5 A', price: '가격문의', image: null },
  { id: 6, name: 'STEALTH 여성용 18도 TENSEI RED TM40 A', price: '가격문의', image: null },
  { id: 7, name: 'SIM2 MAX 여성용 18도 VENTUS Blue 5 A', price: '가격문의', image: null },
  { id: 8, name: 'P790 여성용 6-P A TENSEI AM2 BLUE', price: '가격문의', image: null },
  { id: 9, name: 'SIM MAX OS 여성용 6-P A TENSEI AM2 BLUE', price: '가격문의', image: null },
  { id: 10, name: 'STEALTH 여성용 U3 21도 TENSEI RED TM40 A', price: '가격문의', image: null },
  { id: 11, name: 'SPIDER GT MAX 여성용 말렛 32인치 스틸샤프트', price: '가격문의', image: null },
  { id: 12, name: 'MG3 여성용 56도 NSPRO 950GH neo', price: '가격문의', image: null }
];

export default function TaylormadeWomens() {
  return (
    <ProductList 
      title="테일러메이드 여성용"
      subtitle="| TAYLORMADE WOMENS"
      products={taylormadeWomens}
      totalCount={taylormadeWomens.length}
      category="테일러메이드 여성용"
    />
  );
}
