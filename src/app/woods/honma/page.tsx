import ProductList from '@/components/ProductList';

const honmaWoods = [
  { id: 1, name: 'TW757 TYPE-S 15도 VIZARD FP-7', price: '가격문의', image: null },
  { id: 2, name: 'TW747 460 15도 VIZARD FP-6', price: '가격문의', image: null },
  { id: 3, name: 'TW747 455 15도 VIZARD FP-6', price: '가격문의', image: null },
  { id: 4, name: 'TW737 455 15도 비자드 S', price: '가격문의', image: null },
  { id: 5, name: 'TW737 460 15도 SR', price: '가격문의', image: null },
  { id: 6, name: 'BERES NX 15도 ARMRQ 43 4-STAR', price: '가격문의', image: null },
  { id: 7, name: 'BERES S-06 15도 ARMRQ X 43 S', price: '가격문의', image: null },
  { id: 8, name: 'Be ZEAL 525 15도 VIZARD for Be ZEAL S', price: '가격문의', image: null },
  { id: 9, name: 'TW747 VX 15도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 10, name: 'TW717 455 15도 비자드 55 R', price: '가격문의', image: null }
];

export default function HonmaWoods() {
  return (
    <ProductList 
      title="혼마 우드"
      subtitle="| HONMA WOODS"
      products={honmaWoods}
      totalCount={honmaWoods.length}
      category="혼마 우드"
    />
  );
}
