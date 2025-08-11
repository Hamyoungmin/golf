import ProductList from '@/components/ProductList';

const honmaWedges = [
  { id: 1, name: 'TW-W 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 2, name: 'TW-W 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 3, name: 'TW-W 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 4, name: 'TW757 WEDGE 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 5, name: 'TW757 WEDGE 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 6, name: 'TW757 WEDGE 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 7, name: 'TW747 WEDGE 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 8, name: 'TW747 WEDGE 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 9, name: 'TW747 WEDGE 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 10, name: 'BERES WEDGE 58도 NSPRO 950GH', price: '가격문의', image: null }
];

export default function HonmaWedges() {
  return (
    <ProductList 
      title="혼마 웨지"
      subtitle="| HONMA WEDGES"
      products={honmaWedges}
      totalCount={honmaWedges.length}
      category="혼마 웨지"
    />
  );
}
