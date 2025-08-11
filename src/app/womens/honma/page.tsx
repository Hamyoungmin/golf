import ProductList from '@/components/ProductList';

const honmaWomens = [
  { id: 1, name: 'TW757 LADIES 11.5도 여성용 VIZARD for TW757 LADIES', price: '가격문의', image: null },
  { id: 2, name: 'TW747 LADIES 11.5도 여성용 VIZARD for TW747 LADIES', price: '가격문의', image: null },
  { id: 3, name: 'BERES LADIES NX 11.5도 여성용 ARMRQ 39 3-STAR', price: '가격문의', image: null },
  { id: 4, name: 'BERES LADIES S-06 11.5도 여성용 ARMRQ X 39 A', price: '가격문의', image: null },
  { id: 5, name: 'Be ZEAL LADIES 525 11.5도 여성용 VIZARD for Be ZEAL LADIES', price: '가격문의', image: null },
  { id: 6, name: 'TW757 LADIES 18도 여성용 VIZARD for TW757 LADIES', price: '가격문의', image: null },
  { id: 7, name: 'BERES LADIES NX 18도 여성용 ARMRQ 39 3-STAR', price: '가격문의', image: null },
  { id: 8, name: 'TW757 LADIES IRON 7-P 여성용 NSPRO 850GH neo', price: '가격문의', image: null },
  { id: 9, name: 'BERES LADIES NX IRON 7-P 여성용 ARMRQ 33 3-STAR', price: '가격문의', image: null },
  { id: 10, name: 'TW757 LADIES U4 24도 여성용 VIZARD for TW757 LADIES', price: '가격문의', image: null },
  { id: 11, name: 'TW-PT LADIES 여성용 말렛 32인치 스틸샤프트', price: '가격문의', image: null },
  { id: 12, name: 'TW-W LADIES 여성용 56도 NSPRO 850GH neo', price: '가격문의', image: null }
];

export default function HonmaWomens() {
  return (
    <ProductList 
      title="혼마 여성용"
      subtitle="| HONMA WOMENS"
      products={honmaWomens}
      totalCount={honmaWomens.length}
      category="혼마 여성용"
    />
  );
}
