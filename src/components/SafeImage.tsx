'use client';

import Image, { ImageProps } from 'next/image';
import { useCallback, useState } from 'react';

type SafeImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
};

export default function SafeImage({ src, alt, onError, ...rest }: SafeImageProps) {
  const normalized = typeof src === 'string' ? src.trim() : src;
  const [imgSrc, setImgSrc] = useState<string>(normalized || '/placeholder.jpg');

  const handleError = useCallback<NonNullable<ImageProps['onError']>>(
    (event) => {
      if (imgSrc !== '/placeholder.jpg') {
        setImgSrc('/placeholder.jpg');
      }
      if (typeof window !== 'undefined') {
        // 실패한 실제 URL 로깅
        console.warn('[SafeImage] failed to load image:', imgSrc);
      }
      if (onError) onError(event);
    },
    [imgSrc, onError]
  );

  return (
    <Image
      {...rest}
      src={imgSrc || '/placeholder.jpg'}
      alt={alt || ''}
      onError={handleError}
      loading={(rest as any)?.loading ?? 'lazy'}
      sizes={(rest as any)?.sizes ?? '(max-width: 768px) 100vw, 500px'}
    />
  );
}


