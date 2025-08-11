import ProductList from '@/components/ProductList';

const taylormadeLeftHanded = [
  { id: 1, name: 'STEALTH 2 HD 10.5도 왼손용 TENSEI RED TM50', price: '가격문의', image: null },
  { id: 2, name: 'SIM2 MAX 10.5도 왼손용 VENTUS Blue 6 SR', price: '가격문의', image: null },
  { id: 3, name: 'SIM MAX 10.5도 왼손용 VENTUS BLUE 6 S', price: '가격문의', image: null },
  { id: 4, name: 'SIM 글로레 10.5도 왼손용 S Air Speeder TM', price: '가격문의', image: null },
  { id: 5, name: 'M6 10.5도 왼손용 S FUBUKI TM5 2019', price: '가격문의', image: null },
  { id: 6, name: 'M4 10.5도 왼손용 FUBUKI TM5 R', price: '가격문의', image: null },
  { id: 7, name: 'M2(2017) 10.5도 왼손용 S REAX 90 KR', price: '가격문의', image: null },
  { id: 8, name: 'SPIDER GT MAX 왼손용 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 9, name: 'TP COLLECTION BANDON 3 왼손용 스틸샤프트', price: '가격문의', image: null },
  { id: 10, name: 'MG3 56도 왼손용 NSPRO 950GH', price: '가격문의', image: null },
  { id: 11, name: 'STEALTH 15도 왼손용 TENSEI RED TM50', price: '가격문의', image: null },
  { id: 12, name: 'P770 5-P 왼손용 NSPRO MODUS3 TOUR 120', price: '가격문의', image: null }
];

export default function TaylormadeLeftHanded() {
  return (
    <ProductList 
      title="테일러메이드 왼손용"
      subtitle="| TAYLORMADE LEFT-HANDED"
      products={taylormadeLeftHanded}
      totalCount={taylormadeLeftHanded.length}
      category="테일러메이드 왼손용"
    />
  );
}
