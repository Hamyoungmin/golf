import { NextRequest, NextResponse } from 'next/server';
import { db, doc, updateDoc, serverTimestamp } from '@/lib/firebase';

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Firebase 초기화 확인
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase가 초기화되지 않았습니다.' },
        { status: 500, headers: corsHeaders }
      );
    }

    const { userId, action, reason, adminUid } = await request.json();
    
    // 필수 파라미터 확인
    if (!userId || !action || !adminUid) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 관리자 권한 확인 (dudals7334@naver.com, rentalgolf@gmail.com 허용)
    // 실제로는 adminUid로 사용자 정보를 조회해서 이메일 확인해야 하지만
    // 현재는 클라이언트 사이드에서 권한 체크하고 있음
    
    const userRef = doc(db, 'users', userId);
    let updateData: any = {
      updatedAt: serverTimestamp()
    };

    if (action === 'approve') {
      updateData = {
        ...updateData,
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: adminUid
      };
    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json(
          { error: '거부 사유가 필요합니다.' },
          { status: 400, headers: corsHeaders }
        );
      }
      
      updateData = {
        ...updateData,
        status: 'rejected',
        rejectionReason: reason,
        rejectedBy: adminUid,
        rejectedAt: serverTimestamp()
      };
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 사용자 상태 업데이트 (서버 사이드에서 실행하므로 권한 우회)
    await updateDoc(userRef, updateData);

    return NextResponse.json(
      { 
        success: true, 
        message: action === 'approve' ? '사용자가 승인되었습니다.' : '사용자가 거부되었습니다.',
        action,
        userId
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('사용자 상태 변경 실패:', error);
    
    return NextResponse.json(
      { 
        error: '사용자 상태 변경에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
