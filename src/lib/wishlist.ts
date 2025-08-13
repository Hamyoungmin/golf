import { 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { Wishlist, Product } from '@/types';
import { getProduct } from './products';

// 사용자 위시리스트 가져오기
export async function getUserWishlist(userId: string): Promise<Wishlist | null> {
  try {
    const docRef = doc(db, 'wishlists', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Wishlist;
    }

    return null;
  } catch (error) {
    console.error('위시리스트 가져오기 오류:', error);
    return null;
  }
}

// 위시리스트에 상품 추가
export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'wishlists', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 기존 위시리스트가 있으면 상품 ID 추가
      await updateDoc(docRef, {
        productIds: arrayUnion(productId),
        updatedAt: new Date(),
      });
    } else {
      // 위시리스트가 없으면 새로 생성
      const wishlistData: Wishlist = {
        userId,
        productIds: [productId],
        updatedAt: new Date(),
      };
      await setDoc(docRef, wishlistData);
    }

    return true;
  } catch (error) {
    console.error('위시리스트 추가 오류:', error);
    return false;
  }
}

// 위시리스트에서 상품 제거
export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'wishlists', userId);
    await updateDoc(docRef, {
      productIds: arrayRemove(productId),
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('위시리스트 제거 오류:', error);
    return false;
  }
}

// 위시리스트에 상품이 있는지 확인
export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const wishlist = await getUserWishlist(userId);
    return wishlist ? wishlist.productIds.includes(productId) : false;
  } catch (error) {
    console.error('위시리스트 확인 오류:', error);
    return false;
  }
}

// 위시리스트 상품들 정보 가져오기
export async function getWishlistProducts(userId: string): Promise<Product[]> {
  try {
    const wishlist = await getUserWishlist(userId);
    if (!wishlist || wishlist.productIds.length === 0) {
      return [];
    }

    const products: Product[] = [];
    
    // 각 상품 ID에 대해 상품 정보를 가져옴
    for (const productId of wishlist.productIds) {
      const product = await getProduct(productId);
      if (product) {
        products.push(product);
      }
    }

    return products;
  } catch (error) {
    console.error('위시리스트 상품 가져오기 오류:', error);
    return [];
  }
}

// 위시리스트 전체 삭제
export async function clearWishlist(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'wishlists', userId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('위시리스트 삭제 오류:', error);
    return false;
  }
}

// 여러 상품을 위시리스트에서 제거
export async function removeMultipleFromWishlist(userId: string, productIds: string[]): Promise<boolean> {
  try {
    const docRef = doc(db, 'wishlists', userId);
    
    // 각 상품 ID를 개별적으로 제거
    for (const productId of productIds) {
      await updateDoc(docRef, {
        productIds: arrayRemove(productId),
      });
    }
    
    await updateDoc(docRef, {
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('위시리스트 다중 제거 오류:', error);
    return false;
  }
}
