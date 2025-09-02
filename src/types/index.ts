// 상품 관련 타입 정의
export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  brand: string;
  images: string[];
  description: string;
  detailedDescription?: string; // 상세 정보 (이미지 URL 포함 가능)
  inquiry?: string; // 상품 문의 정보
  stock: number;
  cover?: boolean; // 커버 포함 여부
  productCode?: string; // 상품 코드
  specifications: {
    [key: string]: string;
  };
  isWomens: boolean;
  isKids: boolean;
  isLeftHanded: boolean;
  targetPages?: string[]; // 상품이 표시될 페이지들 (예: ["drivers/titleist", "drivers/callaway"])
  views?: number; // 조회수
  createdAt: Date;
  updatedAt: Date;
}

// 카테고리별 페이지 매핑
export interface CategoryPageMap {
  [key: string]: {
    label: string;
    pages: {
      path: string;
      label: string;
    }[];
  };
}

// 사용자 관련 타입 정의
export interface User {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
  isAdmin: boolean;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  businessNumber?: string;
  companyName?: string;
  shopInteriorPhotoUrl?: string;
  shopSignPhotoUrl?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: string; // 관리자 UID
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

// 주문 관련 타입 정의
export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'payment_pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

// 결제 관련 타입 정의
export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'vbank' | 'kakaopay' | 'naverpay' | 'phone' | 'toss_payments';

export interface BankTransferInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  transferAmount: number;
  depositorName: string;
  transferDate?: Date;
  transferNote?: string;
}

export interface PaymentInfo {
  id?: string; // 문서 ID
  orderId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: 'pending' | 'confirmed' | 'rejected';
  bankTransferInfo?: BankTransferInfo;
  verifiedAt?: Date;
  verifiedBy?: string; // 관리자 ID
  notes?: string;
  transferDate?: Date; // 이체 날짜 (호환성을 위해 추가)
  createdAt: Date;
  updatedAt: Date;
}

// 계좌 정보 타입 정의
export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// 장바구니 관련 타입 정의
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

// 제품 예약 관련 타입 정의
export interface ProductReservation {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  reservedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'completed' | 'cancelled';
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

// 리뷰 관련 타입 정의
export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  isReported: boolean;
  reportReason?: string;
  reportedAt?: Date;
  reportedBy?: string;
  adminReply?: string;
  adminReplyAt?: Date;
  repliedBy?: string; // 관리자 ID
  approvedAt?: Date;
  approvedBy?: string; // 관리자 ID
  rejectedAt?: Date;
  rejectedBy?: string; // 관리자 ID
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  reportedReviews: number;
  averageRating: number;
}

// 위시리스트 관련 타입 정의
export interface Wishlist {
  userId: string;
  productIds: string[];
  updatedAt: Date;
}

// 최근 본 상품 관련 타입 정의
export interface RecentlyViewedItem {
  productId: string;
  viewedAt: Date;
}

export interface RecentlyViewed {
  userId: string;
  items: RecentlyViewedItem[];
  updatedAt: Date;
}

// 카테고리 타입 정의
export type Category = 'drivers' | 'irons' | 'putters' | 'wedges' | 'woods' | 'utilities' | 'heads-parts';
export type Brand = 'titleist' | 'taylormade' | 'callaway' | 'honma' | 'xxio' | 'bridgestone' | 'others';

// 검색 및 필터링 관련 타입
export interface ProductFilter {
  category?: Category;
  brand?: Brand;
  minPrice?: number;
  maxPrice?: number;
  isWomens?: boolean;
  isKids?: boolean;
  isLeftHanded?: boolean;
  inStock?: boolean;
  targetPage?: string; // 특정 페이지에 표시되는 상품만 필터링
}

export interface ProductSort {
  field: 'price' | 'createdAt' | 'name';
  direction: 'asc' | 'desc';
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// 페이지네이션 타입
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// 재고 관리 관련 타입 정의
export interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
}

export interface StockHistory {
  id: string;
  productId: string;
  productName: string;
  type: 'adjustment' | 'restock' | 'sale' | 'return';
  previousStock: number;
  newStock: number;
  quantity: number;
  reason: string;
  createdAt: Date;
  createdBy: string;
}

export interface StockAdjustment {
  productId: string;
  quantity: number;
  type: 'increase' | 'decrease' | 'set';
  reason: string;
}

// 공지사항 관련 타입 정의
export interface Notice {
  id: string;
  title: string;
  content: string;
  isFixed: boolean; // 상단 고정 여부
  isVisible: boolean; // 게시 상태 (즉시 게시 여부)
  views: number;
  createdAt: Date;
  updatedAt: Date;
  author: string; // 작성자 (관리자 ID)
}