import ProductList from '@/components/ProductList';

const othersPutters = [
  { id: 1, name: '퍼터 핑 ANSER2 34인치', price: '130,000원', image: '/p1.jpg' },
  { id: 2, name: 'PING PLD ANSER 2D 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 3, name: 'PING PLD OSLO 3 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 4, name: 'PING VAULT 2.0 DALE ANSER 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 5, name: 'PING HEPPLER PIPER C 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 6, name: 'PING HEPPLER TOMCAT 14 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 7, name: 'CLEVELAND HUNTINGTON BEACH SOFT 1 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 8, name: 'CLEVELAND TFI 2135 CERO 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 9, name: 'MIZUNO M.CRAFT III 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 10, name: 'MIZUNO M.CRAFT IV 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 11, name: 'YAMAHA RMX PUTTER 01 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 12, name: 'YAMAHA RMX PUTTER 02 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 13, name: 'COBRA KING VINTAGE PUTTER SUPER SPORT 35 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 14, name: 'COBRA KING VINTAGE PUTTER COPPER 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 15, name: 'BETTINARDI INOVAI 2.0 블레이드 스틸샤프트', price: '가격문의', image: null },
  { id: 16, name: 'LAB GOLF DF3 BROOMSTICK PUTTER 말렛 스틸샤프트', price: '가격문의', image: null }
];

export default function OthersPutters() {
  return (
    <ProductList 
      title="기타 브랜드 퍼터"
      subtitle="| OTHER BRAND PUTTERS"
      products={othersPutters}
      totalCount={othersPutters.length}
      category="기타 퍼터"
    />
  );
}
