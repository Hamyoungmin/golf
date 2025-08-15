'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { User as UserType } from '@/types';

// Firebase 함수들을 안전하게 import
let FirebaseUser: any = null;
let onAuthStateChanged: any = null;
let firebaseSignOut: any = null;
let doc: any = null;
let getDoc: any = null;
let setDoc: any = null;

// Firebase가 사용 가능할 때만 함수들을 import
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    const firebaseAuth = require('firebase/auth');
    const firestore = require('firebase/firestore');
    
    FirebaseUser = firebaseAuth.User;
    onAuthStateChanged = firebaseAuth.onAuthStateChanged;
    firebaseSignOut = firebaseAuth.signOut;
    doc = firestore.doc;
    getDoc = firestore.getDoc;
    setDoc = firestore.setDoc;
  } catch (error) {
    console.warn('Firebase 함수 import 실패:', error);
  }
}

interface AuthContextType {
  user: any | null;
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
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 데이터 가져오기
  const fetchUserData = async (uid: string) => {
    if (!getDoc || !doc || !db) return null;
    
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

  // 사용자 데이터 업데이트
  const updateUserData = async (data: Partial<UserType>) => {
    if (!user || !setDoc || !doc || !db) return;
    
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
    if (!firebaseSignOut || !auth) {
      setUser(null);
      setUserData(null);
      return;
    }
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      console.log('로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // Auth 상태 변화 감지
  useEffect(() => {
    if (!onAuthStateChanged || !auth) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // 사용자가 로그인한 경우 사용자 데이터 가져오기
        await fetchUserData(firebaseUser.uid);
      } else {
        // 사용자가 로그아웃한 경우
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAdmin: userData?.role === 'admin' || false,
    isApproved: userData?.status === 'approved' || false,
    signOut,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
