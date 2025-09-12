/**
 * 클라이언트에서 직접 Firebase Storage에 업로드 (무제한!)
 * @param file 업로드할 이미지 파일
 * @param productName 상품명 (파일명 생성용)
 * @returns Promise<string> 업로드된 이미지의 다운로드 URL
 */
export async function uploadImageDirect(file: File, productName: string): Promise<string> {
  try {
    const { storage, ref, uploadBytes, getDownloadURL } = await import('@/lib/firebase');
    
    if (!storage) {
      throw new Error('Firebase Storage가 초기화되지 않았습니다.');
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드 가능합니다.');
    }

    console.log(`📤 [직접 업로드] 시작: ${file.name} (${formatFileSize(file.size)})`);

    // 파일명 생성
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedProductName = productName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const fileName = `${sanitizedProductName}_${timestamp}.${fileExtension}`;
    
    // Firebase Storage에 직접 업로드
    const imagePath = `products/${fileName}`;
    const imageRef = ref(storage, imagePath);
    
    console.log(`📤 [직접 업로드] Firebase Storage 업로드 중... (${imagePath})`);
    
    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // 업로드 실행 (메타데이터 추가)
    const snapshot = await uploadBytes(imageRef, buffer, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadMethod: 'direct',
        productName: productName
      }
    });
    
    console.log(`📤 [직접 업로드] 완료! 파일 크기: ${formatFileSize(file.size)}`);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
    
  } catch (error) {
    console.error('❌ [직접 업로드] 실패:', error);
    throw error;
  }
}

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

    // Vercel 제한 대응: 3.5MB 이상이면 압축
    const maxSize = 3.5 * 1024 * 1024; // 3.5MB
    const processedFile = file;
    
    if (file.size > maxSize) {
      console.log(`📦 파일 크기가 큽니다 (${formatFileSize(file.size)}). 압축을 시도합니다...`);
      // processedFile = await compressImage(file, maxSize); // TODO: 압축 기능 구현 필요
      console.warn('이미지 압축 기능이 구현되지 않았습니다.');
      throw new Error(`파일 크기가 너무 큽니다 (${formatFileSize(file.size)}). 최대 ${formatFileSize(maxSize)}까지 업로드 가능합니다.`);
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('file', processedFile);
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
 * 상품 이미지를 업로드합니다. (직접 Firebase 업로드 - 무제한!)
 * @param file 업로드할 이미지 파일
 * @param productName 상품명 (파일명에 사용)
 * @returns Promise<string> 업로드된 이미지의 다운로드 URL
 */
export async function uploadProductImage(file: File, productName: string): Promise<string> {
  return uploadImageDirect(file, productName);
}

/**
 * 여러 이미지 파일을 순차적으로 업로드합니다. (직접 Firebase 업로드 - 무제한!)
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
  
  console.log(`🚀 [무제한 업로드] ${fileArray.length}개 파일 직접 업로드 시작`);
  
  // 파일을 순차적으로 직접 업로드
  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    
    try {
      // 진행률 콜백 호출
      if (onProgress) {
        onProgress(i + 1, fileArray.length, file.name);
      }
      
      // 직접 Firebase Storage에 업로드 (무제한!)
      const url = await uploadImageDirect(file, productName);
      uploadedUrls.push(url);
      
      console.log(`✅ [무제한 업로드] ${i + 1}/${fileArray.length} 완료: ${file.name} (${formatFileSize(file.size)})`);
      
      // 다음 업로드 전 잠시 대기 (Firebase 부하 감소)
      if (i < fileArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`❌ [무제한 업로드] 파일 업로드 실패: ${file.name}`, error);
      throw new Error(`${file.name} 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  console.log(`🎉 [무제한 업로드] 모든 파일 업로드 완료! 총 ${fileArray.length}개`);
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
