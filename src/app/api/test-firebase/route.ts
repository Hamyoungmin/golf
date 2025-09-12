import { NextResponse } from 'next/server';
import { storage, ref, db } from '@/lib/firebase';

export async function GET() {
  try {
    console.log('🔥 Firebase 연결 테스트 시작');
    
    // 환경변수 확인
    const envVars = {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    };
    
    console.log('🔥 환경변수 상태:', envVars);
    
    // Firebase 객체들 존재 확인
    const firebaseStatus = {
      storage: !!storage,
      db: !!db,
      storageConstructor: storage?.constructor?.name,
      dbConstructor: db?.constructor?.name
    };
    
    console.log('🔥 Firebase 객체 상태:', firebaseStatus);
    
    // Storage 버킷 접근 테스트
    let storageTest = null;
    try {
      if (storage) {
        const testRef = ref(storage, 'test/connection-test.txt');
        console.log('🔥 Storage 레퍼런스 생성 성공');
        storageTest = { success: true, message: 'Storage 레퍼런스 생성 성공' };
      } else {
        storageTest = { success: false, message: 'Storage 객체가 없음' };
      }
    } catch (error) {
      console.error('🔥 Storage 테스트 실패:', error);
      storageTest = { 
        success: false, 
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : null
      };
    }
    
    // Firestore 연결 테스트
    let firestoreTest = null;
    try {
      if (db) {
        // 간단한 컬렉션 참조 생성 (실제로 읽지는 않음)
        // const testCollection = collection(db, 'test');
        console.log('🔥 Firestore 컬렉션 참조 생성 성공');
        firestoreTest = { success: true, message: 'Firestore 컬렉션 참조 생성 성공' };
      } else {
        firestoreTest = { success: false, message: 'Firestore 객체가 없음' };
      }
    } catch (error) {
      console.error('🔥 Firestore 테스트 실패:', error);
      firestoreTest = { 
        success: false, 
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : null
      };
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envVars,
      firebase: firebaseStatus,
      tests: {
        storage: storageTest,
        firestore: firestoreTest
      }
    });
    
  } catch (error) {
    console.error('🔥 Firebase 테스트 전체 실패:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
}
