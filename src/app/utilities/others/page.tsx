import ProductList from '@/components/ProductList';

const othersUtilities = [
  { id: 1, name: '핑G425 5번 유틸리티', price: '190,000원', image: '/u1.jpg' },
  { id: 2, name: 'G430 하이브리드 U3 19 Speeder NX 45', price: '가격문의', image: null },
  { id: 3, name: 'G425 크로스 오버 U3 20 S N.S.PRO MODUS3 TOUR 105', price: '가격문의', image: null },
  { id: 4, name: 'G425 하이브리드 U3 19 S ALTA J CB SLATE', price: '가격문의', image: null },
  { id: 5, name: 'G410 CROSSOVER U4 23 S AWT 2.0 LITE', price: '가격문의', image: null },
  { id: 6, name: 'G400 CROSS OVER U4 22 X N.S.PRO MODUS3 SYSTEM3 TOUR 125', price: '가격문의', image: null },
  { id: 7, name: 'PING G425 Crossover 3H PING TOUR 85', price: '가격문의', image: null },
  { id: 8, name: 'RMX (2016) U5 23 S FUBUKI Ai55', price: '가격문의', image: null },
  { id: 9, name: 'RS(2018) U3 19 SR Spec Steel 3 ver2', price: '가격문의', image: null },
  { id: 10, name: 'KING RAD SPEED ONE LENGTH U4 21 SR Tour AD for RADSPEED', price: '가격문의', image: null },
  { id: 11, name: 'YAMAHA RMX VD U3 21도 Diamana ZF 60 S', price: '가격문의', image: null },
  { id: 12, name: 'RMX VD40 U3 21도 Speeder NX for Yamaha M423i', price: '가격문의', image: null },
  { id: 13, name: 'DUNLOP XXIO CROSS U3 21도 XXIO MP800 SR', price: '가격문의', image: null },
  { id: 14, name: 'XXIO 12 U3 21도 XXIO MP1200 SR', price: '가격문의', image: null },
  { id: 15, name: 'COBRA RAD SPEED U3 21도 Fujikura VENTUS Blue 6 R', price: '가격문의', image: null },
  { id: 16, name: 'B-LD 5번 Air Speeder BS-LD A', price: '가격문의', image: null },
  { id: 17, name: 'B-LD 4번 Air Speeder BS-LD A', price: '가격문의', image: null },
  { id: 18, name: 'B-LD 5번 Air Speeder L', price: '가격문의', image: null },
  { id: 19, name: 'B-LD 5번 Air Speeder A', price: '가격문의', image: null }
];

export default function OthersUtilities() {
  return (
    <ProductList 
      title="기타 브랜드 유틸리티"
      subtitle="| OTHER BRAND UTILITIES"
      products={othersUtilities}
      totalCount={othersUtilities.length}
      category="기타 유틸리티"
    />
  );
}
