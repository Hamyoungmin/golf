import ProductList from '@/components/ProductList';

export default function IronsPage() {
  const products = [
    {
      id: 1,
      name: "아이언 세트 1",
      price: "120,000원",
      image: "https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "아이언 세트 2",
      price: "160,000원",
      image: "https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="category-page">
      <ProductList 
        title="아이언"
        subtitle="다양한 브랜드의 아이언 클럽을 만나보세요"
        products={products}
        totalCount={products.length}
        category="아이언"
      />
    </div>
  );
}
