import ProductList from '@/components/ProductList';

const bridgestoneWedges = [
  { id: 1, name: 'TOUR B BRM 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 2, name: 'TOUR B BRM 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 3, name: 'TOUR B BRM 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 4, name: 'TOUR B WG 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 5, name: 'TOUR B WG 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 6, name: 'TOUR B WG 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 7, name: 'J15 WEDGE 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 8, name: 'J15 WEDGE 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 9, name: 'J15 WEDGE 60도 NSPRO 950GH', price: '가격문의', image: null }
];

export default function BridgestoneWedges() {
  return (
    <ProductList 
      title="브리지스톤 웨지"
      subtitle="| BRIDGESTONE WEDGES"
      products={bridgestoneWedges}
      totalCount={bridgestoneWedges.length}
      category="브리지스톤 웨지"
    />
  );
}
