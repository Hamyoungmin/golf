import { storage, ref, uploadBytes, getDownloadURL } from './firebase';

/**
 * 이미지 파일을 Firebase Storage에 업로드하고 다운로드 URL을 반환합니다.
 * @param file 업로드할 이미지 파일
 * @param path Storage에서의 저장 경로 (예: 'products/image.jpg')
 * @returns Promise<string> 업로드된 이미지의 다운로드 URL
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.');
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('파일 크기는 5MB 이하여야 합니다.');
    }

    // Storage 레퍼런스 생성
    const imageRef = ref(storage, path);

    // 파일 업로드
    const snapshot = await uploadBytes(imageRef, file);

    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw error;
  }
}

/**
 * 상품 이미지를 업로드합니다.
 * @param file 업로드할 이미지 파일
 * @param productName 상품명 (파일명에 사용)
 * @returns Promise<string> 업로드된 이미지의 다운로드 URL
 */
export async function uploadProductImage(file: File, productName: string): Promise<string> {
  // 파일명 생성 (타임스탬프 + 원본 파일명)
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const sanitizedProductName = productName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
  const fileName = `${sanitizedProductName}_${timestamp}.${fileExtension}`;
  
  // 상품 이미지 경로
  const imagePath = `products/${fileName}`;
  
  return uploadImage(file, imagePath);
}

/**
 * 여러 이미지 파일을 동시에 업로드합니다.
 * @param files 업로드할 이미지 파일들
 * @param productName 상품명
 * @returns Promise<string[]> 업로드된 이미지들의 다운로드 URL 배열
 */
export async function uploadMultipleProductImages(
  files: FileList | File[], 
  productName: string
): Promise<string[]> {
  const fileArray = Array.from(files);
  
  // 모든 이미지를 병렬로 업로드
  const uploadPromises = fileArray.map((file, index) => {
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedProductName = productName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const fileName = `${sanitizedProductName}_${timestamp}_${index}.${fileExtension}`;
    const imagePath = `products/${fileName}`;
    
    return uploadImage(file, imagePath);
  });

  return Promise.all(uploadPromises);
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환합니다.
 * @param bytes 바이트 크기
 * @returns 변환된 크기 문자열 (예: '2.5 MB')
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 파일 타입이 지원되는 이미지 형식인지 확인합니다.
 * @param file 확인할 파일
 * @returns boolean
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}
