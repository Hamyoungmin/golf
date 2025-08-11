import ProductList from '@/components/ProductList';

const titleistPutters = [
  { id: 1, name: 'Scotty Cameron Newport 2 스틸샤프트', price: '가격문의', image: null },
  { id: 2, name: 'Scotty Cameron Newport 2.5 스틸샤프트', price: '가격문의', image: null },
  { id: 3, name: 'Scotty Cameron Studio Select Newport 2 스틸샤프트', price: '가격문의', image: null },
  { id: 4, name: 'Scotty Cameron Select Newport 3 스틸샤프트', price: '가격문의', image: null },
  { id: 5, name: 'Scotty Cameron Futura X5 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 6, name: 'Scotty Cameron Phantom X 5.5 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 7, name: 'Scotty Cameron Special Select Newport 2 스틸샤프트', price: '가격문의', image: null },
  { id: 8, name: 'Scotty Cameron GoLo 5 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 9, name: 'Scotty Cameron Phantom X 12.5 말렛 스틸샤프트', price: '가격문의', image: null },
  { id: 10, name: 'Scotty Cameron T5W 말렛 스틸샤프트', price: '가격문의', image: null }
];

export default function TitleistPutters() {
  return (
    <ProductList 
      title="타이틀리스트 퍼터"
      subtitle="| TITLEIST PUTTERS"
      products={titleistPutters}
      totalCount={titleistPutters.length}
      category="타이틀리스트 퍼터"
    />
  );
}
