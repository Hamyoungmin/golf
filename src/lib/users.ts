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
    
    const users = querySnapshot.docs.map((doc) => {
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
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate(),
      } as User;
    });

    // 클라이언트 사이드에서 생성일 기준으로 정렬 (최신순)
    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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

// 이메일로 사용자 찾기
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      ...data,
      uid: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      approvedAt: data.approvedAt?.toDate(),
    } as User;
  } catch (error) {
    console.error('이메일로 사용자 찾기 오류:', error);
    return null;
  }
}

// 관리자 권한 부여
export async function grantAdminRole(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. 이메일로 사용자 찾기
    const user = await getUserByEmail(email);
    
    if (!user) {
      return { success: false, message: '해당 이메일의 사용자를 찾을 수 없습니다.' };
    }

    // 2. 이미 관리자인지 확인
    if (user.role === 'admin') {
      return { success: false, message: '이미 관리자 권한을 가진 사용자입니다.' };
    }

    // 3. 관리자 권한 부여
    const updateResult = await updateUserProfile(user.uid, {
      role: 'admin',
      isAdmin: true,
      status: 'approved' // 관리자는 자동으로 승인 상태로 변경
    });

    if (updateResult) {
      return { success: true, message: `${email} 계정에 관리자 권한이 부여되었습니다.` };
    } else {
      return { success: false, message: '관리자 권한 부여 중 오류가 발생했습니다.' };
    }
  } catch (error) {
    console.error('관리자 권한 부여 오류:', error);
    return { success: false, message: '관리자 권한 부여 중 오류가 발생했습니다.' };
  }
}
