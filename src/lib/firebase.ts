// Firebase가 설정되지 않은 경우에도 빌드가 되도록 모킹
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
  signOut: () => Promise.resolve(),
};

const mockDb = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => null }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
    }),
    add: () => Promise.resolve({ id: 'mock' }),
    where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
  }),
  doc: () => ({
    get: () => Promise.resolve({ exists: false, data: () => null }),
    set: () => Promise.resolve(),
    update: () => Promise.resolve(),
  }),
};

const mockStorage = {
  ref: () => ({
    put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('') } }),
    getDownloadURL: () => Promise.resolve(''),
  }),
};

// Firebase 초기화 시도
let app: any = null;
let auth: any = mockAuth;
let db: any = mockDb;
let storage: any = mockStorage;

// 환경변수가 모두 있는 경우에만 실제 Firebase 초기화
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    typeof window !== 'undefined') {
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    };
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase 초기화 실패, 모킹된 서비스 사용:', error);
  }
}

export { auth, db, storage };
export default app;
