import ProductList from '@/components/ProductList';

const othersWedges = [
  { id: 1, name: 'PING GLIDE 4.0 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 2, name: 'PING GLIDE 4.0 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 3, name: 'PING GLIDE 4.0 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 4, name: 'MIZUNO T22 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 5, name: 'MIZUNO T22 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 6, name: 'MIZUNO T22 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 7, name: 'CLEVELAND RTX4 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 8, name: 'CLEVELAND RTX4 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 9, name: 'CLEVELAND RTX4 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 10, name: 'YAMAHA RMX WEDGE 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 11, name: 'YAMAHA RMX WEDGE 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 12, name: 'YAMAHA RMX WEDGE 60도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 13, name: 'COBRA KING WEDGE 52도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 14, name: 'COBRA KING WEDGE 56도 NSPRO 950GH', price: '가격문의', image: null },
  { id: 15, name: 'COBRA KING WEDGE 60도 NSPRO 950GH', price: '가격문의', image: null }
];

export default function OthersWedges() {
  return (
    <ProductList 
      title="기타 브랜드 웨지"
      subtitle="| OTHER BRAND WEDGES"
      products={othersWedges}
      totalCount={othersWedges.length}
      category="기타 웨지"
    />
  );
}
