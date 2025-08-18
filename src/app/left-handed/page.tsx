import ProductList from '@/components/ProductList';

const leftHandedProducts = [
  { id: 1, name: '캘러웨이 엘리트 10.5도', price: '600,000원', image: '/z1.jpg' },
  { id: 2, name: '왼손용 드라이버 LH-002', price: '가격문의', image: null },
  { id: 3, name: '왼손용 페어웨이우드 LH-003', price: '가격문의', image: null },
  { id: 4, name: '왼손용 아이언세트 LH-004', price: '가격문의', image: null },
  { id: 5, name: '왼손용 웨지 LH-005', price: '가격문의', image: null },
  { id: 6, name: '왼손용 퍼터 LH-006', price: '가격문의', image: null },
  { id: 7, name: '왼손용 하이브리드 LH-007', price: '가격문의', image: null },
  { id: 8, name: '왼손용 유틸리티 LH-008', price: '가격문의', image: null },
  { id: 9, name: '왼손용 샌드웨지 LH-009', price: '가격문의', image: null },
  { id: 10, name: '왼손용 칩퍼 LH-010', price: '가격문의', image: null }
];

export default function LeftHanded() {
  return (
    <ProductList 
      title="왼손용"
      subtitle="| Left Handed"
      products={leftHandedProducts}
      totalCount={leftHandedProducts.length}
      category="왼손용"
    />
  );
}