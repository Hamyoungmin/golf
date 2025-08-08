import ProductList from '@/components/ProductList';

const wedgeProducts = [
  { id: 1, name: 'SM9 52도 10 DG S400', price: '가격문의', image: null },
  { id: 2, name: 'SM8 56도 14 DG S200', price: '가격문의', image: null },
  { id: 3, name: 'RTX4 60도 9 NS 950 S', price: '가격문의', image: null },
  { id: 4, name: 'JAWS RAW 58도 12 KBS Hi-Rev 2.0', price: '가격문의', image: null },
  { id: 5, name: 'CBX 50도 8 DG S300', price: '가격문의', image: null },
  { id: 6, name: 'SM7 54도 12 DG S300', price: '가격문의', image: null },
  { id: 7, name: 'RTX ZIPCORE 56도 14 NS 950 S', price: '가격문의', image: null },
  { id: 8, name: 'GLIDE 3.0 58도 10 DG S200', price: '가격문의', image: null },
  { id: 9, name: 'SM8 60도 8 DG X100', price: '가격문의', image: null },
  { id: 10, name: 'JAWS MD5 52도 12 KBS Hi-Rev', price: '가격문의', image: null },
  { id: 11, name: 'RTX4 54도 10 NS 950 S', price: '가격문의', image: null },
  { id: 12, name: 'SM9 58도 12 DG S400', price: '가격문의', image: null },
  { id: 13, name: 'CBX2 56도 14 DG AMT', price: '가격문의', image: null },
  { id: 14, name: 'GLIDE 2.0 60도 12 KBS 120', price: '가격문의', image: null },
  { id: 15, name: 'RTX ZIPCORE 50도 8 DG S300', price: '가격문의', image: null },
  { id: 16, name: 'SM7 60도 10 DG S200', price: '가격문의', image: null },
  { id: 17, name: 'JAWS RAW 54도 14 NS 950', price: '가격문의', image: null },
  { id: 18, name: 'CBX 58도 12 DG S400', price: '가격문의', image: null },
  { id: 19, name: 'SM8 50도 12 DG S300', price: '가격문의', image: null },
  { id: 20, name: 'RTX4 58도 8 KBS Hi-Rev', price: '가격문의', image: null }
];

export default function Wedges() {
  return (
    <ProductList 
      title="웨지"
      subtitle="| Wedges"
      products={wedgeProducts}
      totalCount={78}
      category="웨지"
    />
  );
}
