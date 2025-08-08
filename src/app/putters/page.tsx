import ProductList from '@/components/ProductList';

const putterProducts = [
  { id: 1, name: 'SCOTTY CAMERON Newport 2', price: '가격문의', image: null },
  { id: 2, name: 'PING ANSER 2', price: '가격문의', image: null },
  { id: 3, name: 'TaylorMade Spider Tour', price: '가격문의', image: null },
  { id: 4, name: 'Odyssey WHITE HOT OG', price: '가격문의', image: null },
  { id: 5, name: 'SCOTTY CAMERON Special Select', price: '가격문의', image: null },
  { id: 6, name: 'PING PLD Milled', price: '가격문의', image: null },
  { id: 7, name: 'TaylorMade TP Collection', price: '가격문의', image: null },
  { id: 8, name: 'Odyssey Tri-Hot 5K', price: '가격문의', image: null },
  { id: 9, name: 'SCOTTY CAMERON Phantom X', price: '가격문의', image: null },
  { id: 10, name: 'PING Heppler', price: '가격문의', image: null }
];

export default function Putters() {
  return (
    <ProductList 
      title="퍼터"
      subtitle="| Putters"
      products={putterProducts}
      totalCount={45}
      category="퍼터"
    />
  );
}
