import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { FAQItem } from '@/contexts/FAQContext';

// 로컬 스토리지 키
const LOCAL_STORAGE_KEY = 'golf_faqs';

// Firebase가 제대로 초기화되었는지 체크하는 함수
function checkFirebaseInitialized() {
  if (!db || typeof db.collection !== 'function') {
    console.warn('Firebase가 초기화되지 않았습니다. 로컬 스토리지를 사용합니다.');
    return false;
  }
  return true;
}

// 로컬 스토리지에서 FAQ 데이터 가져오기
function getLocalFAQs(): FAQItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('로컬 스토리지에서 FAQ 데이터를 가져오는 중 오류:', error);
    return [];
  }
}

// 로컬 스토리지에 FAQ 데이터 저장
function saveLocalFAQs(faqs: FAQItem[]) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(faqs));
  } catch (error) {
    console.error('로컬 스토리지에 FAQ 데이터를 저장하는 중 오류:', error);
  }
}

// 고유 ID 생성
function generateId(): string {
  return 'faq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// FAQ 컬렉션 참조 (안전하게)
function getFaqCollection() {
  if (!checkFirebaseInitialized()) {
    throw new Error('Firebase가 초기화되지 않았습니다.');
  }
  return collection(db, 'faqs');
}

// Firestore FAQ 타입 (서버 타임스탬프 포함)
export interface FirestoreFAQItem {
  id?: string;
  category: string;
  question: string;
  answer: string;
  isVisible: boolean;
  order: number;
  views: number;
  imageUrl?: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// FAQ 추가
export async function addFAQ(faqData: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt' | 'views'>) {
  try {
    if (!checkFirebaseInitialized()) {
      // 로컬 스토리지 fallback
      const faqs = getLocalFAQs();
      const now = new Date().toISOString();
      const newFaq: FAQItem = {
        ...faqData,
        id: generateId(),
        views: 0,
        createdAt: now,
        updatedAt: now
      };
      
      faqs.push(newFaq);
      saveLocalFAQs(faqs);
      notifyLocalStorageListeners(); // 리스너들에게 알림
      
      console.log('FAQ 로컬 저장소에 추가됨:', newFaq.id);
      return newFaq.id;
    }
    
    const faqCollection = getFaqCollection();
    const docRef = await addDoc(faqCollection, {
      ...faqData,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('FAQ Firebase에 추가됨:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('FAQ 추가 오류:', error);
    throw error;
  }
}

// FAQ 업데이트
export async function updateFAQ(id: string, faqData: Partial<FAQItem>) {
  try {
    if (!checkFirebaseInitialized()) {
      // 로컬 스토리지 fallback
      const faqs = getLocalFAQs();
      const index = faqs.findIndex(faq => faq.id === id);
      
      if (index !== -1) {
        faqs[index] = {
          ...faqs[index],
          ...faqData,
          updatedAt: new Date().toISOString()
        };
        saveLocalFAQs(faqs);
        notifyLocalStorageListeners(); // 리스너들에게 알림
        console.log('FAQ 로컬 저장소에서 업데이트됨:', id);
      } else {
        throw new Error('FAQ를 찾을 수 없습니다.');
      }
      return;
    }
    
    const docRef = doc(db, 'faqs', id);
    await updateDoc(docRef, {
      ...faqData,
      updatedAt: serverTimestamp()
    });
    
    console.log('FAQ Firebase에서 업데이트됨:', id);
  } catch (error) {
    console.error('FAQ 업데이트 오류:', error);
    throw error;
  }
}

// FAQ 삭제
export async function deleteFAQ(id: string) {
  try {
    if (!checkFirebaseInitialized()) {
      // 로컬 스토리지 fallback
      const faqs = getLocalFAQs();
      const filteredFaqs = faqs.filter(faq => faq.id !== id);
      saveLocalFAQs(filteredFaqs);
      notifyLocalStorageListeners(); // 리스너들에게 알림
      console.log('FAQ 로컬 저장소에서 삭제됨:', id);
      return;
    }
    
    const docRef = doc(db, 'faqs', id);
    await deleteDoc(docRef);
    
    console.log('FAQ Firebase에서 삭제됨:', id);
  } catch (error) {
    console.error('FAQ 삭제 오류:', error);
    throw error;
  }
}

// 조회수 증가
export async function incrementFAQViews(id: string) {
  try {
    if (!checkFirebaseInitialized()) {
      // 로컬 스토리지 fallback
      const faqs = getLocalFAQs();
      const index = faqs.findIndex(faq => faq.id === id);
      
      if (index !== -1) {
        faqs[index] = {
          ...faqs[index],
          views: faqs[index].views + 1,
          updatedAt: new Date().toISOString()
        };
        saveLocalFAQs(faqs);
        notifyLocalStorageListeners(); // 리스너들에게 알림
        console.log('FAQ 조회수 로컬 저장소에서 증가됨:', id);
      }
      return;
    }
    
    const docRef = doc(db, 'faqs', id);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('조회수 증가 오류:', error);
    // 에러가 발생해도 UI에 영향을 주지 않도록 throw하지 않음
  }
}

// 모든 FAQ 가져오기 (정렬 포함)
export async function getAllFAQs(sortBy: string = 'order', sortOrder: 'asc' | 'desc' = 'asc') {
  try {
    if (!checkFirebaseInitialized()) {
      throw new Error('Firebase가 초기화되지 않았습니다.');
    }
    
    const faqCollection = getFaqCollection();
    const q = query(faqCollection, orderBy(sortBy, sortOrder));
    const querySnapshot = await getDocs(q);
    
    const faqs: FAQItem[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreFAQItem;
      return {
        id: doc.id,
        category: data.category,
        question: data.question,
        answer: data.answer,
        isVisible: data.isVisible,
        order: data.order,
        views: data.views,
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt?.toDate().toISOString() || '',
        updatedAt: data.updatedAt?.toDate().toISOString() || ''
      };
    });
    
    return faqs;
  } catch (error) {
    console.error('FAQ 목록 가져오기 오류:', error);
    throw error;
  }
}

// 특정 FAQ 가져오기
export async function getFAQ(id: string) {
  try {
    const docRef = doc(db, 'faqs', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreFAQItem;
      return {
        id: docSnap.id,
        category: data.category,
        question: data.question,
        answer: data.answer,
        isVisible: data.isVisible,
        order: data.order,
        views: data.views,
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt?.toDate().toISOString() || '',
        updatedAt: data.updatedAt?.toDate().toISOString() || ''
      } as FAQItem;
    } else {
      throw new Error('FAQ를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('FAQ 가져오기 오류:', error);
    throw error;
  }
}

// 공개된 FAQ만 가져오기
export async function getVisibleFAQs() {
  try {
    if (!checkFirebaseInitialized()) {
      // 로컬 스토리지 fallback
      const faqs = getLocalFAQs();
      return faqs.filter(faq => faq.isVisible).sort((a, b) => a.order - b.order);
    }
    
    const faqCollection = getFaqCollection();
    const q = query(
      faqCollection,
      where('isVisible', '==', true),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const faqs: FAQItem[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreFAQItem;
      return {
        id: doc.id,
        category: data.category,
        question: data.question,
        answer: data.answer,
        isVisible: data.isVisible,
        order: data.order,
        views: data.views,
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt?.toDate().toISOString() || '',
        updatedAt: data.updatedAt?.toDate().toISOString() || ''
      };
    });
    
    return faqs;
  } catch (error) {
    console.error('공개 FAQ 목록 가져오기 오류:', error);
    throw error;
  }
}

// 카테고리별 FAQ 가져오기
export async function getFAQsByCategory(category: string) {
  try {
    if (!checkFirebaseInitialized()) {
      // 로컬 스토리지 fallback
      const faqs = getLocalFAQs();
      return faqs
        .filter(faq => faq.category === category && faq.isVisible)
        .sort((a, b) => a.order - b.order);
    }
    
    const faqCollection = getFaqCollection();
    const q = query(
      faqCollection,
      where('category', '==', category),
      where('isVisible', '==', true),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const faqs: FAQItem[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreFAQItem;
      return {
        id: doc.id,
        category: data.category,
        question: data.question,
        answer: data.answer,
        isVisible: data.isVisible,
        order: data.order,
        views: data.views,
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt?.toDate().toISOString() || '',
        updatedAt: data.updatedAt?.toDate().toISOString() || ''
      };
    });
    
    return faqs;
  } catch (error) {
    console.error('카테고리별 FAQ 가져오기 오류:', error);
    throw error;
  }
}

// 로컬 스토리지 이벤트 리스너들
let localStorageListeners: ((faqs: FAQItem[]) => void)[] = [];

// 로컬 스토리지 변경 시 모든 리스너에게 알림
function notifyLocalStorageListeners() {
  const faqs = getLocalFAQs();
  localStorageListeners.forEach(callback => callback(faqs));
}

// 실시간 FAQ 목록 구독
export function subscribeToFAQs(callback: (faqs: FAQItem[]) => void) {
  try {
    if (!checkFirebaseInitialized()) {
      console.warn('Firebase가 초기화되지 않았습니다. 로컬 스토리지를 사용합니다.');
      
      // 로컬 스토리지에서 초기 데이터 로드
      const faqs = getLocalFAQs();
      callback(faqs.sort((a, b) => a.order - b.order));
      
      // 로컬 스토리지 변경 감지를 위한 리스너 추가
      localStorageListeners.push(callback);
      
      // unsubscribe 함수 반환
      return () => {
        const index = localStorageListeners.indexOf(callback);
        if (index > -1) {
          localStorageListeners.splice(index, 1);
        }
      };
    }
    
    const faqCollection = getFaqCollection();
    const q = query(faqCollection, orderBy('order', 'asc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const faqs: FAQItem[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreFAQItem;
        return {
          id: doc.id,
          category: data.category,
          question: data.question,
          answer: data.answer,
          isVisible: data.isVisible,
          order: data.order,
          views: data.views,
          imageUrl: data.imageUrl || null,
          createdAt: data.createdAt?.toDate().toISOString() || '',
          updatedAt: data.updatedAt?.toDate().toISOString() || ''
        };
      });
      
      callback(faqs);
    }, (error) => {
      console.error('FAQ 실시간 구독 오류:', error);
      callback([]); // 에러 시 빈 배열 반환
    });
  } catch (error) {
    console.error('FAQ 구독 설정 오류:', error);
    callback([]);
    return () => {};
  }
}

// 일괄 삭제
export async function batchDeleteFAQs(ids: string[]) {
  try {
    if (!checkFirebaseInitialized()) {
      // 로컬 스토리지 fallback
      const faqs = getLocalFAQs();
      const filteredFaqs = faqs.filter(faq => !ids.includes(faq.id));
      saveLocalFAQs(filteredFaqs);
      notifyLocalStorageListeners(); // 리스너들에게 알림
      console.log('FAQ 로컬 저장소에서 일괄 삭제 완료:', ids.length);
      return;
    }
    
    const batch = writeBatch(db);
    
    ids.forEach(id => {
      const docRef = doc(db, 'faqs', id);
      batch.delete(docRef);
    });
    
    await batch.commit();
    console.log('FAQ Firebase에서 일괄 삭제 완료:', ids.length);
  } catch (error) {
    console.error('FAQ 일괄 삭제 오류:', error);
    throw error;
  }
}

// 일괄 가시성 업데이트
export async function batchUpdateFAQVisibility(ids: string[], isVisible: boolean) {
  try {
    if (!checkFirebaseInitialized()) {
      // 로컬 스토리지 fallback
      const faqs = getLocalFAQs();
      const updatedFaqs = faqs.map(faq => {
        if (ids.includes(faq.id)) {
          return {
            ...faq,
            isVisible,
            updatedAt: new Date().toISOString()
          };
        }
        return faq;
      });
      saveLocalFAQs(updatedFaqs);
      notifyLocalStorageListeners(); // 리스너들에게 알림
      console.log('FAQ 로컬 저장소에서 일괄 가시성 업데이트 완료:', ids.length);
      return;
    }
    
    const batch = writeBatch(db);
    
    ids.forEach(id => {
      const docRef = doc(db, 'faqs', id);
      batch.update(docRef, { 
        isVisible,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('FAQ Firebase에서 일괄 가시성 업데이트 완료:', ids.length);
  } catch (error) {
    console.error('FAQ 일괄 가시성 업데이트 오류:', error);
    throw error;
  }
}

// FAQ 순서 업데이트
export async function updateFAQOrder(id: string, newOrder: number) {
  try {
    const docRef = doc(db, 'faqs', id);
    await updateDoc(docRef, {
      order: newOrder,
      updatedAt: serverTimestamp()
    });
    
    console.log('FAQ 순서 업데이트됨:', id, newOrder);
  } catch (error) {
    console.error('FAQ 순서 업데이트 오류:', error);
    throw error;
  }
}

// 초기 FAQ 데이터 시드
export async function seedInitialFAQData() {
  try {
    if (!checkFirebaseInitialized()) {
      console.warn('Firebase가 초기화되지 않았습니다. 로컬 스토리지에 초기 데이터를 생성합니다.');
      
      // 로컬 스토리지에 기존 데이터가 있는지 확인
      const localFaqs = getLocalFAQs();
      if (localFaqs.length > 0) {
        console.log('로컬 FAQ 데이터가 이미 존재합니다.');
        return;
      }
      
      // 초기 데이터 생성
      const initialFAQs = [
        {
          category: '주문/결제',
          question: '주문은 어떻게 하나요?',
          answer: `주문 방법은 다음과 같습니다:

1. 원하시는 상품을 선택하여 장바구니에 담습니다
2. 장바구니에서 주문할 상품을 확인합니다
3. 주문/결제 페이지에서 배송지 정보를 입력합니다
4. 결제 방법을 선택하고 결제를 완료합니다

로그인 후 주문하시면 더욱 편리합니다.`,
          isVisible: true,
          order: 1,
          views: 1247
        },
        {
          category: '주문/결제',
          question: '결제 방법은 어떤 것들이 있나요?',
          answer: `다음과 같은 결제 방법을 제공합니다:

• 무통장 입금
• 신용카드 결제
• 카카오페이

무통장 입금의 경우 입금 확인 후 배송이 시작됩니다.`,
          isVisible: true,
          order: 2,
          views: 856
        },
        {
          category: '배송',
          question: '배송비는 얼마인가요?',
          answer: `배송비는 다음과 같습니다:

• 3만원 이상 주문: 무료배송
• 3만원 미만 주문: 3,000원

제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.`,
          isVisible: true,
          order: 3,
          views: 678
        }
      ];
      
      const now = new Date().toISOString();
      const formattedFAQs: FAQItem[] = initialFAQs.map((faq, index) => ({
        ...faq,
        id: generateId(),
        createdAt: now,
        updatedAt: now
      }));
      
      saveLocalFAQs(formattedFAQs);
      notifyLocalStorageListeners(); // 리스너들에게 알림
      console.log('로컬 스토리지에 초기 FAQ 데이터 생성 완료');
      return;
    }
    
    const faqCollection = getFaqCollection();
    // 기존 데이터가 있는지 확인
    const querySnapshot = await getDocs(faqCollection);
    if (!querySnapshot.empty) {
      console.log('FAQ 데이터가 이미 존재합니다.');
      return;
    }

    const initialFAQs = [
      {
        category: '주문/결제',
        question: '주문은 어떻게 하나요?',
        answer: `주문 방법은 다음과 같습니다:

1. 원하시는 상품을 선택하여 장바구니에 담습니다
2. 장바구니에서 주문할 상품을 확인합니다
3. 주문/결제 페이지에서 배송지 정보를 입력합니다
4. 결제 방법을 선택하고 결제를 완료합니다

로그인 후 주문하시면 더욱 편리합니다.`,
        isVisible: true,
        order: 1,
        views: 1247
      },
      {
        category: '주문/결제',
        question: '결제 방법은 어떤 것들이 있나요?',
        answer: `다음과 같은 결제 방법을 제공합니다:

• 무통장 입금
• 신용카드 결제
• 카카오페이

무통장 입금의 경우 입금 확인 후 배송이 시작됩니다.`,
        isVisible: true,
        order: 2,
        views: 856
      },
      {
        category: '배송',
        question: '배송비는 얼마인가요?',
        answer: `배송비는 다음과 같습니다:

• 3만원 이상 주문: 무료배송
• 3만원 미만 주문: 3,000원

제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.`,
        isVisible: true,
        order: 3,
        views: 678
      },
      {
        category: '배송',
        question: '배송기간은 얼마나 걸리나요?',
        answer: `일반적인 배송기간은 다음과 같습니다:

• 결제 완료 후 2-3일 내 배송 (영업일 기준)
• 무통장 입금의 경우 입금 확인 후 2-3일
• 주말 및 공휴일은 배송되지 않습니다

급하신 경우 고객센터로 연락주세요.`,
        isVisible: true,
        order: 4,
        views: 234
      },
      {
        category: '회원',
        question: '회원가입은 어떻게 하나요?',
        answer: `회원가입 절차는 다음과 같습니다:

1. 회원가입 페이지에서 필수 정보를 입력합니다
2. 사업자등록증과 샵 사진을 업로드합니다
3. 이용약관 및 개인정보처리방침에 동의합니다
4. 가입 완료 후 승인까지 1-2일 소요됩니다

사업자 회원만 가입 가능합니다.`,
        isVisible: true,
        order: 5,
        views: 134
      }
    ];

    const batch = writeBatch(db);
    
    initialFAQs.forEach((faq) => {
      const docRef = doc(faqCollection);
      batch.set(docRef, {
        ...faq,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('초기 FAQ 데이터 시드 완료');
  } catch (error) {
    console.error('초기 FAQ 데이터 시드 오류:', error);
    throw error;
  }
}
