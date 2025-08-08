import ProductList from '@/components/ProductList';

const leftHandedProducts = [
  { id: 1, name: 'TaylorMade SIM2 Left 드라이버', price: '가격문의', image: null },
  { id: 2, name: 'Callaway EPIC Left 아이언 세트', price: '가격문의', image: null },
  { id: 3, name: 'PING G425 Left 하이브리드', price: '가격문의', image: null },
  { id: 4, name: 'Titleist T300 Left 아이언', price: '가격문의', image: null },
  { id: 5, name: 'Cobra SPEEDZONE Left 드라이버', price: '가격문의', image: null },
  { id: 6, name: 'Mizuno JPX Left 아이언 세트', price: '가격문의', image: null },
  { id: 7, name: 'SCOTTY CAMERON Left 퍼터', price: '가격문의', image: null },
  { id: 8, name: 'Srixon Z785 Left 드라이버', price: '가격문의', image: null },
  { id: 9, name: 'Wilson Staff Left 웨지', price: '가격문의', image: null },
  { id: 10, name: 'Honma T//WORLD Left 아이언', price: '가격문의', image: null }
];

export default function LeftHanded() {
  return (
    <ProductList 
      title="왼손용"
      subtitle="| Left Handed"
      products={leftHandedProducts}
      totalCount={15}
      category="왼손용"
    />
  );
}
