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
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 도메인 관련 환경 변수
  env: {
    SITE_NAME: '골프상회',
    SITE_DESCRIPTION: '골프용품 전문 도매몰',
  },
};

export default nextConfig;
