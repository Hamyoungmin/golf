import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// 환경변수 검증
const validateFirebaseConfig = () => {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing Firebase environment variables:', missing);
    return false;
  }
  
  return true;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase 앱 초기화 (중복 초기화 방지)
let app: FirebaseApp | null = null;

const initializeFirebaseApp = () => {
  if (!validateFirebaseConfig()) {
    return null;
  }
  
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  return app;
};

// Auth 인스턴스를 lazy하게 생성
let authInstance: Auth | null = null;

export const getFirebaseAuth = () => {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 null 반환
    return null;
  }
  
  if (!authInstance) {
    const firebaseApp = initializeFirebaseApp();
    if (!firebaseApp) {
      console.error('Firebase app could not be initialized');
      return null;
    }
    authInstance = getAuth(firebaseApp);
  }
  
  return authInstance;
};

export const auth = getFirebaseAuth();
export default app;
