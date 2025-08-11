import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { User as UserType } from '@/types';

// Firestore에서 사용자 정보 조회
export const getUserData = async (uid: string): Promise<UserType | null> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        uid,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as UserType;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('사용자 정보를 불러오는 중 오류가 발생했습니다.');
  }
};

// 사용자 정보 저장/업데이트
export const saveUserData = async (
  uid: string, 
  userData: Partial<UserType>
): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // 기존 사용자 정보 업데이트
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date(),
      });
    } else {
      // 새 사용자 정보 생성
      await setDoc(userRef, {
        uid,
        ...userData,
        isAdmin: false, // 기본값으로 일반 사용자
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    throw new Error('사용자 정보 저장 중 오류가 발생했습니다.');
  }
};

// 회원가입 시 추가 정보 저장
export const createUserProfile = async (
  uid: string,
  email: string,
  additionalData: {
    name: string;
    phone: string;
    businessNumber: string;
    companyName: string;
  }
): Promise<void> => {
  try {
    await saveUserData(uid, {
      email,
      ...additionalData,
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('사용자 프로필 생성 중 오류가 발생했습니다.');
  }
};

// 사용자 정보 업데이트
export const updateUserProfile = async (
  uid: string, 
  updateData: Partial<UserType>
): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('사용자 정보 업데이트 중 오류가 발생했습니다.');
  }
};

// 사용자 정보 삭제
export const deleteUserData = async (uid: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore를 사용할 수 없습니다.');

    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw new Error('사용자 정보 삭제 중 오류가 발생했습니다.');
  }
};

// 관리자 권한 확인
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userData = await getUserData(uid);
    return userData?.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
