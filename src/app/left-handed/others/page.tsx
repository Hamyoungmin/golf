import ProductList from '@/components/ProductList';

const othersLeftHanded = [
  { id: 1, name: 'PING G430 MAX 10.5도 왼손용 PING TOUR 65 R', price: '가격문의', image: null },
  { id: 2, name: 'PING G425 LST 9.5도 왼손용 PING TOUR 65 S', price: '가격문의', image: null },
  { id: 3, name: 'PING G425 SFT 10.5도 왼손용 PING TOUR 65 SR', price: '가격문의', image: null },
  { id: 4, name: 'G425 MAX 10.5도 왼손용 S ALTA J CB SLATE', price: '가격문의', image: null },
  { id: 5, name: 'G410 LST 9.5도 왼손용 S ROMBAX 6X07', price: '가격문의', image: null },
  { id: 6, name: 'PING G410 10.5도 왼손용 PING TOUR 65 R', price: '가격문의', image: null },
  { id: 7, name: 'YAMAHA RMX VD 10.5도 왼손용 Diamana ZF 60 S', price: '가격문의', image: null },
  { id: 8, name: 'RMX VD40 10.5도 왼손용 Speeder NX for Yamaha M423i', price: '가격문의', image: null },
  { id: 9, name: 'RMX VD59 10.5도 왼손용 SR Diamana YR', price: '가격문의', image: null },
  { id: 10, name: 'RMX 220 10.5도 왼손용 S Speeder 661 EVOLUTION II', price: '가격문의', image: null },
  { id: 11, name: 'RMX 218 9.5도 왼손용 S FUBUKI Ai II 50', price: '가격문의', image: null },
  { id: 12, name: 'RMX 120 10.5도 왼손용 S TMX-420D', price: '가격문의', image: null },
  { id: 13, name: 'DUNLOP XXIO CROSS 10.5도 왼손용 XXIO MP800 SR', price: '가격문의', image: null },
  { id: 14, name: 'XXIO 12 10.5도 왼손용 XXIO MP1200 SR', price: '가격문의', image: null },
  { id: 15, name: 'XXIO (2018) 10.5도 왼손용 S MP1000', price: '가격문의', image: null },
  { id: 16, name: '글로레 F2 10.5도 왼손용 R GL3300', price: '가격문의', image: null },
  { id: 17, name: 'COBRA RAD SPEED 10.5도 왼손용 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null },
  { id: 18, name: 'PING PLD ANSER 2D 왼손용 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 19, name: 'CLEVELAND HUNTINGTON BEACH SOFT 1 왼손용 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 20, name: 'MIZUNO M.CRAFT III 왼손용 블레이드 스틸샤프트', price: '가격문의', image: null }
];

export default function OthersLeftHanded() {
  return (
    <ProductList 
      title="기타 브랜드 왼손용"
      subtitle="| OTHER BRAND LEFT-HANDED"
      products={othersLeftHanded}
      totalCount={othersLeftHanded.length}
      category="기타 왼손용"
    />
  );
}
