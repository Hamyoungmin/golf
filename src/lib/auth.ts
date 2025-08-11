import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { auth } from './firebase';

// 회원가입
export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'unknown';
    throw new Error(getFirebaseErrorMessage(errorCode));
  }
};

// 로그인
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'unknown';
    throw new Error(getFirebaseErrorMessage(errorCode));
  }
};

// 로그아웃
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch {
    throw new Error('로그아웃 중 오류가 발생했습니다.');
  }
};

// Firebase 에러 메시지를 한국어로 변환
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return '등록되지 않은 이메일입니다.';
    case 'auth/wrong-password':
      return '비밀번호가 틀렸습니다.';
    case 'auth/email-already-in-use':
      return '이미 사용 중인 이메일입니다.';
    case 'auth/weak-password':
      return '비밀번호는 6자리 이상이어야 합니다.';
    case 'auth/invalid-email':
      return '유효하지 않은 이메일 형식입니다.';
    case 'auth/invalid-credential':
      return '이메일 또는 비밀번호가 잘못되었습니다.';
    case 'auth/too-many-requests':
      return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '인증 중 오류가 발생했습니다. 다시 시도해주세요.';
  }
};
