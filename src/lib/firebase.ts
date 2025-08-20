// Firebase가 설정되지 않은 경우에도 빌드가 되도록 모킹
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
  signOut: () => Promise.resolve(),
};

// Mock functions that match Firestore API
const mockCollection = (db: any, path: string) => ({
  doc: (id?: string) => mockDoc(db, `${path}/${id || 'mock'}`),
  add: () => Promise.resolve({ id: 'mock' }),
  where: () => ({ get: () => Promise.resolve({ docs: [] }) }),
  get: () => Promise.resolve({ docs: [] }),
});

const mockDoc = (db: any, path: string) => ({
  get: () => Promise.resolve({ 
    exists: false, 
    data: () => null,
    id: 'mock'
  }),
  set: () => Promise.resolve(),
  update: () => Promise.resolve(),
  delete: () => Promise.resolve(),
});

const mockDb = {
  // This will be replaced by the actual functions when Firebase is initialized
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

// Mock Firestore functions
let collection: any = mockCollection;
let doc: any = mockDoc;
let getDoc: any = (docRef: any) => Promise.resolve({ 
  exists: false, 
  data: () => null,
  id: 'mock'
});
let setDoc: any = () => Promise.resolve();
let deleteDoc: any = () => Promise.resolve();
let serverTimestamp: any = () => new Date();
let query: any = (...args: any[]) => ({ get: () => Promise.resolve({ docs: [] }) });
let where: any = () => ({ get: () => Promise.resolve({ docs: [] }) });
let getDocs: any = () => Promise.resolve({ docs: [] });
let updateDoc: any = () => Promise.resolve();
let arrayUnion: any = (...values: any[]) => values;
let arrayRemove: any = (...values: any[]) => values;
let orderBy: any = () => ({ get: () => Promise.resolve({ docs: [] }) });
let limit: any = () => ({ get: () => Promise.resolve({ docs: [] }) });
let startAfter: any = () => ({ get: () => Promise.resolve({ docs: [] }) });
let addDoc: any = () => Promise.resolve({ id: 'mock' });

// Types
let DocumentSnapshot: any = {};
let WhereFilterOp: any = {};

// 환경변수가 모두 있는 경우에만 실제 Firebase 초기화
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  try {
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');
    
    // Import Firestore functions
    const firestoreFunctions = require('firebase/firestore');
    collection = firestoreFunctions.collection;
    doc = firestoreFunctions.doc;
    getDoc = firestoreFunctions.getDoc;
    setDoc = firestoreFunctions.setDoc;
    deleteDoc = firestoreFunctions.deleteDoc;
    serverTimestamp = firestoreFunctions.serverTimestamp;
    query = firestoreFunctions.query;
    where = firestoreFunctions.where;
    getDocs = firestoreFunctions.getDocs;
    updateDoc = firestoreFunctions.updateDoc;
    arrayUnion = firestoreFunctions.arrayUnion;
    arrayRemove = firestoreFunctions.arrayRemove;
    orderBy = firestoreFunctions.orderBy;
    limit = firestoreFunctions.limit;
    startAfter = firestoreFunctions.startAfter;
    addDoc = firestoreFunctions.addDoc;
    
    // Types
    DocumentSnapshot = firestoreFunctions.DocumentSnapshot;
    WhereFilterOp = firestoreFunctions.WhereFilterOp;
    
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

export { 
  auth, 
  db, 
  storage, 
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
  DocumentSnapshot,
  WhereFilterOp
};
export default app;
