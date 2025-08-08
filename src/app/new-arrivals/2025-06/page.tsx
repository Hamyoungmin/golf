import ProductList from '@/components/ProductList';

const june2025Products = [
  { id: 1, name: '25년 6월 신규입고 상품 1', price: '가격문의', image: null },
  { id: 2, name: '25년 6월 신규입고 상품 2', price: '가격문의', image: null },
  { id: 3, name: '25년 6월 신규입고 상품 3', price: '가격문의', image: null },
  { id: 4, name: '25년 6월 신규입고 상품 4', price: '가격문의', image: null },
  { id: 5, name: '25년 6월 신규입고 상품 5', price: '가격문의', image: null },
  { id: 6, name: '25년 6월 신규입고 상품 6', price: '가격문의', image: null },
  { id: 7, name: '25년 6월 신규입고 상품 7', price: '가격문의', image: null },
  { id: 8, name: '25년 6월 신규입고 상품 8', price: '가격문의', image: null },
  { id: 9, name: '25년 6월 신규입고 상품 9', price: '가격문의', image: null },
  { id: 10, name: '25년 6월 신규입고 상품 10', price: '가격문의', image: null }
];

export default function NewArrivals202506() {
  return (
    <ProductList 
      title="25년06월 입고"
      subtitle="| NEW PRODUCTS - JUNE 2025"
      products={june2025Products}
      totalCount={10}
      category="25년06월 신규입고"
    />
  );
}
