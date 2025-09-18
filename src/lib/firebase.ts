import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase exports
export { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
  startAfter,
  addDoc,
  Timestamp,
  writeBatch,
  onSnapshot,
  DocumentSnapshot,
  increment
} from 'firebase/firestore';

export {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Firebase 초기화 설정 (프로덕션에서는 로그 제거)

// Firebase 초기화 (환경변수가 있을 때만)
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof initializeFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      // 네트워크/프록시 환경에서 WebChannel 400을 줄이기 위한 설정
      experimentalAutoDetectLongPolling: true,
      // 탭 간 캐시 공유로 불필요한 네트워크 감소
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
    storage = getStorage(app);
  }
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
}

export { auth, db, storage };

export default app;