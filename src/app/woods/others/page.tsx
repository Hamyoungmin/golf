import ProductList from '@/components/ProductList';

const othersWoods = [
  { id: 1, name: 'PING G430 MAX 15도 PING TOUR 65 R', price: '가격문의', image: null },
  { id: 2, name: 'PING G425 LST 15도 PING TOUR 65 S', price: '가격문의', image: null },
  { id: 3, name: 'PING G425 SFT 15도 PING TOUR 65 SR', price: '가격문의', image: null },
  { id: 4, name: 'G425 MAX 15도 S ALTA J CB SLATE', price: '가격문의', image: null },
  { id: 5, name: 'G410 LST 15도 S ROMBAX 6X07', price: '가격문의', image: null },
  { id: 6, name: 'PING G410 15도 PING TOUR 65 R', price: '가격문의', image: null },
  { id: 7, name: 'YAMAHA RMX VD 15도 Diamana ZF 60 S', price: '가격문의', image: null },
  { id: 8, name: 'RMX VD40 15도 Speeder NX for Yamaha M423i', price: '가격문의', image: null },
  { id: 9, name: 'RMX VD59 15도 SR Diamana YR', price: '가격문의', image: null },
  { id: 10, name: 'RMX 220 15도 S Speeder 661 EVOLUTION II', price: '가격문의', image: null },
  { id: 11, name: 'RMX 218 15도 S FUBUKI Ai II 50', price: '가격문의', image: null },
  { id: 12, name: 'RMX 120 15도 S TMX-420D', price: '가격문의', image: null },
  { id: 13, name: 'DUNLOP XXIO CROSS 15도 XXIO MP800 SR', price: '가격문의', image: null },
  { id: 14, name: 'XXIO 12 15도 XXIO MP1200 SR', price: '가격문의', image: null },
  { id: 15, name: 'XXIO (2018) 15도 S MP1000', price: '가격문의', image: null },
  { id: 16, name: '글로레 F2 15도 R GL3300', price: '가격문의', image: null },
  { id: 17, name: 'COBRA RAD SPEED 15도 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null },
  { id: 18, name: 'CT-518 15도 FT15d S', price: '가격문의', image: null }
];

export default function OthersWoods() {
  return (
    <ProductList 
      title="기타 브랜드 우드"
      subtitle="| OTHER BRAND WOODS"
      products={othersWoods}
      totalCount={othersWoods.length}
      category="기타 우드"
    />
  );
}
