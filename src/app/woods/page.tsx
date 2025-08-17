import ProductList from '@/components/ProductList';

const woodProducts = [
  { id: 1, name: '타이틀리스트 917 우드', price: '150,000원', image: '/o2.png' },
  { id: 2, name: 'RMX218 15도 모듀스 120 X', price: '가격문의', image: null },
  { id: 3, name: 'G425 MAX 15도 알타 CB 60 SR', price: '가격문의', image: null },
  { id: 4, name: 'SIM MAX 15도 벤타스 TR 6 S', price: '가격문의', image: null },
  { id: 5, name: 'MAVRIK 18도 Project X 6.0', price: '가격문의', image: null },
  { id: 6, name: 'M6 19도 퓨젼 4 S', price: '가격문의', image: null },
  { id: 7, name: 'RMX216 18도 바사라 S', price: '가격문의', image: null },
  { id: 8, name: 'G410 21도 알타 CB 65 S', price: '가격문의', image: null },
  { id: 9, name: 'TW737 18도 투어AD 7S', price: '가격문의', image: null },
  { id: 10, name: 'SIM 19도 텐세이 AV 75 S', price: '가격문의', image: null },
  { id: 11, name: 'RMX118 15도 투어AD MJ 7S', price: '가격문의', image: null },
  { id: 12, name: 'KING F9 SPEEDBACK 15도 퓨젼 5 S', price: '가격문의', image: null },
  { id: 13, name: 'TW747 455 18도 디아마나 7S', price: '가격문의', image: null },
  { id: 14, name: 'G425 LST 15도 투어 173-65 S', price: '가격문의', image: null },
  { id: 15, name: 'M4 19도 퓨젼 5 SR', price: '가격문의', image: null },
  { id: 16, name: 'RMX220 21도 투어AD DI 7S', price: '가격문의', image: null },
  { id: 17, name: 'SIM2 MAX 18도 벤타스 5 S', price: '가격문의', image: null },
  { id: 18, name: 'STEALTH 19도 텐세이 1K 6S', price: '가격문의', image: null },
  { id: 19, name: 'G430 MAX 15도 알타 CB 60 S', price: '가격문의', image: null },
  { id: 20, name: 'RMX VD 18도 디아마나 70 S', price: '가격문의', image: null }
];

export default function Woods() {
  return (
    <ProductList 
      title="우드"
      subtitle="| Woods"
      products={woodProducts}
      totalCount={20}
      category="우드"
    />
  );
}
