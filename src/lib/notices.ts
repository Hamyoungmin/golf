import { 
  db,
  collection, 
  query, 
  // where, // unused
  getDocs, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  // addDoc, // unused
  serverTimestamp
} from './firebase';
import { Notice } from '@/types';

// 모든 공지사항 가져오기
export async function getNotices(): Promise<Notice[]> {
  try {
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return [];
    }

    // 단순 쿼리로 변경 - 클라이언트에서 정렬
    const noticesQuery = query(
      collection(db, 'notices'),
      orderBy('createdAt', 'desc') // 최신순만
    );
    
    const querySnapshot = await getDocs(noticesQuery);
    const notices = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Notice;
    });

    // 클라이언트에서 정렬: 고정 공지사항을 먼저, 그 다음 최신순
    return notices.sort((a, b) => {
      // 먼저 고정 여부로 정렬
      if (a.isFixed && !b.isFixed) return -1;
      if (!a.isFixed && b.isFixed) return 1;
      // 같은 고정 상태라면 최신순으로 정렬
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  } catch (error) {
    console.error('공지사항 목록 가져오기 오류:', error);
    return [];
  }
}

// 게시된 공지사항만 가져오기 (고객용)
export async function getPublishedNotices(): Promise<Notice[]> {
  try {
    console.log('getPublishedNotices: 공지사항 조회 시작');
    
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return [];
    }
    
    // 단순 쿼리로 변경 - 클라이언트에서 필터링 및 정렬
    const noticesQuery = query(
      collection(db, 'notices'),
      orderBy('createdAt', 'desc') // 최신순만
    );
    
    const querySnapshot = await getDocs(noticesQuery);
    console.log('getPublishedNotices: 전체 문서 개수:', querySnapshot.size);
    
    const notices = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Notice;
    });

    console.log('getPublishedNotices: 전체 공지사항:', notices);
    console.log('getPublishedNotices: 각 공지사항의 isVisible 값:');
    notices.forEach((notice, index) => {
      console.log(`${index + 1}. ${notice.title} - isVisible: ${notice.isVisible}`);
    });

    // 클라이언트에서 필터링 및 정렬
    const filteredNotices = notices
      .filter(notice => notice.isVisible) // 게시된 것만 필터링
      .sort((a, b) => {
        // 먼저 고정 여부로 정렬
        if (a.isFixed && !b.isFixed) return -1;
        if (!a.isFixed && b.isFixed) return 1;
        // 같은 고정 상태라면 최신순으로 정렬
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    console.log('getPublishedNotices: 필터링된 공지사항:', filteredNotices);
    console.log('getPublishedNotices: 필터링된 공지사항 개수:', filteredNotices.length);

    return filteredNotices;
  } catch (error) {
    console.error('게시된 공지사항 목록 가져오기 오류:', error);
    return [];
  }
}

// 특정 공지사항 가져오기
export async function getNotice(id: string): Promise<Notice | null> {
  try {
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return null;
    }

    const docRef = doc(db, 'notices', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Notice;
    }

    return null;
  } catch (error) {
    console.error('공지사항 가져오기 오류:', error);
    return null;
  }
}

// 새 공지사항 생성
export async function createNotice(
  noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt' | 'views'>
): Promise<string | null> {
  try {
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return null;
    }

    const docRef = doc(collection(db, 'notices'));
    const now = new Date();
    
    const notice: Notice = {
      ...noticeData,
      id: docRef.id,
      views: 0,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, {
      ...notice,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('공지사항 생성 오류:', error);
    return null;
  }
}

// 공지사항 수정
export async function updateNotice(
  id: string,
  updateData: Partial<Omit<Notice, 'id' | 'createdAt' | 'views'>>
): Promise<boolean> {
  try {
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return false;
    }

    const docRef = doc(db, 'notices', id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('공지사항 수정 오류:', error);
    return false;
  }
}

// 공지사항 삭제
export async function deleteNotice(id: string): Promise<boolean> {
  try {
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return false;
    }

    const docRef = doc(db, 'notices', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('공지사항 삭제 오류:', error);
    return false;
  }
}

// 조회수 증가
export async function incrementNoticeViews(id: string): Promise<boolean> {
  try {
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return false;
    }

    const docRef = doc(db, 'notices', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0;
      await updateDoc(docRef, {
        views: currentViews + 1
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('조회수 증가 오류:', error);
    return false;
  }
}

// 공지사항 상단 고정/해제
export async function toggleNoticeFixed(id: string, isFixed: boolean): Promise<boolean> {
  try {
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return false;
    }

    const docRef = doc(db, 'notices', id);
    await updateDoc(docRef, {
      isFixed,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('공지사항 고정 설정 오류:', error);
    return false;
  }
}

// 공지사항 게시/비공개
export async function toggleNoticeVisibility(id: string, isVisible: boolean): Promise<boolean> {
  try {
    if (!db) {
      console.error('Firebase 데이터베이스가 초기화되지 않았습니다.');
      return false;
    }

    const docRef = doc(db, 'notices', id);
    await updateDoc(docRef, {
      isVisible,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('공지사항 게시 설정 오류:', error);
    return false;
  }
}

// 초기 데이터 생성 (리뉴얼 공지사항만)
export async function initializeNotices(): Promise<void> {
  try {
    const existingNotices = await getNotices();
    
    // 이미 공지사항이 있으면 초기화하지 않음
    if (existingNotices.length > 0) {
      return;
    }

    // 리뉴얼 공지사항만 생성
    const renewalNotice = {
      title: '골프상회 홈페이지 리뉴얼 안내',
      content: `안녕하세요. 골프상회입니다.

더 나은 서비스 제공을 위해 홈페이지를 리뉴얼했습니다.

🎉 주요 개선사항:
- 새로운 디자인과 사용자 인터페이스
- 상품 검색 및 필터링 기능 향상
- 모바일 최적화
- 주문 및 결제 프로세스 개선
- 마이페이지 기능 강화

앞으로도 더 좋은 서비스로 찾아뵙겠습니다.

감사합니다.`,
      isFixed: true,
      isVisible: true,
      author: 'admin'
    };

    await createNotice(renewalNotice);
    console.log('초기 공지사항 생성 완료');
  } catch (error) {
    console.error('초기 공지사항 생성 오류:', error);
  }
}
