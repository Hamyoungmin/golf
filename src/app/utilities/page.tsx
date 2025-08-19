import ProductList from '@/components/ProductList';

const utilityProducts = [
  { id: 1, name: '핑G425 5번 유틸리티', price: '190,000원', image: '/u1.jpg' },
  { id: 2, name: 'SIM MAX 22도 벤타스 TR 7 S', price: '가격문의', image: null },
  { id: 3, name: 'RMX218 24도 NS 950 S', price: '가격문의', image: null },
  { id: 4, name: 'TW747 24도 디아마나 8S', price: '가격문의', image: null },
  { id: 5, name: 'MAVRIK 21도 Project X 6.0', price: '가격문의', image: null },
  { id: 6, name: 'G410 CROSSOVER 22도 DG 120 S300', price: '가격문의', image: null },
  { id: 7, name: 'RMX116 25도 NS 950 S', price: '가격문의', image: null },
  { id: 8, name: 'SIM2 RESCUE 25도 KBS PGI 85 S', price: '가격문의', image: null },
  { id: 9, name: 'TSi2 21도 텐세이 CK 90 S', price: '가격문의', image: null },
  { id: 10, name: 'G430 CROSSOVER 23도 Project X 6.5', price: '가격문의', image: null },
  { id: 11, name: 'RMX220 26도 모듀스 105 S', price: '가격문의', image: null },
  { id: 12, name: 'STEALTH RESCUE 24도 텐세이 AV 85 S', price: '가격문의', image: null },
  { id: 13, name: 'CBX 22도 DG AMT S300', price: '가격문의', image: null },
  { id: 14, name: 'T-SERIES TS3 23도 Project X 7.0', price: '가격문의', image: null },
  { id: 15, name: 'G425 CROSSOVER 25도 DG 105 S300', price: '가격문의', image: null },
  { id: 16, name: 'SIM MAX OS 26도 벤타스 TR 8 S', price: '가격문의', image: null },
  { id: 17, name: 'RMX VD 24도 투어AD MJ 9S', price: '가격문의', image: null },
  { id: 18, name: 'TSi3 22도 텐세이 CK 100 X', price: '가격문의', image: null },
  { id: 19, name: 'G430 MAX 23도 알타 CB 85 S', price: '가격문의', image: null },
  { id: 20, name: 'KING TOur 25도 KBS $TAPER 130 X', price: '가격문의', image: null }
];

export default function Utilities() {
  return (
    <ProductList 
      title="유틸리티"
      subtitle="| Utilities"
      products={utilityProducts}
      totalCount={20}
      category="유틸리티"
    />
  );
}
