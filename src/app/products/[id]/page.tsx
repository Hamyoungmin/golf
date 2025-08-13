'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct } from '@/lib/products';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

// 임시 샘플 상품 데이터 (실제로는 Firebase에서 가져와야 함)
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'TW717 455 10.5도 비자드 55 R',
    price: '가격문의',
    category: 'drivers',
    brand: 'titleist',
    images: ['https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=600&h=400&fit=crop'],
    description: '타이틀리스트의 프리미엄 드라이버입니다. 최신 기술이 적용된 고성능 골프 클럽으로, 정확성과 비거리를 동시에 만족시켜줍니다.',
    stock: 5,
    specifications: {
      '로프트': '10.5도',
      '샤프트': '비자드 55',
      '플렉스': 'R',
      '클럽 길이': '45인치',
      '헤드 볼륨': '455cc'
    },
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Callaway Epic Speed 드라이버',
    price: '450,000원',
    category: 'drivers',
    brand: 'callaway',
    images: ['https://images.unsplash.com/photo-1593111774240-d529f12af4ce?w=600&h=400&fit=crop'],
    description: '캘러웨이의 혁신적인 Epic Speed 드라이버입니다. 탁월한 관용성과 비거리를 제공합니다.',
    stock: 3,
    specifications: {
      '로프트': '9도',
      '샤프트': 'Aldila NV',
      '플렉스': 'S',
      '클럽 길이': '45.5인치',
      '헤드 볼륨': '460cc'
    },
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'TaylorMade Stealth 드라이버',
    price: '가격문의',
    category: 'drivers',
    brand: 'taylormade',
    images: ['https://images.unsplash.com/photo-1551524164-8cf2ac531c3b?w=600&h=400&fit=crop'],
    description: '테일러메이드의 최신 Stealth 드라이버입니다. 카본 페이스가 적용된 혁신적인 드라이버로, 최대 비거리를 실현합니다.',
    stock: 2,
    specifications: {
      '로프트': '9.5도',
      '샤프트': 'TENSEI RED TM50',
      '플렉스': 'S',
      '클럽 길이': '45.75인치',
      '헤드 볼륨': '460cc'
    },
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'PING G430 MAX 드라이버',
    price: '가격문의',
    category: 'drivers',
    brand: 'ping',
    images: ['https://images.unsplash.com/photo-1593111774240-d529f12af4ce?w=600&h=400&fit=crop'],
    description: 'PING의 최신 G430 MAX 드라이버입니다. 뛰어난 관용성과 안정성을 제공하며, 모든 레벨의 골퍼에게 적합합니다.',
    stock: 4,
    specifications: {
      '로프트': '10.5도',
      '샤프트': 'PING TOUR 65',
      '플렉스': 'R',
      '클럽 길이': '45.25인치',
      '헤드 볼륨': '460cc'
    },
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Honma TW757 드라이버',
    price: '가격문의',
    category: 'drivers',
    brand: 'honma',
    images: ['https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=600&h=400&fit=crop'],
    description: '혼마의 프리미엄 TW757 드라이버입니다. 정교한 일본 장인정신이 담긴 최고급 골프 클럽입니다.',
    stock: 1,
    specifications: {
      '로프트': '9도',
      '샤프트': 'VIZARD FP-7',
      '플렉스': 'S',
      '클럽 길이': '45인치',
      '헤드 볼륨': '455cc'
    },
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// 더 많은 ID에 대응하기 위한 동적 상품 생성 함수
const generateProduct = (id: string): Product => {
  const productId = parseInt(id) || 1; // NaN일 경우 1로 기본값 설정
  const brands = ['titleist', 'callaway', 'taylormade', 'ping', 'honma', 'bridgestone'];
  const categories = ['drivers', 'irons', 'putters', 'wedges', 'woods', 'utilities'];
  const brand = brands[Math.abs(productId) % brands.length];
  const category = categories[Math.abs(productId) % categories.length];
  
  return {
    id,
    name: `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${category.charAt(0).toUpperCase() + category.slice(1)} ${productId}`,
    price: '가격문의',
    category,
    brand,
    images: [`https://images.unsplash.com/photo-155152416${Math.abs(productId) % 10}-6cf2ac531c3b?w=600&h=400&fit=crop`],
    description: `${brand.charAt(0).toUpperCase() + brand.slice(1)} 브랜드의 고품질 ${category} 제품입니다. 뛰어난 성능과 품질을 자랑하는 골프 클럽입니다.`,
    stock: Math.max(1, Math.abs(productId) % 6),
    specifications: {
      '로프트': `${9 + (Math.abs(productId) % 4)}도`,
      '샤프트': `샤프트 ${Math.abs(productId) % 5 + 1}`,
      '플렉스': ['R', 'S', 'SR', 'X'][Math.abs(productId) % 4],
      '클럽 길이': `${44 + (Math.abs(productId) % 3)}인치`
    },
    isWomens: false,
    isKids: false,
    isLeftHanded: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!params.id) return;
        
        // 실제 구현에서는 getProduct(params.id as string) 사용
        // 현재는 샘플 데이터 사용
        let foundProduct = sampleProducts.find(p => p.id === params.id);
        
        if (!foundProduct) {
          // 샘플 데이터에 없으면 동적으로 생성
          foundProduct = generateProduct(params.id as string);
        }
        
        setProduct(foundProduct);
        
        // 로그인한 사용자인 경우 최근 본 상품에 추가
        if (user && foundProduct) {
          try {
            await addToRecentlyViewed(foundProduct.id);
          } catch (error) {
            console.error('최근 본 상품 추가 오류:', error);
            // 최근 본 상품 추가 실패는 전체 페이지 로드를 방해하지 않음
          }
        }
      } catch (err) {
        console.error('상품 조회 오류:', err);
        setError('상품을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, user, addToRecentlyViewed]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!product || product.stock === 0) {
      alert('재고가 부족합니다.');
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

      await addToCartContext(product.id, quantity, numericPrice);
      alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      alert('장바구니 추가 중 오류가 발생했습니다.');
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!product || product.stock === 0) {
      alert('재고가 부족합니다.');
      return;
    }

    // 바로 구매 로직 (추후 구현)
    router.push('/checkout');
  };

  const handleContactInquiry = () => {
    alert('상품 문의는 고객센터(전화)로 연락주세요.');
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!product) return;

    try {
      if (isInWishlist(product.id)) {
        const success = await removeFromWishlist(product.id);
        if (success) {
          alert('관심상품에서 제거되었습니다.');
        } else {
          alert('관심상품 제거 중 오류가 발생했습니다.');
        }
      } else {
        const success = await addToWishlist(product.id);
        if (success) {
          alert('관심상품에 추가되었습니다.');
        } else {
          alert('관심상품 추가 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('위시리스트 토글 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">상품 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">오류 발생</h2>
          <p className="mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
          <Link 
            href="/" 
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '40px' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 상품 이미지 */}
        <div>
          <div className="mb-4">
            <img
              src={product.images[selectedImage] || 'https://images.unsplash.com/photo-1551524164-6cf2ac531c3b?w=600&h=400&fit=crop'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg border"
            />
          </div>
          
          {/* 이미지 썸네일 */}
          {product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 border-2 rounded ${
                    selectedImage === index ? 'border-orange-500' : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.brand} | {product.category}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="mb-6">
            <span className="text-3xl font-bold text-orange-600">
              {product.price}
            </span>
            {product.stock === 0 && (
              <span className="ml-4 text-red-500 font-semibold">품절</span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="ml-4 text-orange-500 text-sm">
                재고 {product.stock}개 남음
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* 상품 사양 */}
          {Object.keys(product.specifications).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">상품 사양</h3>
              <div className="bg-gray-50 p-4 rounded">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-gray-200 last:border-b-0">
                    <span className="font-medium">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 수량 선택 및 구매 옵션 */}
          <div className="mb-6 bg-gray-50 p-6 rounded-lg">
            {/* 수량 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-3">수량 선택</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 font-semibold"
                  disabled={quantity <= 1 || product.price === '가격문의'}
                >
                  -
                </button>
                <span className="w-20 text-center border border-gray-300 rounded-lg py-2 bg-white font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 font-semibold"
                  disabled={quantity >= product.stock || product.price === '가격문의'}
                >
                  +
                </button>
              </div>
            </div>

            {/* 찜하기 버튼 */}
            <div className="mb-4">
              <button
                onClick={handleWishlistToggle}
                className={`w-full py-3 px-6 rounded-lg text-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isInWishlist(product.id)
                    ? 'bg-pink-500 text-white hover:bg-pink-600 border-2 border-pink-600'
                    : 'bg-white text-pink-600 hover:bg-pink-50 border-2 border-pink-300 hover:border-pink-400'
                }`}
              >
                <svg 
                  className={`w-6 h-6 transition-transform duration-300 ${isInWishlist(product.id) ? 'scale-110' : ''}`}
                  fill={isInWishlist(product.id) ? 'currentColor' : 'none'} 
                  stroke={isInWishlist(product.id) ? 'none' : 'currentColor'} 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <span>
                  {isInWishlist(product.id) ? '관심상품에서 제거' : '관심상품에 추가'}
                </span>
              </button>
            </div>

            {/* 구매 버튼들 */}
            <div className="space-y-4">
              {/* 가격문의 버튼 (가격문의 상품인 경우만) */}
              {product.price === '가격문의' && (
                <button
                  onClick={handleContactInquiry}
                  className="w-full bg-gray-500 text-white py-4 px-6 rounded-lg text-lg font-bold hover:bg-gray-600 transition-colors"
                >
                  가격 문의하기
                </button>
              )}
              
              {/* 메인 구매 버튼들 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 바로 구매 버튼 */}
                <div className="border-2 border-blue-700 rounded-lg bg-blue-600 p-1">
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0 || product.price === '가격문의'}
                    className="w-full bg-blue-500 text-black py-5 px-6 rounded-md text-lg font-bold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    title={product.price === '가격문의' ? '가격 문의 후 이용 가능합니다' : ''}
                  >
                    <span>바로 구매</span>
                  </button>
                </div>
                
                {/* 장바구니 버튼 */}
                <div className="border-2 border-red-700 rounded-lg bg-red-600 p-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || product.price === '가격문의'}
                    className="w-full bg-red-500 text-black py-5 px-6 rounded-md text-lg font-bold hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    title={product.price === '가격문의' ? '가격 문의 후 이용 가능합니다' : ''}
                  >
                    <span>장바구니</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 배송비: 3만원 이상 구매 시 무료배송</p>
              <p>• 배송기간: 주문 후 2-3일 내 배송</p>
              <p>• 문의사항은 고객센터로 연락주세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
