'use client';

import { useState, useEffect } from 'react';
import SafeImage from '../../../components/SafeImage';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { useRecentlyViewed } from '../../../contexts/RecentlyViewedContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { useCustomAlert } from '../../../hooks/useCustomAlert';
import { getProductById, incrementProductViews } from '../../../lib/products';
import { createReview, getProductReviews } from '../../../lib/reviews';
import { Product, Review } from '../../../types';
import ProductReservationStatus, { ReservationAwareAddToCartButton } from '../../../components/ProductReservationStatus';
import { ProductReservationInfo } from '../../../components/ProductReservationBadge';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { settings } = useSettings();
  const { AlertComponent, showAlert } = useCustomAlert();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (params.id && typeof params.id === 'string') {
          const productData = await getProductById(params.id);
          if (productData) {
            setProduct(productData);
            // 수량은 처음 로드할 때만 초기화 (사용자가 변경한 수량 유지)
            setQuantity(prev => prev === 1 ? (productData.stock > 0 ? 1 : 0) : Math.min(prev, productData.stock));
            // 리뷰도 함께 가져오기
            const reviewsData = await getProductReviews(params.id);
            setReviews(reviewsData);
            

            // 조회수 증가 (로그인 여부와 관계없이 항상 실행)
            try {
              await incrementProductViews(params.id);
            } catch (error) {
              console.warn('조회수 증가 실패:', error);
              // 실패해도 페이지는 정상적으로 표시
            }
          } else {
            setError('상품을 찾을 수 없습니다.');
          }
        }
      } catch (err) {
        console.error('상품 정보 로드 실패:', err);
        setError('상품 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  // 최근 본 상품 추가는 별도 useEffect로 처리
  useEffect(() => {
    const addRecentlyViewedProduct = async () => {
      if (user && params.id && typeof params.id === 'string') {
        try {
          await addToRecentlyViewed(params.id);
        } catch (error) {
          console.warn('최근 본 상품 추가 실패:', error);
        }
      }
    };

    addRecentlyViewedProduct();
  }, [user, params.id, addToRecentlyViewed]);



  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.price === '가격문의') {
      setShowContactModal(true);
      return;
    }

    // 재고 검증
    if (quantity > product.stock) {
      showAlert(`재고가 ${product.stock}개만 남아있습니다. 수량을 확인해 주세요.`, 'error');
      setQuantity(Math.min(quantity, product.stock)); // 수량을 재고로 자동 조정
      return;
    }

    if (quantity <= 0) {
      showAlert('구매 수량을 1개 이상 선택해 주세요.', 'error');
      return;
    }

    // 구매 로직 구현
    router.push(`/checkout?productId=${product.id}&quantity=${quantity}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (product.price === '가격문의') {
      setShowContactModal(true);
      return;
    }

    // 재고 검증
    if (quantity > product.stock) {
      showAlert(`재고가 ${product.stock}개만 남아있습니다. 수량을 확인해 주세요.`, 'error');
      setQuantity(Math.min(quantity, product.stock)); // 수량을 재고로 자동 조정
      return;
    }

    if (quantity <= 0) {
      showAlert('구매 수량을 1개 이상 선택해 주세요.', 'error');
      return;
    }

    // 가격 문자열에서 숫자 추출 (예: "150,000원" -> 150000)
    const priceNumber = parseInt(product.price.replace(/[^0-9]/g, '')) || 0;
    await addToCart(product.id, quantity, priceNumber);
    showAlert('장바구니에 추가되었습니다.', 'success');
  };

  const handleSubmitReview = async () => {
    if (!user || !product) {
      if (!user) {
        showAlert('리뷰 작성을 위해 로그인이 필요합니다.', 'error');
      }
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      showAlert('제목과 내용을 모두 입력해주세요.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await createReview({
        productId: product.id,
        productName: product.name, // productName 추가
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        content: reviewForm.content.trim()
      });

      // 리뷰 목록 새로고침
      const updatedReviews = await getProductReviews(product.id);
      setReviews(updatedReviews);

      // 폼 초기화
      setReviewForm({ rating: 5, title: '', content: '' });
      setShowReviewForm(false);
      showAlert('리뷰가 성공적으로 등록되어 바로 반영되었습니다!', 'success');
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      showAlert('리뷰 등록 중 오류가 발생했습니다.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div>상품 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div>{error || '상품을 찾을 수 없습니다.'}</div>
        <Link href="/products" style={{ 
          display: 'inline-block', 
          marginTop: '20px', 
          color: '#007bff',
          textDecoration: 'underline'
        }}>
          상품 목록으로 돌아가기
          </Link>
      </div>
    );
  }

  return (
    <div>
      <AlertComponent />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* 상품 상세 정보 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* 상품 이미지 */}
          <div>
            <SafeImage
              src={product.images && product.images.length > 0 ? product.images[selectedImage] : '/placeholder-image.jpg'}
              alt={product.name}
              width={500}
              height={400}
              style={{
                width: '100%', 
                maxWidth: '500px', 
                height: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}
            />
            
            {/* 썸네일 이미지들 */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      padding: '4px',
                      border: selectedImage === index ? '2px solid #007bff' : '1px solid #e0e0e0',
                      borderRadius: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <SafeImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={60}
                      height={60}
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>{product.name}</h1>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', marginBottom: '20px' }}>
              {user ? (
                product.price === '가격문의' ? product.price : 
                new Intl.NumberFormat('ko-KR').format(parseInt(product.price.replace(/[^0-9]/g, ''))) + '원'
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  fontSize: '20px',
                  color: '#666'
                }}>
                  <span style={{ fontSize: '24px' }}>🔒</span>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>로그인 후 가격 확인 가능</div>
                    <div style={{ fontSize: '14px', fontWeight: 'normal', color: '#888', marginTop: '4px' }}>
                      회원가입 후 특별 가격을 확인하세요
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 상품 설명 */}
            {product.description && (
              <div style={{ 
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>상품 설명</h3>
                <div style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  color: '#333',
                  whiteSpace: 'pre-line'
                }}>
                  {product.description}
                </div>
              </div>
            )}

            {/* 상세정보 */}
            {((product.detailedDescription && product.detailedDescription.trim()) || 
              (product.specifications && Object.keys(product.specifications).length > 0)) && (
              <div style={{ 
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>상세정보</h3>
                
                {/* 상세 설명 */}
                {product.detailedDescription && product.detailedDescription.trim() && (
                  <div style={{ 
                    fontSize: '14px', 
                    lineHeight: '1.6', 
                    color: '#333',
                    marginBottom: '15px'
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: product.detailedDescription }} />
                  </div>
                )}

                {/* 제품 사양 */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} style={{ 
                        display: 'flex', 
                        marginBottom: '8px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span style={{ fontWeight: '600', width: '120px', minWidth: '120px' }}>{key}:</span>
                        <span style={{ color: '#666' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 재고 정보 */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                재고: {product.stock > 0 ? `${product.stock}개` : '품절'}
              </span>
            </div>

            {/* 수량 선택 */}
            {product.price !== '가격문의' && product.stock > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  수량: <span style={{ color: '#666', fontSize: '14px', fontWeight: '400' }}>
                    (최대 {product.stock}개까지 구매 가능)
                  </span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      backgroundColor: quantity <= 1 ? '#f8f9fa' : '#fff',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                      borderRadius: '4px',
                      opacity: quantity <= 1 ? 0.5 : 1
                    }}
                  >
                    -
                  </button>
                  <span style={{ 
                    padding: '8px 16px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    minWidth: '60px',
                    textAlign: 'center',
                    backgroundColor: '#fff'
                  }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      backgroundColor: quantity >= product.stock ? '#f8f9fa' : '#fff',
                      cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                      borderRadius: '4px',
                      opacity: quantity >= product.stock ? 0.5 : 1
                    }}
                  >
                    +
                  </button>
                </div>
                
                {/* 재고 제한 안내 */}
                {quantity >= product.stock && (
                  <div style={{
                    fontSize: '12px',
                    color: '#dc3545',
                    marginTop: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>⚠️</span>
                    <span>재고가 {product.stock}개만 남아있어 더 이상 선택할 수 없습니다.</span>
                  </div>
                )}
              </div>
            )}

            {/* 관심상품 버튼 */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleWishlistToggle}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isInWishlist(product.id) ? '#dc3545' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isInWishlist(product.id) ? '♥ 관심상품에서 제거' : '♡ 관심상품에 추가'}
              </button>
            </div>

            {/* 예약 상태 표시 */}
            {product.price !== '가격문의' && (
              <div style={{ marginBottom: '15px' }}>
                <ProductReservationInfo 
                  productId={product.id}
                  showDetails={true}
                />
                <ProductReservationStatus 
                  productId={product.id}
                />
              </div>
            )}

            {/* 구매 버튼들 */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {user ? (
                <>
                  {/* 가격문의 상품인 경우 */}
                  {product.price === '가격문의' && (
                    <button
                      onClick={() => setShowContactModal(true)}
                      style={{
                        flex: 1,
                        padding: '16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      가격 문의하기
                    </button>
                  )}
                  
                  {/* 일반 구매 버튼들 */}
                  {product.price !== '가격문의' && (
                    <>
                      <button
                        onClick={handleBuyNow}
                        disabled={product.stock === 0}
                        style={{
                          flex: 1,
                          padding: '16px',
                          backgroundColor: product.stock === 0 ? '#9ca3af' : '#007bff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                          opacity: product.stock === 0 ? 0.6 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        바로 구매
                      </button>
                      
                      <div style={{ flex: 1 }}>
                        <ReservationAwareAddToCartButton
                          productId={product.id}
                          price={parseInt(product.price.replace(/[^0-9]/g, '')) || 0}
                          onAddToCart={handleAddToCart}
                        disabled={product.stock === 0}
                      >
                        장바구니
                        </ReservationAwareAddToCartButton>
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* 비로그인 사용자용 로그인 유도 버튼들 */
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  width: '100%',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#495057',
                    marginBottom: '8px'
                  }}>
                    🔒 회원만 구매 가능한 상품입니다
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6c757d', 
                    marginBottom: '15px',
                    lineHeight: '1.4'
                  }}>
                    로그인하시면 특별 가격과 함께<br />
                    상품을 구매하실 수 있습니다
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => router.push('/login')}
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#007bff'}
                    >
                      로그인하기
                    </button>
                    <button
                      onClick={() => router.push('/register')}
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#218838'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#28a745'}
                    >
                      회원가입
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 상품 정보 탭 섹션 */}
        <div style={{ 
          backgroundColor: '#ffffff',
          marginTop: '50px',
          marginBottom: '50px',
          width: '100%'
        }}>
          {/* 탭 헤더 */}
          <div style={{
            display: 'flex',
            backgroundColor: '#ffffff'
          }}>
            {[
              { id: 'reviews', label: `후기 (${reviews.length})` },
              { id: 'qna', label: '문의' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  flex: 1,
                  padding: '24px 32px',
                  border: 'none',
                  backgroundColor: '#ffffff',
                  color: activeTab === tab.id ? '#333333' : '#666666',
                  fontSize: '18px',
                  fontWeight: activeTab === tab.id ? 'bold' : '500',
                  cursor: 'pointer',
                  borderBottom: 'none',
                  borderRadius: '0',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 전체 컨텐츠 */}
          <div style={{ 
            padding: '50px',
            backgroundColor: '#ffffff'
          }}>


                        {/* 후기 섹션 */}
            <div id="reviews" style={{ marginBottom: '60px' }}>
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
                    cursor: 'pointer'
                  }}
                >
                  {showReviewForm ? '리뷰 작성 취소' : '리뷰 작성하기'}
                </button>
              </div>

              {/* 리뷰 작성 폼 */}
              {showReviewForm && (
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '30px',
                  marginBottom: '30px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                    리뷰 작성
                  </h3>

                  {/* 평점 선택 */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      평점:
                    </label>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: star <= reviewForm.rating ? '#ffc107' : '#ddd',
                            padding: '2px',
                            transition: 'color 0.2s ease'
                          }}
                          onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                        {reviewForm.rating}점
                      </span>
                    </div>
                  </div>

                  {/* 제목 입력 */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      제목:
                    </label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      placeholder="리뷰 제목을 입력해주세요"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* 내용 입력 */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      내용:
                    </label>
                    <textarea
                      value={reviewForm.content}
                      onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                      placeholder="상품에 대한 후기를 작성해주세요"
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* 작성 버튼 */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewForm.title.trim() || !reviewForm.content.trim()}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: submittingReview || !reviewForm.title.trim() || !reviewForm.content.trim() 
                          ? '#6c757d' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: submittingReview || !reviewForm.title.trim() || !reviewForm.content.trim() 
                          ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {submittingReview ? '등록 중...' : '리뷰 등록'}
                    </button>
                  </div>
                </div>
              )}

              {/* 리뷰 목록 */}
              <div>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{review.title}</span>
                            {review.status === 'pending' && (
                              <span style={{
                                fontSize: '12px',
                                backgroundColor: '#ffc107',
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                승인대기
                              </span>
                            )}
                            {review.status === 'approved' && (
                              <span style={{
                                fontSize: '12px',
                                backgroundColor: '#28a745',
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                승인완료
                              </span>
                            )}
                            {review.status === 'rejected' && (
                              <span style={{
                                fontSize: '12px',
                                backgroundColor: '#dc3545',
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                승인거부
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#ffc107', fontSize: '14px', marginTop: '4px' }}>
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
                          <div>{review.userName}</div>
                          <div>{review.createdAt.toLocaleDateString('ko-KR')}</div>
                        </div>
                      </div>
                      <p style={{ lineHeight: '1.6', color: '#333', margin: '0' }}>
                        {review.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: '#666'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
                    <p style={{ fontSize: '14px', margin: '0' }}>
                      아직 등록된 리뷰가 없습니다.<br />
                      첫 번째 리뷰를 작성해보세요!
                    </p>
                  </div>
                )}
              </div>
            </div>

                         {/* 문의 섹션 */}
             <div id="qna" style={{ marginBottom: '60px' }}>
                 <div style={{
                   fontSize: '16px', 
                   lineHeight: '1.8', 
                   color: '#333',
                   whiteSpace: 'pre-line',
                 padding: '20px',
                 backgroundColor: '#f8f9fa',
                 border: '1px solid #e9ecef',
                 borderRadius: '8px'
               }}>
                 {settings.store.inquiryInfo}
                 </div>
             </div>
          </div>
        </div>
      </div>

      {/* 가격 문의 모달 */}
      {showContactModal && (
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
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
              가격 문의
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              해당 상품의 가격은 문의를 통해 확인하실 수 있습니다.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  window.location.href = `tel:${settings.store.phone}`;
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                전화 문의
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}