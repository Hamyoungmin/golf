// 관리자 권한 설정 스크립트
import { doc, setDoc } from 'firebase/firestore';
// import { getDoc } from 'firebase/firestore'; // unused
import { db } from '@/lib/firebase';

export async function setupAdminUser(email: string) {
  try {
    if (!db) {
      throw new Error('Firebase 데이터베이스가 초기화되지 않았습니다.');
    }

    // 1. admins 컬렉션에 추가
    await setDoc(doc(db, 'admins', email), {
      email: email,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log(`✅ admins 컬렉션에 ${email} 추가 완료`);

    // 2. users 컬렉션에서 해당 사용자 찾아서 권한 부여
    // 먼저 UID로 찾기 (Authentication에서 확인)
    // Firebase Auth의 사용자 목록에서 해당 이메일의 UID를 확인해야 함
    
    console.log(`🎉 ${email} 관리자 권한 설정 완료!`);
    
    return { success: true, message: '관리자 권한 설정 완료' };
  } catch (error) {
    console.error('관리자 권한 설정 실패:', error);
    return { success: false, message: '관리자 권한 설정 실패' };
  }
}

// 사용 예시
// setupAdminUser('exam222838@gmail.com');
