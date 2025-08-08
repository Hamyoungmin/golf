import ProductList from '@/components/ProductList';

const ironProducts = [
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
  { id: 12, name: 'P790 4~P KBS 120 S', price: '가격문의', image: null },
  { id: 13, name: 'AP2 716 4~P 다골 AMT S300', price: '가격문의', image: null },
  { id: 14, name: 'JPX919 HOT METAL 5~P 950GH R', price: '가격문의', image: null },
  { id: 15, name: 'T200 5~P,48 다골 AMT RED S300', price: '가격문의', image: null },
  { id: 16, name: 'SIM2 MAX 5~P,AW 벤타스 6 S', price: '가격문의', image: null },
  { id: 17, name: 'G425 4~P,UW NS 950 S', price: '가격문의', image: null },
  { id: 18, name: 'RMX218 5~P,AW 모듀스 120 S', price: '가격문의', image: null },
  { id: 19, name: 'CB 718 4~P KBS 130 X', price: '가격문의', image: null },
  { id: 20, name: 'MP18 MMC 4~P DG 120 S300', price: '가격문의', image: null }
];

export default function Irons() {
  return (
    <ProductList 
      title="아이언"
      subtitle="| Irons"
      products={ironProducts}
      totalCount={156}
      category="아이언"
    />
  );
}
