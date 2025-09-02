import { 
  db,
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
  limit as firestoreLimit
} from './firebase';
import { PaymentInfo, BankAccount } from '@/types';

// 설정에서 계좌 정보 가져오기
export function getBankAccountsFromSettings(): BankAccount[] {
  try {
    const settingsData = localStorage.getItem('adminSettings');
    if (settingsData) {
      const settings = JSON.parse(settingsData).settings;
      return settings?.payment?.bankAccounts || [];
    }
  } catch (error) {
    console.error('계좌 정보 가져오기 오류:', error);
  }
  
  // 기본 계좌 정보 (localStorage에서 가져올 수 없는 경우)
  return [
    {
      bankName: '국민은행',
      accountNumber: '279801-04-257481',
      accountHolder: '권혁규'
    },
    {
      bankName: '신협',
      accountNumber: '131-017-435952',
      accountHolder: '권혁규'
    }
  ];
}

// 대기 중인 결제 목록 가져오기
export async function getPendingPayments(limit?: number): Promise<Partial<PaymentInfo>[]> {
  try {
    let q = query(
      collection(db, 'payments'),
      where('status', '==', 'pending')
    );
    
    if (limit) {
      q = query(q, firestoreLimit(limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    const payments = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        verifiedAt: data.verifiedAt?.toDate(),
        transferDate: data.bankTransferInfo?.transferDate?.toDate(),
      };
    });

    // 클라이언트 사이드에서 생성일 기준으로 정렬 (최신순)
    return payments.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('대기 중인 결제 목록 가져오기 오류:', error);
    return [];
  }
}

// 모든 결제 정보 가져오기
export async function getAllPayments(limit?: number): Promise<Partial<PaymentInfo>[]> {
  try {
    let q = query(collection(db, 'payments'));
    
    if (limit) {
      q = query(q, firestoreLimit(limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    const payments = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        verifiedAt: data.verifiedAt?.toDate(),
        transferDate: data.bankTransferInfo?.transferDate?.toDate(),
      };
    });

    // 클라이언트 사이드에서 생성일 기준으로 정렬 (최신순)
    return payments.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('결제 목록 가져오기 오류:', error);
    return [];
  }
}

// 특정 결제 정보 가져오기
export async function getPaymentInfo(orderId: string): Promise<PaymentInfo | null> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('orderId', '==', orderId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        verifiedAt: data.verifiedAt?.toDate(),
        transferDate: data.bankTransferInfo?.transferDate?.toDate(),
      } as PaymentInfo;
    }

    return null;
  } catch (error) {
    console.error('결제 정보 가져오기 오류:', error);
    return null;
  }
}

// 결제 정보 생성
export async function createPaymentInfo(paymentData: Omit<PaymentInfo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const docRef = doc(collection(db, 'payments'));
    const now = new Date();
    
    const paymentInfo: PaymentInfo = {
      ...paymentData,
      // id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, paymentInfo);
    return docRef.id;
  } catch (error) {
    console.error('결제 정보 생성 오류:', error);
    return null;
  }
}

// 결제 상태 업데이트
export async function updatePaymentStatus(
  paymentId: string, 
  status: 'confirmed' | 'rejected',
  adminId: string,
  notes?: string
): Promise<boolean> {
  try {
    const docRef = doc(db, 'payments', paymentId);
    const updateData: Partial<PaymentInfo> = {
      status,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('결제 상태 업데이트 오류:', error);
    return false;
  }
}

// 계좌이체 정보 업데이트
export async function updateBankTransferInfo(
  paymentId: string,
  transferInfo: {
    depositorName: string;
    transferDate: Date;
    transferNote?: string;
  }
): Promise<boolean> {
  try {
    const docRef = doc(db, 'payments', paymentId);
    await updateDoc(docRef, {
      'bankTransferInfo.depositorName': transferInfo.depositorName,
      'bankTransferInfo.transferDate': transferInfo.transferDate,
      'bankTransferInfo.transferNote': transferInfo.transferNote || '',
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('계좌이체 정보 업데이트 오류:', error);
    return false;
  }
}

// 주문 ID로 결제 정보 가져오기
export async function getPaymentByOrderId(orderId: string): Promise<PaymentInfo | null> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('orderId', '==', orderId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        verifiedAt: data.verifiedAt?.toDate(),
        transferDate: data.bankTransferInfo?.transferDate?.toDate(),
      } as PaymentInfo;
    }

    return null;
  } catch (error) {
    console.error('결제 정보 가져오기 오류:', error);
    return null;
  }
}

// 통화 포맷팅
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

// 결제 상태 텍스트 변환
export function getPaymentStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return '결제 대기';
    case 'confirmed':
      return '결제 확인';
    case 'rejected':
      return '결제 거부';
    default:
      return '알 수 없음';
  }
}

// 결제 상태 색상 변환
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'confirmed':
      return 'text-blue-600 bg-blue-100';
    case 'rejected':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
