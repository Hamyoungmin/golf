import ProductList from '@/components/ProductList';

const driverProducts = [
  { id: 1, name: 'TW717 455 10.5도 비자드 55 R', price: '가격문의', image: null },
  { id: 2, name: 'TR20 9.5도 비자드 43 S', price: '가격문의', image: null },
  { id: 3, name: '703리미티드 9.5도 TRPX FLEX SX', price: '가격문의', image: null },
  { id: 4, name: '703 8.5도 디아마나 7S', price: '가격문의', image: null },
  { id: 5, name: 'KING F6 10.5도 5S', price: '가격문의', image: null },
  { id: 6, name: 'RMX216 10.5도 바사라 R', price: '가격문의', image: null },
  { id: 7, name: 'Z545 9.5도 RX-45 S', price: '가격문의', image: null },
  { id: 8, name: '투어B JGR 10.5도 TG2-5 SR', price: '가격문의', image: null },
  { id: 9, name: '투어B XD-3 9.5도 TX1 - 6S', price: '가격문의', image: null },
  { id: 10, name: 'J 015 9.5도 디아마나 BF 6S', price: '가격문의', image: null },
  { id: 11, name: '스트롱럭 420 10.5도 래버 아모드 레디 로클롤 6X', price: '가격문의', image: null },
  { id: 12, name: '온오프 파워트렌치 10도 60 S', price: '가격문의', image: null },
  { id: 13, name: 'RMX218 9.5도 디아마나 60 S', price: '가격문의', image: null },
  { id: 14, name: 'RS F 10.5도 SR', price: '가격문의', image: null },
  { id: 15, name: 'TW737 455 9.5도 비자드 S', price: '가격문의', image: null },
  { id: 16, name: 'TW747 460 10.5도 SR', price: '가격문의', image: null },
  { id: 17, name: 'XR16 10.5도 SR', price: '가격문의', image: null },
  { id: 18, name: 'TOUR B XD-3 9.5도 디아마나BF 6S', price: '가격문의', image: null },
  { id: 19, name: 'GR 10.5도 SR', price: '가격문의', image: null },
  { id: 20, name: 'ROUGR SUBZERO 10.5도 SR', price: '가격문의', image: null }
];

export default function Drivers() {
  return (
    <ProductList 
      title="드라이버"
      subtitle="| Drivers"
      products={driverProducts}
      totalCount={113}
      category="드라이버"
    />
  );
}
