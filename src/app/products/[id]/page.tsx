'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProduct } from '@/lib/products';
import { Product, Review } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { 
  getApprovedReviews, 
  createReview, 
  getProductReviewStats,
  initializeReviews,
  reportReview
} from '@/lib/reviews';
import CustomAlert from '@/components/CustomAlert';

// 임시 샘플 상품 데이터 (실제로는 Firebase에서 가져와야 함)
const sampleProducts: Product[] = [
  {
    id: '1',
    name: '타이틀리스트 917 우드',
    price: '150,000원',
    category: 'woods',
    brand: 'titleist',
    images: ['/o2.png'],
    description: '타이틀리스트의 인기 917 우드입니다. 뛰어난 관용성과 비거리를 제공하며, 다양한 라이에서 안정적인 성능을 보여줍니다. 중상급자부터 프로까지 선호하는 고품질 우드입니다.',
    stock: 3,
    specifications: {
      '로프트': '15도',
      '샤프트': 'Diamana D+ 70',
      '플렉스': 'S',
      '클럽 길이': '42.5인치',
      '헤드 볼륨': '170cc'
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
  
  // 리뷰 관련 상태
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReviewId, setSelectedReportReviewId] = useState<string>('');
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  
  // 알림창 상태
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: '확인',
    cancelText: '취소'
  });

  // 알림창 헬퍼 함수들
  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm',
    message: string,
    title?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setAlert({
      isOpen: true,
      type,
      title: title || '',
      message,
      onConfirm: onConfirm || closeAlert,
      onCancel: onCancel || closeAlert,
      confirmText: type === 'confirm' ? '확인' : '확인',
      cancelText: '취소'
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  // 리뷰 데이터 로드
  const loadReviews = async (productId: string) => {
    try {
      console.log('리뷰 데이터 로드 시작, productId:', productId);
      
      // 초기 리뷰 데이터 생성 (필요시)
      await initializeReviews();
      
      // 해당 상품의 승인된 리뷰들 가져오기
      const productReviews = await getApprovedReviews(productId);
      setReviews(productReviews);
      
      // 리뷰 통계 가져오기
      const stats = await getProductReviewStats(productId);
      setReviewStats(stats);
      
      console.log('리뷰 데이터 로드 완료:', productReviews.length, '개');
    } catch (error) {
      console.error('리뷰 데이터 로드 오류:', error);
    }
  };

  // 리뷰 작성 처리
  const handleSubmitReview = async () => {
    if (!user) {
      showAlert('warning', '리뷰를 작성하려면 로그인이 필요합니다.');
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      showAlert('warning', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!product) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        userName: user.name || '익명',
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        content: reviewForm.content.trim(),
        images: [] // 이미지 업로드 기능은 나중에 추가
      };

      const reviewId = await createReview(reviewData);
      
      if (reviewId) {
        showAlert('success', '리뷰가 성공적으로 작성되었습니다.\n관리자 승인 후 게시됩니다.', '', () => {
          setReviewForm({ rating: 5, title: '', content: '' });
          setShowReviewForm(false);
          loadReviews(product.id); // 리뷰 목록 새로고침
          closeAlert();
        });
      } else {
        showAlert('error', '리뷰 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 작성 오류:', error);
      showAlert('error', '리뷰 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // 리뷰 신고 처리
  const handleReportReview = (reviewId: string) => {
    if (!user) {
      showAlert('warning', '리뷰를 신고하려면 로그인이 필요합니다.');
      return;
    }

    setSelectedReportReviewId(reviewId);
    setReportReason('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!user) {
      showAlert('warning', '로그인이 필요합니다.');
      return;
    }

    if (!reportReason.trim()) {
      showAlert('warning', '신고 사유를 입력해주세요.');
      return;
    }

    setSubmittingReport(true);
    try {
      const success = await reportReview(selectedReportReviewId, reportReason.trim(), user.uid);
      
      if (success) {
        showAlert('success', '리뷰 신고가 접수되었습니다.\n관리자가 검토 후 처리하겠습니다.', '', () => {
          setShowReportModal(false);
          setReportReason('');
          loadReviews(product!.id); // 리뷰 목록 새로고침
          closeAlert();
        });
      } else {
        showAlert('error', '리뷰 신고에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 신고 오류:', error);
      showAlert('error', '리뷰 신고 중 오류가 발생했습니다.');
    } finally {
      setSubmittingReport(false);
    }
  };

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
        
        // 리뷰 데이터 로드
        await loadReviews(foundProduct.id);
        
        // 로그인한 사용자인 경우 최근 본 상품에 추가 (에러 방지)
        if (user && foundProduct) {
          try {
            // 디바운스된 함수 사용으로 Firestore 요청 최소화
            await addToRecentlyViewed(foundProduct.id);
          } catch (error) {
            console.warn('최근 본 상품 추가 실패 (페이지 로드에는 영향 없음):', error);
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
  }, [params.id, user?.uid]);

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
      router.push('/cart');
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
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
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
                    selectedImage === index ? 'border-blue-500' : 'border-gray-300'
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
            <span className="text-3xl font-bold text-blue-600">
              {product.price}
            </span>
            {product.stock === 0 && (
              <span className="ml-4 text-red-500 font-semibold">품절</span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="ml-4 text-blue-600 text-lg font-semibold">
                재고 {product.stock}개 남음
              </span>
            )}
          </div>

          {/* 상품 설명 섹션 - 홈페이지 스타일에 맞게 리디자인 */}
          <div className="mb-8">
            <div className="product-description-section" style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e9ecef',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* 장식용 그라데이션 배경 - 찜하기 버튼 색상 적용 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ec4899 0%, #db2777 100%)'
              }}></div>
              
              {/* 상품 설명 헤더 */}
              <div className="product-description-header" style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
                }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0'
                }}>
                  상품 소개
                </h3>
              </div>

              {/* 메인 설명 */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #f1f2f6',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
              }}>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: '#495057',
                  margin: '0',
                  fontWeight: '400'
                }}>
                  {product.description}
                </p>
              </div>

              {/* 상품 하이라이트 포인트 - 버튼 스타일과 일치하는 색상 적용 */}
              <div className="product-highlights-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '16px'
              }}>
                {/* 찜하기 버튼 색상 (#ec4899) 적용 */}
                <div className="product-highlight-item" style={{
                  background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '2px solid #ec4899',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.3)';
                  e.currentTarget.style.backgroundColor = '#fdf2f8';
                  e.currentTarget.style.borderColor = '#db2777';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#ec4899';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
                    }}>
                      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#ec4899' }}>
                      품질 보증
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6c757d', margin: '0', lineHeight: '1.4' }}>
                    정품 인증 및 A/S 지원
                  </p>
                </div>

                {/* 바로 구매 버튼 색상 (#60a5fa) 적용 */}
                <div className="product-highlight-item" style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '2px solid #60a5fa',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(96, 165, 250, 0.3)';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#60a5fa';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(96, 165, 250, 0.3)'
                    }}>
                      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#3b82f6' }}>
                      전문 상담
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6c757d', margin: '0', lineHeight: '1.4' }}>
                    골프 전문가 맞춤 추천
                  </p>
                </div>

                {/* 장바구니 버튼 색상 (#f87171) 적용 */}
                <div className="product-highlight-item" style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '2px solid #f87171',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(248, 113, 113, 0.3)';
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#f87171';
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(248, 113, 113, 0.3)'
                    }}>
                      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444' }}>
                      빠른 배송
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6c757d', margin: '0', lineHeight: '1.4' }}>
                    2-3일 내 신속 배송
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 상품 사양 - 홈페이지 스타일에 맞게 리디자인 */}
          {Object.keys(product.specifications).length > 0 && (
            <div className="mb-8">
              <div className="product-specs-section" style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e9ecef',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* 장식용 그라데이션 배경 - 바로 구매 버튼 색상 적용 */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)'
                }}></div>
                
                {/* 상품 사양 헤더 */}
                <div className="product-specs-header" style={{
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(96, 165, 250, 0.3)'
                  }}>
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    margin: '0'
                  }}>
                    상품 사양
                  </h3>
                </div>

                {/* 사양 목록 */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: '20px',
                  border: '1px solid #f1f2f6',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}>
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <div 
                        key={key} 
                        className="spec-item"
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          gap: '0',
                          padding: '16px 20px',
                          margin: '8px 0',
                          width: '100%',
                          backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(248, 113, 113, 0.2)';
                          e.currentTarget.style.borderColor = '#f87171';
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#e9ecef';
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
                        }}
                      >
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#2c3e50'
                        }}>
                          • {key}:{value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={handleWishlistToggle}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: isInWishlist(product.id) ? '#ec4899' : 'white',
                  color: isInWishlist(product.id) ? 'white' : '#ec4899',
                  border: `2px solid #ec4899`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (isInWishlist(product.id)) {
                    e.currentTarget.style.backgroundColor = '#db2777';
                  } else {
                    e.currentTarget.style.backgroundColor = '#fdf2f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isInWishlist(product.id)) {
                    e.currentTarget.style.backgroundColor = '#ec4899';
                  } else {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <svg 
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    transform: isInWishlist(product.id) ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}
                  fill={isInWishlist(product.id) ? 'currentColor' : 'none'} 
                  stroke={isInWishlist(product.id) ? 'none' : 'currentColor'} 
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
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
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '16px'
              }}>
                {/* 바로 구매 버튼 */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || product.price === '가격문의'}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    backgroundColor: product.stock === 0 || product.price === '가격문의' ? '#9ca3af' : '#60a5fa',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: product.stock === 0 || product.price === '가격문의' ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={product.price === '가격문의' ? '가격 문의 후 이용 가능합니다' : ''}
                  onMouseEnter={(e) => {
                    if (product.stock > 0 && product.price !== '가격문의') {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (product.stock > 0 && product.price !== '가격문의') {
                      e.currentTarget.style.backgroundColor = '#60a5fa';
                    }
                  }}
                >
                  바로 구매
                </button>
                
                {/* 장바구니 버튼 */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || product.price === '가격문의'}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    backgroundColor: product.stock === 0 || product.price === '가격문의' ? '#9ca3af' : '#f87171',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: product.stock === 0 || product.price === '가격문의' ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={product.price === '가격문의' ? '가격 문의 후 이용 가능합니다' : ''}
                  onMouseEnter={(e) => {
                    if (product.stock > 0 && product.price !== '가격문의') {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (product.stock > 0 && product.price !== '가격문의') {
                      e.currentTarget.style.backgroundColor = '#f87171';
                    }
                  }}
                >
                  장바구니
                </button>
              </div>
            </div>
          </div>

          {/* 리뷰 섹션 */}
          <div style={{ 
            marginTop: '40px', 
            padding: '30px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              상품 리뷰
            </h2>

            {/* 리뷰 통계 */}
            {reviewStats.totalReviews > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                    {reviewStats.averageRating}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>평균 평점</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} style={{ 
                        color: i < Math.round(reviewStats.averageRating) ? '#ffc107' : '#e0e0e0',
                        fontSize: '16px'
                      }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                    {reviewStats.totalReviews}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>총 리뷰</div>
                </div>
              </div>
            )}

            {/* 리뷰 작성 버튼 */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
              >
                {showReviewForm ? '리뷰 작성 취소' : '리뷰 작성하기'}
              </button>
            </div>

            {/* 리뷰 작성 폼 */}
            {showReviewForm && (
              <div style={{ 
                marginBottom: '30px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                  리뷰 작성
                </h3>
                
                {/* 별점 선택 */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    별점
                  </label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '24px',
                          cursor: 'pointer',
                          color: i < reviewForm.rating ? '#ffc107' : '#e0e0e0'
                        }}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                {/* 제목 입력 */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    제목
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="리뷰 제목을 입력하세요"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* 내용 입력 */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    리뷰 내용
                  </label>
                  <textarea
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="상품에 대한 리뷰를 작성해주세요"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* 작성 버튼 */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: submittingReview ? '#6c757d' : '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: submittingReview ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submittingReview ? '작성 중...' : '리뷰 등록'}
                  </button>
                </div>
              </div>
            )}

            {/* 기존 리뷰 목록 */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                고객 리뷰 ({reviews.length}개)
              </h3>
              
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {reviews.map((review) => (
                    <div key={review.id} style={{
                      padding: '20px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      backgroundColor: '#fff'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <span style={{ fontWeight: '500' }}>{review.userName}</span>
                            <div style={{ display: 'flex' }}>
                              {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} style={{ 
                                  color: i < review.rating ? '#ffc107' : '#e0e0e0',
                                  fontSize: '14px'
                                }}>
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            marginBottom: '8px',
                            margin: '0 0 8px 0'
                          }}>
                            {review.title}
                          </h4>
                        </div>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {review.createdAt.toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      
                      <p style={{ 
                        fontSize: '14px', 
                        lineHeight: '1.5', 
                        color: '#333',
                        margin: '0 0 15px 0'
                      }}>
                        {review.content}
                      </p>

                      {/* 관리자 답글 */}
                      {review.adminReply && (
                        <div style={{
                          marginTop: '15px',
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '6px',
                          borderLeft: '3px solid #007bff'
                        }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            color: '#007bff',
                            marginBottom: '5px'
                          }}>
                            💬 판매자 답글
                          </div>
                                                <p style={{ fontSize: '14px', color: '#555', margin: 0 }}>
                        {review.adminReply}
                      </p>
                    </div>
                  )}

                  {/* 신고 버튼 (자신이 작성한 리뷰가 아닌 경우에만 표시) */}
                  {user && user.uid !== review.userId && !review.isReported && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      marginTop: '10px'
                    }}>
                      <button
                        onClick={() => handleReportReview(review.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          color: '#666',
                          backgroundColor: 'transparent',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#dc3545';
                          e.currentTarget.style.borderColor = '#dc3545';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#666';
                          e.currentTarget.style.borderColor = '#ddd';
                        }}
                      >
                        🚩 신고
                      </button>
                    </div>
                  )}

                  {/* 신고된 리뷰 표시 */}
                  {review.isReported && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffeaa7',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#856404'
                    }}>
                      ⚠️ 이 리뷰는 신고되어 관리자 검토 중입니다.
                    </div>
                  )}
                </div>
              ))}
            </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: '#666'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>⭐</div>
                  <p style={{ fontSize: '16px', margin: 0 }}>
                    아직 등록된 리뷰가 없습니다.<br />
                    첫 번째 리뷰를 작성해보세요!
                  </p>
                </div>
              )}
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

      {/* 리뷰 신고 모달 */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              리뷰 신고
            </h3>
            
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '15px',
              margin: '0 0 15px 0'
            }}>
              부적절한 리뷰를 신고해 주세요. 관리자가 검토 후 조치를 취하겠습니다.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                신고 사유 <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">신고 사유를 선택해주세요</option>
                <option value="욕설/비방">욕설/비방</option>
                <option value="허위 정보">허위 정보</option>
                <option value="스팸/광고">스팸/광고</option>
                <option value="개인정보 노출">개인정보 노출</option>
                <option value="기타">기타 부적절한 내용</option>
              </select>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={submittingReport}
                style={{
                  padding: '10px 20px',
                  backgroundColor: submittingReport ? '#6c757d' : '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: submittingReport ? 'not-allowed' : 'pointer'
                }}
              >
                {submittingReport ? '신고 중...' : '신고하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 커스텀 알림창 */}
      <CustomAlert
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={alert.type === 'confirm' ? alert.onCancel : undefined}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
      />
    </div>
  );
}
