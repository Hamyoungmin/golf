import ProductList from '@/components/ProductList';

const othersDrivers = [
  { id: 1, name: 'PING G430 MAX 10.5도 PING TOUR 65 R', price: '가격문의', image: null },
  { id: 2, name: 'PING G425 LST 9도 PING TOUR 65 S', price: '가격문의', image: null },
  { id: 3, name: 'PING G425 SFT 10.5도 PING TOUR 65 SR', price: '가격문의', image: null },
  { id: 4, name: 'G425 MAX 9 S ALTA J CB SLATE', price: '가격문의', image: null },
  { id: 5, name: 'G410 LST 9 S ROMBAX 6X07', price: '가격문의', image: null },
  { id: 6, name: 'PING G410 10.5도 PING TOUR 65 R', price: '가격문의', image: null },
  { id: 7, name: 'YAMAHA RMX VD 9.5도 Diamana ZF 60 S', price: '가격문의', image: null },
  { id: 8, name: 'RMX VD40 10.5도 Speeder NX for Yamaha M423i', price: '가격문의', image: null },
  { id: 9, name: 'RMX VD59 10.5 SR Diamana YR', price: '가격문의', image: null },
  { id: 10, name: 'RMX 220 10.5 S Speeder 661 EVOLUTION II', price: '가격문의', image: null },
  { id: 11, name: 'RMX 218 9.5도 디아마나 60 S', price: '가격문의', image: null },
  { id: 12, name: 'RMX 120 9.5 S TMX-420D', price: '가격문의', image: null },
  { id: 13, name: 'DUNLOP XXIO CROSS 10.5도 XXIO MP800 SR', price: '가격문의', image: null },
  { id: 14, name: 'XXIO 12 10.5도 XXIO MP1200 SR', price: '가격문의', image: null },
  { id: 15, name: 'XXIO (2018) 10.5 S MP1000', price: '가격문의', image: null },
  { id: 16, name: '글로레 F2 10.5 R GL3300', price: '가격문의', image: null },
  { id: 17, name: 'COBRA RAD SPEED 10.5도 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null },
  { id: 18, name: 'CT-518 9도 FT15d S', price: '가격문의', image: null }
];

export default function OthersDrivers() {
  return (
    <ProductList 
      title="기타 브랜드 드라이버"
      subtitle="| OTHER BRAND DRIVERS"
      products={othersDrivers}
      totalCount={othersDrivers.length}
      category="기타 드라이버"
    />
  );
}
