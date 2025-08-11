import ProductList from '@/components/ProductList';

const titleistWedges = [
  { id: 1, name: 'Vokey SM9 52도 08 M NSPRO 950GH', price: '가격문의', image: null },
  { id: 2, name: 'Vokey SM9 56도 10 S NSPRO 950GH', price: '가격문의', image: null },
  { id: 3, name: 'Vokey SM9 60도 08 M NSPRO 950GH', price: '가격문의', image: null },
  { id: 4, name: 'Vokey SM8 52도 08 F NSPRO 950GH', price: '가격문의', image: null },
  { id: 5, name: 'Vokey SM8 56도 14 F NSPRO 950GH', price: '가격문의', image: null },
  { id: 6, name: 'Vokey SM8 60도 10 S NSPRO 950GH', price: '가격문의', image: null },
  { id: 7, name: 'Vokey SM7 52도 08 M NSPRO 950GH', price: '가격문의', image: null },
  { id: 8, name: 'Vokey SM7 56도 10 S NSPRO 950GH', price: '가격문의', image: null },
  { id: 9, name: 'Vokey SM7 60도 04 L NSPRO 950GH', price: '가격문의', image: null },
  { id: 10, name: 'Vokey Design 58도 NSPRO 950GH', price: '가격문의', image: null }
];

export default function TitleistWedges() {
  return (
    <ProductList 
      title="타이틀리스트 웨지"
      subtitle="| TITLEIST WEDGES"
      products={titleistWedges}
      totalCount={titleistWedges.length}
      category="타이틀리스트 웨지"
    />
  );
}
