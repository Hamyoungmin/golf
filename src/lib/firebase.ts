import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.error('Firebase 초기화 실패:', error);
}

export { auth, db, storage };

export default app;