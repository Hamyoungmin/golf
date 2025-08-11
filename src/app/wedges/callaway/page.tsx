import ProductList from '@/components/ProductList';

const callawayWedges = [
  { id: 1, name: 'JAWS RAW 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 2, name: 'JAWS RAW 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 3, name: 'JAWS RAW 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 4, name: 'MACK DADDY CB 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 5, name: 'MACK DADDY CB 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 6, name: 'MACK DADDY CB 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 7, name: 'MACK DADDY 4 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 8, name: 'MACK DADDY 4 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 9, name: 'MACK DADDY 4 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 10, name: 'PM GRIND 58도 NSPRO 950GH', price: '가격문의', image: null }
];

export default function CallawayWedges() {
  return (
    <ProductList 
      title="캘러웨이 웨지"
      subtitle="| CALLAWAY WEDGES"
      products={callawayWedges}
      totalCount={callawayWedges.length}
      category="캘러웨이 웨지"
    />
  );
}
