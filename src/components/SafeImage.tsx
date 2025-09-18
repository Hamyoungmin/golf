'use client';

import Image, { ImageProps } from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

declare global {
  interface Window {
    __safeImageFailedUrls?: Set<string>;
  }
}

type SafeImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
};

export default function SafeImage({
  src,
  alt,
  onError,
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, 500px',
  priority,
  ...rest
}: SafeImageProps) {
  const normalized = typeof src === 'string' ? src.trim() : src;
  const originalUrl = normalized || '/placeholder.jpg';

  // 세션 내 실패 URL 캐시(최적화 경로 실패 시 다음부터 즉시 원본으로 시작)
  const failedUrls = useMemo<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set<string>();
    // window 전역에 캐시 보관(타입 안전)
    if (!window.__safeImageFailedUrls) window.__safeImageFailedUrls = new Set<string>();
    return window.__safeImageFailedUrls;
  }, []);

  // 이전 버전에서 호스트 판별에 쓰이던 isFirebaseHost는 제거(불필요)

  // 기본은 최적화 경로를 시도하고, 실패/지연 시 원본으로 전환
  const [useOriginal, setUseOriginal] = useState<boolean>(failedUrls.has(originalUrl));
  const [imgSrc, setImgSrc] = useState<string>(originalUrl);
  const loadedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const handleError = useCallback<NonNullable<ImageProps['onError']>>(
    (event) => {
      // 최적화 경로나 원본이 실패했는지에 따라 동작
      if (!useOriginal) {
        // 최적화 경로 실패 → 즉시 원본으로 전환
        failedUrls.add(originalUrl);
        setUseOriginal(true);
        if (typeof window !== 'undefined') console.warn('[SafeImage] optimization failed, switching to original:', originalUrl);
        return;
      }
      // 원본도 실패 → placeholder
      if (imgSrc !== '/placeholder.jpg') setImgSrc('/placeholder.jpg');
      if (typeof window !== 'undefined') console.warn('[SafeImage] original failed, using placeholder for:', originalUrl);
      if (onError) onError(event);
    },
    [useOriginal, originalUrl, imgSrc, onError, failedUrls]
  );

  // 5초 타임아웃: 최적화 경로가 느리면 자동 우회
  useEffect(() => {
    if (useOriginal || loadedRef.current) return;
    // 최적화 경로가 느리면 1.5초 내 자동 우회
    timeoutRef.current = window.setTimeout(() => {
      if (!loadedRef.current) {
        failedUrls.add(originalUrl);
        setUseOriginal(true);
        if (typeof window !== 'undefined') console.warn('[SafeImage] timed out, switching to original:', originalUrl);
      }
    }, 1500);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [useOriginal, originalUrl, failedUrls]);

  const handleLoad: NonNullable<ImageProps['onLoad']> = () => {
    loadedRef.current = true;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  };

  // src 변경 시 상태 초기화하여 새로운 이미지로 전환되도록 함
  useEffect(() => {
    loadedRef.current = false;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setImgSrc(originalUrl);
    setUseOriginal(failedUrls.has(originalUrl));
  }, [originalUrl, failedUrls]);

  // width 또는 height 중 하나만 스타일로 지정되었을 때 종횡비 유지 보정
  const { style: incomingStyle, ...restProps } = rest as { style?: CSSProperties };
  const normalizedStyle = useMemo<CSSProperties | undefined>(() => {
    if (!incomingStyle) return undefined;
    const hasWidth = incomingStyle.width !== undefined;
    const hasHeight = incomingStyle.height !== undefined;
    if (hasWidth && !hasHeight) return { ...incomingStyle, height: 'auto' };
    if (hasHeight && !hasWidth) return { ...incomingStyle, width: 'auto' };
    return incomingStyle;
  }, [incomingStyle]);

  // priority가 true면 loading 속성은 사용하지 않음(Next.js 규칙)
  const effectiveLoading = priority ? undefined : loading;

  return (
    <Image
      {...restProps}
      src={imgSrc || '/placeholder.jpg'}
      alt={alt || ''}
      onError={handleError}
      onLoad={handleLoad}
      loading={effectiveLoading as ImageProps['loading']}
      sizes={sizes}
      priority={priority}
      style={normalizedStyle}
      {...(useOriginal
        ? { unoptimized: true, loader: () => originalUrl }
        : {})}
    />
  );
}


