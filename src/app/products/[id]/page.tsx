'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { getProduct } from '@/lib/products';
import { Product, Review } from '@/types';
import { getProductReviews, createReview } from '@/lib/reviews';
import { useCustomAlert } from '@/hooks/useCustomAlert';



export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showContactModal, setShowContactModal] = useState(false);
  
  // 리뷰 관련 상태
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

    // 상품 데이터 로드
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('잘못된 상품 ID입니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const foundProduct = await getProduct(productId);
        if (foundProduct) {
          setProduct(foundProduct);
          addToRecentlyViewed(foundProduct.id);
        } else {
          setError('상품을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('상품 로드 오류:', err);
        setError('상품을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, addToRecentlyViewed]);

  // 리뷰 데이터 로드
  useEffect(() => {
    const loadReviews = async () => {
      if (!productId) return;
      try {
        const productReviews = await getProductReviews(productId);
        setReviews(productReviews);
      } catch (error) {
        console.error('리뷰 로드 오류:', error);
      }
    };

    loadReviews();
  }, [productId]);

  // 리뷰 제출 핸들러
  const handleSubmitReview = async () => {
    if (!user) {
      showAlert('리뷰 작성은 로그인 후 가능합니다.', 'warning');
      return;
    }

    if (!product) return;

    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      showAlert('제목과 내용을 모두 입력해주세요.', 'warning');
      return;
    }

    try {
      setSubmittingReview(true);
      
      const reviewData = {
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        userName: user.name || user.email.split('@')[0],
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        content: reviewForm.content.trim(),
        images: [],
        status: 'pending' as const,
        isReported: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = await createReview(reviewData);
      
      if (success) {
        showAlert('리뷰가 성공적으로 작성되었습니다.\n관리자 승인 후 게시됩니다.', 'success');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', content: '' });
        
        // 리뷰 목록 새로고침
        const updatedReviews = await getProductReviews(product.id);
        setReviews(updatedReviews);
      } else {
        showAlert('리뷰 작성에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('리뷰 작성 오류:', error);
      showAlert('리뷰 작성 중 오류가 발생했습니다.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // 핸들러 함수들
  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) {
      showAlert('품절된 상품입니다.', 'warning');
      return;
    }
    if (product.price === '가격문의') {
      setShowContactModal(true);
      return;
    }

    // 가격 문자열에서 숫자 추출 (예: "150,000원" -> 150000)
    const priceNumber = parseInt(product.price.replace(/[^0-9]/g, '')) || 0;
    addToCart(product.id, quantity, priceNumber);
    showAlert('장바구니에 추가되었습니다.', 'success');
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.stock === 0) {
      showAlert('품절된 상품입니다.', 'warning');
      return;
    }
    if (product.price === '가격문의') {
      setShowContactModal(true);
      return;
    }

    handleAddToCart();
    router.push('/cart');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (!user) {
      showAlert('위시리스트에 추가하려면 로그인이 필요합니다.', 'warning');
      return;
    }

      if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showAlert('위시리스트에서 제거되었습니다.', 'success');
        } else {
      addToWishlist(product.id);
      showAlert('위시리스트에 추가되었습니다.', 'success');
    }
  };

  const handleContactInquiry = () => {
    setShowContactModal(true);
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
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '5px' 
        }}>
          상품 목록으로 돌아가기
          </Link>
      </div>
    );
  }

  return (
    <>
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
          <div style={{ marginBottom: '20px' }}>
            <img
              src={product.images[selectedImage]} 
              alt={product.name}
              style={{ 
                width: '100%', 
                maxWidth: '500px', 
                height: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}
            />
          </div>
          
          {/* 썸네일 이미지들 */}
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            {product.name}
          </h1>
          
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff', marginBottom: '20px' }}>
              {product.price}
          </div>

          <div style={{ marginBottom: '20px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>브랜드:</strong> {product.brand.toUpperCase()}
                </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>재고:</strong> 
              <span style={{ 
                color: product.stock > 0 ? '#28a745' : '#dc3545',
                fontWeight: '500',
                marginLeft: '8px'
              }}>
                {product.stock > 0 ? `${product.stock}개 재고 있음` : '품절'}
                    </span>
                  </div>
                </div>

            {/* 수량 선택 */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              수량
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  backgroundColor: quantity <= 1 ? '#f8f9fa' : '#fff',
                  cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                  borderRadius: '4px'
                }}
                >
                  -
                </button>
              <span style={{ 
                padding: '8px 16px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                  {quantity}
                </span>
                <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  backgroundColor: quantity >= product.stock ? '#f8f9fa' : '#fff',
                  cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                  borderRadius: '4px'
                }}
                >
                  +
                </button>
              </div>
            </div>

          {/* 위시리스트 버튼 */}
          <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleWishlistToggle}
                style={{
                  width: '100%',
                padding: '12px',
                backgroundColor: isInWishlist(product.id) ? '#dc3545' : '#fff',
                color: isInWishlist(product.id) ? '#fff' : '#dc3545',
                border: '1px solid #dc3545',
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

            {/* 구매 버튼들 */}
          <div style={{ display: 'flex', gap: '10px' }}>
              {/* 가격문의 버튼 (가격문의 상품인 경우만) */}
              {product.price === '가격문의' && (
                <button
                  onClick={handleContactInquiry}
                style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
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
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  바로 구매
                </button>
                
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: product.stock === 0 ? '#9ca3af' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  장바구니
                </button>
              </>
            )}
              </div>
            </div>
          </div>

            {/* 🔥 상품 정보 탭 섹션 🔥 */}
      <div style={{ 
        backgroundColor: '#ffffff',
        border: '3px solid #007bff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 123, 255, 0.2)',
        marginTop: '50px',
        marginBottom: '50px',
        width: '100%',
        position: 'relative'
      }}>
        {/* 상단 라벨 */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '20px',
          backgroundColor: '#007bff',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          📋 상품 상세 정보
        </div>
        {/* 탭 헤더 */}
        <div style={{
          display: 'flex',
          borderBottom: '3px solid #007bff',
          backgroundColor: '#f8f9fa',
          marginTop: '20px'
        }}>
          {[
            { id: 'description', label: '상품설명' },
            { id: 'details', label: '상세정보' },
            { id: 'reviews', label: `후기 (${reviews.filter(r => r.status === 'approved').length})` },
            { id: 'qna', label: '문의' }
          ].map((tab) => (
                          <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '24px 32px',
                border: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
                backgroundColor: activeTab === tab.id ? '#ffffff' : '#f8f9fa',
                color: activeTab === tab.id ? '#007bff' : '#495057',
                fontSize: '18px',
                fontWeight: activeTab === tab.id ? 'bold' : '500',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '4px solid #007bff' : '4px solid transparent',
                borderRadius: activeTab === tab.id ? '8px 8px 0 0' : '0',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: activeTab === tab.id ? 2 : 1,
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,123,255,0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.color = '#007bff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.color = '#495057';
                }
              }}
            >
              {tab.label}
              </button>
          ))}
            </div>

        {/* 탭 컨텐츠 */}
        <div style={{ 
          padding: '50px',
          backgroundColor: '#fafbfc',
          minHeight: '450px',
          border: '2px dashed #007bff',
          borderTop: 'none',
          position: 'relative'
        }}>
          {/* 배경 패턴 */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            fontSize: '12px',
            color: '#007bff',
            opacity: 0.6,
            fontWeight: 'bold'
          }}>
            ✨ 활성 탭: {activeTab.toUpperCase()}
          </div>
          {/* 상품설명 탭 */}
          {activeTab === 'description' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                상품 설명
              </h3>
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

          {/* 상세정보 탭 */}
          {activeTab === 'details' && (
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                상세 정보
                </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    제품 사양
                  </div>
                  <div style={{ padding: '0' }}>
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          padding: '12px 15px',
                          borderBottom: index < Object.entries(product.specifications).length - 1 ? '1px solid #f0f0f0' : 'none',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                        }}
                      >
                        <div style={{ 
                          minWidth: '120px', 
                          fontWeight: '500', 
                          color: '#666' 
                        }}>
                          {key}:
                  </div>
                        <div style={{ color: '#333' }}>
                          {value}
                </div>
                </div>
                    ))}
                </div>
                </div>

                <div style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    상품 정보
                  </div>
                  <div style={{ padding: '0' }}>
                      <div style={{ 
                        display: 'flex', 
                      padding: '12px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: '#fff'
                    }}>
                      <div style={{ 
                        minWidth: '120px', 
                        fontWeight: '500', 
                        color: '#666' 
                      }}>
                        브랜드:
                            </div>
                      <div style={{ color: '#333', textTransform: 'capitalize' }}>
                        {product.brand}
                          </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      padding: '12px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ 
                        minWidth: '120px', 
                        fontWeight: '500', 
                        color: '#666' 
                      }}>
                        카테고리:
                        </div>
                      <div style={{ color: '#333', textTransform: 'capitalize' }}>
                        {product.category}
                      </div>
                    </div>
                        <div style={{
                      display: 'flex',
                      padding: '12px 15px',
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: '#fff'
                        }}>
                          <div style={{ 
                        minWidth: '120px', 
                            fontWeight: '500', 
                        color: '#666' 
                          }}>
                        재고:
                          </div>
                      <div style={{ 
                        color: product.stock > 0 ? '#28a745' : '#dc3545',
                        fontWeight: '500'
                      }}>
                        {product.stock > 0 ? `${product.stock}개 재고 있음` : '품절'}
                    </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      padding: '12px 15px',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ 
                        minWidth: '120px', 
                        fontWeight: '500', 
                        color: '#666' 
                      }}>
                        등록일:
                      </div>
                      <div style={{ color: '#333' }}>
                        {product.createdAt.toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                    </div>
                  )}

                        {/* 후기 탭 */}
              {activeTab === 'reviews' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                    상품 리뷰 ({reviews.length}개)
                  </h3>

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
                      marginBottom: '30px',
                      padding: '20px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9'
                    }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>
                        리뷰 작성
                      </h4>
                      
                      {/* 별점 선택 */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          별점
                        </label>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
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
                          <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                            {reviewForm.rating}점
                          </span>
                        </div>
                      </div>

                      {/* 리뷰 제목 */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          리뷰 제목
                        </label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          placeholder="리뷰 제목을 입력하세요"
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

                      {/* 리뷰 내용 */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          리뷰 내용
                        </label>
                        <textarea
                          value={reviewForm.content}
                          onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                          placeholder="상품에 대한 리뷰를 작성해주세요"
                          rows={5}
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

                      {/* 버튼 그룹 */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '10px', 
                        justifyContent: 'flex-end' 
                      }}>
                        <button
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewForm({ rating: 5, title: '', content: '' });
                          }}
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
                    {reviews.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {reviews.filter(review => review.status === 'approved').map((review) => (
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
                                <h5 style={{ 
                                  fontSize: '14px', 
                                  fontWeight: 'bold', 
                                  marginBottom: '8px',
                                  margin: '0 0 8px 0'
                                }}>
                                  {review.title}
                                </h5>
                              </div>
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                {review.createdAt.toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            
                            <p style={{ 
                              fontSize: '14px', 
                              lineHeight: '1.5', 
                              color: '#333',
                              margin: '0'
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
                                  fontSize: '12px', 
                                  fontWeight: '500', 
                                  color: '#007bff',
                                  marginBottom: '5px'
                                }}>
                                  ⭐ 관리자 답글
                                </div>
                                <p style={{ 
                                  fontSize: '13px', 
                                  color: '#333', 
                                  margin: '0'
                                }}>
                                  {review.adminReply}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#666',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⭐</div>
                        <p style={{ fontSize: '14px', margin: '0' }}>
                          아직 등록된 리뷰가 없습니다.<br />
                          첫 번째 리뷰를 작성해보세요!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

          {/* 문의 탭 */}
          {activeTab === 'qna' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                상품 문의
              </h3>
              
                <div style={{ 
                  textAlign: 'center', 
                padding: '60px 20px',
                  color: '#666'
                }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                  상품 문의
                </h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
                  상품에 대한 궁금한 점이 있으시면<br />
                  고객센터를 통해 문의해 주세요.
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  <div style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#007bff' }}>
                      📞 전화 문의
                </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <p>02-1234-5678</p>
                      <p>평일 9:00 ~ 18:00</p>
                      <p>(점심시간 12:00 ~ 13:00)</p>
            </div>
          </div>

                  <div style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#28a745' }}>
                      💌 이메일 문의
            </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <p>support@golfstore.com</p>
                      <p>24시간 접수 가능</p>
                      <p>(답변: 영업일 기준 1일)</p>
          </div>
        </div>
      </div>

                <div style={{
                  marginTop: '30px',
                  padding: '20px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#856404',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>📋 문의 시 참고사항</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>상품명과 옵션을 정확히 알려주세요</li>
                    <li>배송 관련 문의 시 주문번호를 함께 알려주세요</li>
                    <li>교환/반품 문의는 구매일로부터 7일 이내 가능합니다</li>
                    <li>사용된 상품은 교환/반품이 불가능합니다</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
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
                  window.location.href = 'tel:02-1234-5678';
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
    </>
  );
}
