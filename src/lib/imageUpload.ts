/**
 * API 라우트를 통해 이미지를 업로드합니다 (CORS 문제 해결)
 * @param file 업로드할 이미지 파일
 * @param productName 상품명 (파일명 생성용)
 * @returns Promise<string> 업로드된 이미지의 다운로드 URL
 */
export async function uploadImage(file: File, productName: string): Promise<string> {
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

    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', productName);

    // API 라우트로 업로드 요청
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '업로드에 실패했습니다.');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '업로드에 실패했습니다.');
    }

    return result.url;
    
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
  return uploadImage(file, productName);
}

/**
 * 여러 이미지 파일을 순차적으로 업로드합니다. (백엔드 API 사용)
 * @param files 업로드할 이미지 파일들
 * @param productName 상품명
 * @param onProgress 진행률 콜백 함수 (선택)
 * @returns Promise<string[]> 업로드된 이미지들의 다운로드 URL 배열
 */
export async function uploadMultipleProductImages(
  files: FileList | File[], 
  productName: string,
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<string[]> {
  const fileArray = Array.from(files);
  const uploadedUrls: string[] = [];
  
  // 파일을 순차적으로 업로드
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    
    try {
      // 진행률 콜백 호출
      if (onProgress) {
        onProgress(i + 1, fileArray.length, file.name);
      }
      
      // API를 통해 업로드
      const url = await uploadImage(file, productName);
      uploadedUrls.push(url);
      
      // 다음 업로드 전 잠시 대기 (서버 부하 감소)
      if (i < fileArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`파일 업로드 실패: ${file.name}`, error);
      throw new Error(`${file.name} 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  return uploadedUrls;
}

// uploadImageWithRetry 함수는 API 라우트 사용으로 인해 더 이상 필요하지 않음

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
