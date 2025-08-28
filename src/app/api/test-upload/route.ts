import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API 라우트 정상 작동',
    env: {
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 테스트 API 호출됨');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('🔧 파일 정보:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size
    });
    
    return NextResponse.json({
      success: true,
      message: '파일 받기 성공',
      fileName: file?.name,
      fileSize: file?.size,
      url: '/placeholder.jpg' // 테스트용 더미 URL
    });
    
  } catch (error) {
    console.error('🔧 테스트 에러:', error);
    return NextResponse.json(
      { error: '테스트 실패', details: String(error) },
      { status: 500 }
    );
  }
}
