import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';

export async function GET() {
  try {
    console.log('🔍 Firebase Storage 디버깅 시작');
    
    // 환경변수 확인
    const envVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 10) + '...',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    };
    
    console.log('🔍 환경변수:', envVars);
    
    // Storage 객체 확인
    const storageInfo = {
      app: storage.app.name,
      bucket: storage.app.options.storageBucket
    };
    
    console.log('🔍 Storage 정보:', storageInfo);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase 연결 정상',
      env: envVars,
      storage: storageInfo
    });
    
  } catch (error) {
    console.error('🔍 Firebase 연결 에러:', error);
    return NextResponse.json(
      { 
        error: 'Firebase 연결 실패',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

