import ProductList from '@/components/ProductList';

const taylormadeWedges = [
  { id: 1, name: 'MG3 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 2, name: 'MG3 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 3, name: 'MG3 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 4, name: 'MG2 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 5, name: 'MG2 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 6, name: 'MG2 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 7, name: 'Hi-Toe RAW 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 8, name: 'Hi-Toe RAW 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 9, name: 'Hi-Toe RAW 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 10, name: 'EF 58도 NSPRO 950GH', price: '가격문의', image: null }
];

export default function TaylormadeWedges() {
  return (
    <ProductList 
      title="테일러메이드 웨지"
      subtitle="| TAYLORMADE WEDGES"
      products={taylormadeWedges}
      totalCount={taylormadeWedges.length}
      category="테일러메이드 웨지"
    />
  );
}
