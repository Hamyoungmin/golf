import ProductList from '@/components/ProductList';

const othersWomens = [
  { id: 1, name: 'PING G LE3 여성용 12도 PING ULT 250 L', price: '가격문의', image: null },
  { id: 2, name: 'PING G LE2 여성용 12도 PING ULT 230 UL', price: '가격문의', image: null },
  { id: 3, name: 'G425 MAX 여성용 12도 L ALTA J CB SLATE', price: '가격문의', image: null },
  { id: 4, name: 'G Le2 여성용 12도 L ALTA J CB SLATE', price: '가격문의', image: null },
  { id: 5, name: 'YAMAHA RMX VD LADIES 12도 여성용 Speeder NX for Yamaha LADIES', price: '가격문의', image: null },
  { id: 6, name: 'RMX LADIES 220 12도 여성용 Speeder 461 EVOLUTION LADIES', price: '가격문의', image: null },
  { id: 7, name: 'XXIO LADIES 12 12도 여성용 XXIO MP1200 LADIES', price: '가격문의', image: null },
  { id: 8, name: 'XXIO PRIME LADIES 12도 여성용 XXIO SP-1200 LADIES', price: '가격문의', image: null },
  { id: 9, name: 'COBRA LTDX LADIES 12도 여성용 Fujikura VENTUS Blue 5 A', price: '가격문의', image: null },
  { id: 10, name: 'PING G LE3 여성용 19도 PING ULT 250 L', price: '가격문의', image: null },
  { id: 11, name: 'PING G LE3 IRON 여성용 7-P L PING ULT 250', price: '가격문의', image: null },
  { id: 12, name: 'YAMAHA RMX LADIES IRON 7-P 여성용 Speeder NX for Yamaha LADIES', price: '가격문의', image: null },
  { id: 13, name: 'XXIO LADIES 12 IRON 7-P 여성용 XXIO MP1200 LADIES', price: '가격문의', image: null },
  { id: 14, name: 'PING G LE3 여성용 U4 24도 PING ULT 250 L', price: '가격문의', image: null },
  { id: 15, name: 'PING HEPPLER PIPER C 여성용 말렛 32인치 스틸샤프트', price: '가격문의', image: null },
  { id: 16, name: 'CLEVELAND HUNTINGTON BEACH SOFT 1 여성용 블레이드 32인치', price: '가격문의', image: null },
  { id: 17, name: 'MIZUNO M.CRAFT LADIES III 여성용 블레이드 32인치', price: '가격문의', image: null },
  { id: 18, name: 'PING GLIDE 4.0 여성용 56도 NSPRO 850GH neo', price: '가격문의', image: null },
  { id: 19, name: 'CLEVELAND RTX4 여성용 56도 NSPRO 850GH neo', price: '가격문의', image: null },
  { id: 20, name: 'YAMAHA RMX LADIES WEDGE 56도 여성용 NSPRO 850GH neo', price: '가격문의', image: null }
];

export default function OthersWomens() {
  return (
    <ProductList 
      title="기타 브랜드 여성용"
      subtitle="| OTHER BRAND WOMENS"
      products={othersWomens}
      totalCount={othersWomens.length}
      category="기타 여성용"
    />
  );
}
