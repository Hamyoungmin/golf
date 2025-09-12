'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, doc, getDoc, setDoc } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { User as UserType } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserType | null;
  loading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  signOut: () => Promise<void>;
  updateUserData: (data: Partial<UserType>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 사용자 데이터 가져오기
  const fetchUserData = async (uid: string) => {
    if (!db) {
      console.error('Firestore가 초기화되지 않았습니다.');
      return null;
    }
    
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserType;
        setUserData(data);
        return data;
      }
    } catch (error) {
      console.error('사용자 데이터 가져오기 실패:', error);
    }
    return null;
  };

  // 관리자 이메일 목록
  const ADMIN_EMAILS = [
    'dudals7334@naver.com',
    'rentalgolf7@naver.com'  // 새로 추가된 관리자
  ];

  // 관리자 권한 확인 - 특정 이메일 목록만 관리자로 인정
  const checkAdminRole = async (email: string) => {
    return ADMIN_EMAILS.includes(email);
  };

  // 사용자 데이터 업데이트
  const updateUserData = async (data: Partial<UserType>) => {
    if (!user || !db) {
      console.error('사용자가 없거나 Firestore가 초기화되지 않았습니다.');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      
      // 로컬 상태 업데이트
      if (userData) {
        setUserData({ ...userData, ...data });
      }
    } catch (error) {
      console.error('사용자 데이터 업데이트 실패:', error);
      throw error;
    }
  };

  // 로그아웃
  const signOut = async () => {
    if (!auth) {
      console.error('Firebase Auth가 초기화되지 않았습니다.');
      return;
    }
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // Auth 상태 변화 감지
  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth가 초기화되지 않았습니다.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // 사용자가 로그인한 경우 사용자 데이터 가져오기
        await fetchUserData(firebaseUser.uid);
        
        // 관리자 권한 확인
        if (firebaseUser.email) {
          const adminRole = await checkAdminRole(firebaseUser.email);
          setIsAdmin(adminRole);
        }
      } else {
        // 사용자가 로그아웃한 경우
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    isApproved: userData?.status === 'approved',
    signOut,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
