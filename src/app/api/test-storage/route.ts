import { NextResponse } from 'next/server';
import { storage, ref, uploadBytes, getDownloadURL } from '@/lib/firebase';

export async function GET() {
  try {
    console.log('🧪 Firebase Storage 연결 테스트 시작');
    
    // Storage 초기화 확인
    if (!storage) {
      throw new Error('Firebase Storage가 초기화되지 않았습니다.');
    }
    
    // 간단한 텍스트 파일로 테스트
    const testContent = new TextEncoder().encode('Firebase Storage 연결 테스트');
    const testFileName = `test/connection-test-${Date.now()}.txt`;
    
    console.log('🧪 테스트 파일 경로:', testFileName);

    // Storage 레퍼런스 생성
    const storageRef = ref(storage, testFileName);
    console.log('🧪 Storage 레퍼런스 생성 완료');
    
    // 파일 업로드
    console.log('🧪 파일 업로드 시작...');
    const snapshot = await uploadBytes(storageRef, testContent, {
      contentType: 'text/plain',
    });
    console.log('🧪 파일 업로드 완료');
    
    // 다운로드 URL 가져오기
    console.log('🧪 다운로드 URL 생성 중...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('🧪 다운로드 URL 생성 완료:', downloadURL);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Storage 연결 성공!',
      testFile: testFileName,
      downloadURL: downloadURL,
      uploadedBytes: snapshot.metadata.size
    });
    
  } catch (error) {
    console.error('🧪 Storage 테스트 에러:', error);
    console.error('🧪 에러 타입:', typeof error);
    console.error('🧪 에러 스택:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Firebase Storage 연결 실패',
        details: error instanceof Error ? error.message : String(error),
        errorType: typeof error
      },
      { status: 500 }
    );
  }
}

