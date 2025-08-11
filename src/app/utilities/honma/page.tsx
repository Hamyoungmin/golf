import ProductList from '@/components/ProductList';

const honmaUtilities = [
  { id: 1, name: 'TW757 TYPE-S U3 21도 VIZARD FP-7', price: '가격문의', image: null },
  { id: 2, name: 'TW747 U3 21도 VIZARD FP-6', price: '가격문의', image: null },
  { id: 3, name: 'TW737 U3 21도 비자드 S', price: '가격문의', image: null },
  { id: 4, name: 'BERES NX U3 21도 ARMRQ 43 4-STAR', price: '가격문의', image: null },
  { id: 5, name: 'BERES S-06 U3 21도 ARMRQ X 43 S', price: '가격문의', image: null },
  { id: 6, name: 'Be ZEAL 525 U3 21도 VIZARD for Be ZEAL S', price: '가격문의', image: null },
  { id: 7, name: 'TW747 VX U3 21도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 8, name: 'TW717 455 U3 21도 비자드 55 R', price: '가격문의', image: null },
  { id: 9, name: 'TW737 P U3 21도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 10, name: 'BERES U4 24도 ARMRQ 43 4-STAR', price: '가격문의', image: null }
];

export default function HonmaUtilities() {
  return (
    <ProductList 
      title="혼마 유틸리티"
      subtitle="| HONMA UTILITIES"
      products={honmaUtilities}
      totalCount={honmaUtilities.length}
      category="혼마 유틸리티"
    />
  );
}
