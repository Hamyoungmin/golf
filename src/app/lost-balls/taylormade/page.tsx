import ProductList from '@/components/ProductList';

const taylormadeProducts = [
  { id: 1, name: '테일러메이드 TP5 로스트볼', price: '가격문의', image: null },
  { id: 2, name: '테일러메이드 TP5x 로스트볼', price: '가격문의', image: null },
  { id: 3, name: '테일러메이드 Tour Response 로스트볼', price: '가격문의', image: null },
  { id: 4, name: '테일러메이드 Soft Response 로스트볼', price: '가격문의', image: null },
  { id: 5, name: '테일러메이드 Distance+ 로스트볼', price: '가격문의', image: null },
  { id: 6, name: '테일러메이드 Project (a) 로스트볼', price: '가격문의', image: null },
  { id: 7, name: '테일러메이드 RBZ Soft 로스트볼', price: '가격문의', image: null },
  { id: 8, name: '테일러메이드 Burner 로스트볼', price: '가격문의', image: null }
];

export default function TaylormadeLostBalls() {
  return (
    <ProductList 
      title="테일러메이드"
      subtitle="| TAYLORMADE LOST BALLS"
      products={taylormadeProducts}
      totalCount={32}
      category="테일러메이드 로스트볼"
    />
  );
}
