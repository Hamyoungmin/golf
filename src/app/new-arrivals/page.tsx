import ProductList from '@/components/ProductList';

const newArrivalProducts = [
  { id: 1, name: '716CB 4~P 모듀스 120 X', price: '가격문의', image: null },
  { id: 2, name: 'mp54 5~P 다골 R400', price: '가격문의', image: null },
  { id: 3, name: 'V FORGED 5~P(6I) 950R', price: '가격문의', image: null },
  { id: 4, name: 'MP700 4~P (7I) 920 S', price: '가격문의', image: null },
  { id: 5, name: 'MP700 5~P (6I) 920 S', price: '가격문의', image: null },
  { id: 6, name: 'MP700 5~P,A,S 920 GH', price: '가격문의', image: null },
  { id: 7, name: 'T300 5~P,48 쿠로카게 60 I', price: '가격문의', image: null },
  { id: 8, name: '714AP2 5~P(6I) 950S', price: '가격문의', image: null },
  { id: 9, name: '712AP2 4~P(6I) 투어이슈 X100', price: '가격문의', image: null },
  { id: 10, name: 'Z725 5~P (6I) 950S', price: '가격문의', image: null },
  { id: 11, name: 'led포지드 4~P 950R', price: '가격문의', image: null },
  { id: 12, name: 'TW717 455 10.5도 비자드 55 R', price: '가격문의', image: null },
  { id: 13, name: 'TR20 9.5도 비자드 43 S', price: '가격문의', image: null },
  { id: 14, name: '703리미티드 9.5도 TRPX FLEX SX', price: '가격문의', image: null },
  { id: 15, name: '703 8.5도 디아마나 7S', price: '가격문의', image: null },
  { id: 16, name: 'KING F6 10.5도 5S', price: '가격문의', image: null },
  { id: 17, name: 'RMX216 10.5도 바사라 R', price: '가격문의', image: null },
  { id: 18, name: 'Z545 9.5도 RX-45 S', price: '가격문의', image: null },
  { id: 19, name: '투어B JGR 10.5도 TG2-5 SR', price: '가격문의', image: null },
  { id: 20, name: '투어B XD-3 9.5도 TX1 - 6S', price: '가격문의', image: null }
];

export default function NewArrivals() {
  return (
    <ProductList 
      title="신상품"
      subtitle="| NEW PRODUCTS"
      products={newArrivalProducts}
      totalCount={138}
      category="신규입고"
    />
  );
}
