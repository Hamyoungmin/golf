import { NextRequest, NextResponse } from 'next/server';
import { storage, ref, uploadBytes, getDownloadURL } from '@/lib/firebase';

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS 요청 처리 (preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// POST 요청 처리 (파일 업로드)
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📤 [Vercel] 업로드 API 호출됨 - Start Time:', new Date().toISOString());
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productName = formData.get('productName') as string;
    
    console.log('📤 [Vercel] 파일 정보:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      productName,
      environment: process.env.NODE_ENV
    });
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!productName) {
      return NextResponse.json(
        { error: '상품명이 없습니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 파일 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 파일명 생성
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedProductName = productName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const fileName = `${sanitizedProductName}_${timestamp}.${fileExtension}`;
    
    // Firebase Storage에 업로드
    const imagePath = `products/${fileName}`;
    console.log('📤 Storage 경로:', imagePath);
    
    const imageRef = ref(storage, imagePath);
    console.log('📤 Storage 레퍼런스 생성 완료');
    
    // File을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    console.log('📤 파일 변환 완료, 크기:', buffer.length);
    
    // 업로드 실행
    console.log('📤 Firebase Storage 업로드 시작...');
    const snapshot = await uploadBytes(imageRef, buffer, {
      contentType: file.type,
    });
    console.log('📤 Firebase Storage 업로드 완료');
    
    // 다운로드 URL 가져오기
    console.log('📤 다운로드 URL 가져오는 중...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('📤 다운로드 URL 생성 완료:', downloadURL);
    
    const duration = Date.now() - startTime;
    console.log(`📤 [Vercel] 업로드 완료! 소요시간: ${duration}ms`);
    
    return NextResponse.json(
      { 
        success: true, 
        url: downloadURL,
        fileName: fileName,
        duration: duration
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Vercel] 업로드 에러 (${duration}ms):`, error);
    console.error('❌ 에러 타입:', typeof error);
    console.error('❌ 에러 스택:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: '업로드에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        duration: duration
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
