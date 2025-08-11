// 상품 관련 타입 정의
export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  brand: string;
  images: string[];
  description: string;
  stock: number;
  specifications: {
    [key: string]: string;
  };
  isWomens: boolean;
  isKids: boolean;
  isLeftHanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 사용자 관련 타입 정의
export interface User {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  address?: Address;
  isAdmin: boolean;
  createdAt: Date;
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

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

// 장바구니 관련 타입 정의
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
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
  userId: string;
  userName: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: Date;
}

// 위시리스트 관련 타입 정의
export interface Wishlist {
  userId: string;
  productIds: string[];
  updatedAt: Date;
}

// 카테고리 타입 정의
export type Category = 'drivers' | 'irons' | 'putters' | 'wedges' | 'woods' | 'utilities';
export type Brand = 'titleist' | 'taylormade' | 'callaway' | 'honma' | 'bridgestone' | 'others';

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
