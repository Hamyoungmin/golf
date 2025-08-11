'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string | null;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation();

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (product.price === '가격문의') {
      alert('가격 문의 상품은 장바구니에 담을 수 없습니다.');
      return;
    }

    try {
      // 가격을 숫자로 변환 (예: "450,000원" -> 450000)
      const numericPrice = parseInt(product.price.replace(/[^0-9]/g, '')) || 0;
      
      if (numericPrice === 0) {
        alert('상품 가격 정보가 올바르지 않습니다.');
        return;
      }

      await addToCartContext(product.id.toString(), 1, numericPrice);
      alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation();

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (product.price === '가격문의') {
      alert('상품 문의는 고객센터(전화)로 연락주세요.');
      return;
    }

    // 바로 구매 로직 (추후 구현)
    router.push('/checkout');
  };

  return (
    <div className="product-card" style={{ position: 'relative', cursor: 'pointer' }}>
      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-image">
          {product.image ? (
            <Image 
              src={product.image} 
              alt={product.name}
              width={250}
              height={200}
              style={{objectFit: 'cover'}}
            />
          ) : (
            <span>이미지 없음</span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-price">{product.price}</p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginTop: '10px',
            fontSize: '14px',
            color: '#666'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              0
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              0
            </span>
          </div>
        </div>
      </Link>
      
      {/* 구매 버튼들 - 가격문의 상품은 버튼 표시 안함 */}
      {product.price !== '가격문의' && (
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '15px',
          right: '15px',
          display: 'flex',
          gap: '8px',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }} className="purchase-buttons">
          {/* 장바구니 버튼 */}
          <div style={{
            flex: 1,
            border: '2px solid #dc3545',
            borderRadius: '8px',
            backgroundColor: '#dc3545',
            padding: '1px'
          }}>
            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
            >
              🛒
            </button>
          </div>
          
          {/* 바로 구매 버튼 */}
          <div style={{
            flex: 1,
            border: '2px solid #007bff',
            borderRadius: '8px',
            backgroundColor: '#007bff',
            padding: '1px'
          }}>
            <button
              onClick={handleBuyNow}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                pointerEvents: 'auto'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              구매
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
