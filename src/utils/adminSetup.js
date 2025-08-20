// 브라우저 개발자 도구에서 실행할 코드
// F12 → Console에서 실행

// Firebase 모듈 import (브라우저에서 실행 시)
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function setupExamAdmin() {
  try {
    const email = 'exam222838@gmail.com';
    
    // 1. admins 컬렉션에 추가
    await setDoc(doc(db, 'admins', email), {
      email: email,
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('✅ admins 컬렉션 설정 완료');
    
    // 2. users 컬렉션에서 권한 부여 (UID가 필요함)
    // Firebase Console에서 exam222838@gmail.com의 UID를 확인하고
    // 아래 YOUR_UID 부분을 실제 UID로 교체해야 함
    
    const userUID = 'VvVT4LM1pMbo1Vo3j3iLaS80OXv1'; // Firebase Console에서 확인한 UID
    
    await updateDoc(doc(db, 'users', userUID), {
      role: 'admin',
      status: 'approved'
    });
    
    console.log('✅ users 컬렉션 권한 설정 완료');
    alert('관리자 권한 설정 완료! 다시 로그인해주세요.');
    
  } catch (error) {
    console.error('❌ 설정 실패:', error);
  }
}

// 실행
setupExamAdmin();
