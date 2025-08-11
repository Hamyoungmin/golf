import ProductList from '@/components/ProductList';

const honmaLeftHanded = [
  { id: 1, name: 'TW757 TYPE-S 9.5도 왼손용 VIZARD FP-7', price: '가격문의', image: null },
  { id: 2, name: 'TW747 460 10.5도 왼손용 VIZARD FP-6', price: '가격문의', image: null },
  { id: 3, name: 'TW747 455 9.5도 왼손용 VIZARD FP-6', price: '가격문의', image: null },
  { id: 4, name: 'TW737 455 9.5도 왼손용 비자드 S', price: '가격문의', image: null },
  { id: 5, name: 'TW737 460 10.5도 왼손용 SR', price: '가격문의', image: null },
  { id: 6, name: 'BERES NX 10.5도 왼손용 ARMRQ 43 4-STAR', price: '가격문의', image: null },
  { id: 7, name: 'BERES S-06 10.5도 왼손용 ARMRQ X 43 S', price: '가격문의', image: null },
  { id: 8, name: 'Be ZEAL 525 10.5도 왼손용 VIZARD for Be ZEAL S', price: '가격문의', image: null },
  { id: 9, name: 'TW-PT01 왼손용 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 10, name: 'TW-W 56도 왼손용 NSPRO 950GH', price: '가격문의', image: null },
  { id: 11, name: 'TW747 VX 15도 왼손용 NSPRO 950GH', price: '가격문의', image: null },
  { id: 12, name: 'TW757 IRON 6-P 왼손용 NSPRO 950GH', price: '가격문의', image: null }
];

export default function HonmaLeftHanded() {
  return (
    <ProductList 
      title="혼마 왼손용"
      subtitle="| HONMA LEFT-HANDED"
      products={honmaLeftHanded}
      totalCount={honmaLeftHanded.length}
      category="혼마 왼손용"
    />
  );
}
