'use client';

import Image, { ImageProps } from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    timeoutRef.current = window.setTimeout(() => {
      if (!loadedRef.current) {
        failedUrls.add(originalUrl);
        setUseOriginal(true);
        if (typeof window !== 'undefined') console.warn('[SafeImage] timed out, switching to original:', originalUrl);
      }
    }, 5000);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [useOriginal, originalUrl, failedUrls]);

  const handleLoad: NonNullable<ImageProps['onLoad']> = () => {
    loadedRef.current = true;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  };

  return (
    <Image
      {...rest}
      src={imgSrc || '/placeholder.jpg'}
      alt={alt || ''}
      onError={handleError}
      onLoad={handleLoad}
      loading={loading}
      sizes={sizes}
      {...(useOriginal
        ? { unoptimized: true, loader: () => originalUrl }
        : {})}
    />
  );
}


