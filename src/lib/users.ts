import { 
  db,
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy
} from './firebase';
import { User } from '@/types';

// 특정 사용자 정보 가져오기
export async function getUserData(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        uid: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
      } as User;
    }

    return null;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
}

// 모든 사용자 목록 가져오기 (관리자용)
export async function getAllUsers(): Promise<User[]> {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
      } as User;
    });

    return users;
  } catch (error) {
    console.error('사용자 목록 가져오기 오류:', error);
    return [];
  }
}

// 사용자 정보 생성/업데이트
export async function createOrUpdateUser(userId: string, userData: Partial<User>): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId);
    const now = new Date();
    
    const updateData = {
      ...userData,
      updatedAt: now,
    };

    // 문서가 존재하지 않으면 createdAt도 설정
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      updateData.createdAt = now;
    }

    await setDoc(docRef, updateData, { merge: true });
    return true;
  } catch (error) {
    console.error('사용자 정보 업데이트 오류:', error);
    return false;
  }
}

// 사용자 승인 상태 업데이트
export async function updateUserStatus(
  userId: string, 
  status: 'approved' | 'rejected', 
  adminId: string,
  rejectionReason?: string
): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId);
            const updateData: Partial<User> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'approved') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = adminId;
    } else if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('사용자 상태 업데이트 오류:', error);
    return false;
  }
}

// 대기 중인 사용자 목록 가져오기
export async function getPendingUsers(): Promise<User[]> {
  try {
    const q = query(
      collection(db, 'users'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
      } as User;
    });

    return users;
  } catch (error) {
    console.error('대기 중인 사용자 목록 가져오기 오류:', error);
    return [];
  }
}

// 사용자 프로필 업데이트
export async function updateUserProfile(userId: string, profileData: Partial<User>): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId);
    const updateData = {
      ...profileData,
      updatedAt: new Date(),
    };

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('사용자 프로필 업데이트 오류:', error);
    return false;
  }
}
