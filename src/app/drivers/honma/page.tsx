import ProductList from '@/components/ProductList';

const honmaDrivers = [
  { id: 1, name: 'TW757 TYPE-S 9도 VIZARD FP-7', price: '가격문의', image: null },
  { id: 2, name: 'TW747 460 9.5도 VIZARD FP-6', price: '가격문의', image: null },
  { id: 3, name: 'TW747 455 9.5도 VIZARD FP-6', price: '가격문의', image: null },
  { id: 4, name: 'TW737 P 5~P NSPRO 950GH', price: '가격문의', image: null },
  { id: 5, name: 'TW737 455 9.5도 비자드 S', price: '가격문의', image: null },
  { id: 6, name: 'TW737 455 10.5도 65 S', price: '가격문의', image: null },
  { id: 7, name: 'TW747 VX 4~P NSPRO 950GH', price: '가격문의', image: null },
  { id: 8, name: 'BERES NX 10.5도 ARMRQ 43 4-STAR', price: '가격문의', image: null },
  { id: 9, name: 'BERES S-06 9.5도 ARMRQ X 43 S', price: '가격문의', image: null },
  { id: 10, name: 'Be ZEAL 525 10.5도 VIZARD for Be ZEAL S', price: '가격문의', image: null }
];

export default function HonmaDrivers() {
  return (
    <ProductList 
      title="혼마 드라이버"
      subtitle="| HONMA DRIVERS"
      products={honmaDrivers}
      totalCount={honmaDrivers.length}
      category="혼마 드라이버"
    />
  );
}
