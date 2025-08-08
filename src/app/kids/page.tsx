import ProductList from '@/components/ProductList';

const kidsProducts = [
  { id: 1, name: 'US Kids 주니어 세트 (5-7세)', price: '가격문의', image: null },
  { id: 2, name: 'Callaway XJ Junior 세트', price: '가격문의', image: null },
  { id: 3, name: 'TaylorMade Rory Junior 세트', price: '가격문의', image: null },
  { id: 4, name: 'PING Moxie Junior 세트', price: '가격문의', image: null },
  { id: 5, name: 'Wilson Profile Junior 세트', price: '가격문의', image: null },
  { id: 6, name: 'Cobra Kids FLY-Z 세트', price: '가격문의', image: null },
  { id: 7, name: 'Junior 퍼터 (26인치)', price: '가격문의', image: null },
  { id: 8, name: 'Junior 드라이버 (우드)', price: '가격문의', image: null },
  { id: 9, name: 'Junior 아이언 (7,9번)', price: '가격문의', image: null },
  { id: 10, name: 'Junior 골프백 세트', price: '가격문의', image: null }
];

export default function Kids() {
  return (
    <ProductList 
      title="키즈"
      subtitle="| Kids"
      products={kidsProducts}
      totalCount={12}
      category="키즈"
    />
  );
}
