import ProductList from '@/components/ProductList';

const leftHandedProducts = [
  { id: 1, name: 'TaylorMade SIM2 Left 드라이버', price: '가격문의', image: null },
  { id: 2, name: '캘러웨이 엘리트 10.5도', price: '600,000원', image: '/z1.jpg' }
];

export default function LeftHanded() {
  return (
    <ProductList 
      title="왼손용"
      subtitle="| Left Handed"
      products={leftHandedProducts}
      totalCount={2}
      category="왼손용"
    />
  );
}
