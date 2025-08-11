import ProductList from '@/components/ProductList';

export default function KidsPage() {
  const products = [
    {
      id: 1,
      name: "주니어 골프세트 1",
      price: "64,000원",
      image: "https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "주니어 골프세트 2",
      price: "80,000원",
      image: "https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="category-page">
      <ProductList 
        title="주니어용"
        subtitle="아이들을 위한 전용 골프 용품을 만나보세요"
        products={products}
        totalCount={products.length}
        category="주니어용"
      />
    </div>
  );
}
