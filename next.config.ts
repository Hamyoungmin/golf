import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 골프상회 도메인 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      // Google user content (Firebase가 내부적으로 리사이징 프록시를 쓸 때 사용)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 256, 384],
  },
  
  eslint: {
    ignoreDuringBuilds: false, // 오류 확인을 위해 일시적으로 비활성화
  },
  
  typescript: {
    ignoreBuildErrors: false, // 오류 확인을 위해 일시적으로 비활성화
  },
  
  // 도메인 관련 환경 변수
  env: {
    SITE_NAME: '골프상회',
    SITE_DESCRIPTION: '골프용품 전문 도매몰',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
  },
};

export default nextConfig;
