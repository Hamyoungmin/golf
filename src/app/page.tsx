import ImageSlider from '@/components/ImageSlider';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <ImageSlider />
      
      {/* 임시 관리자 페이지 직접 링크 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Link 
            href="/admin" 
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            🛠️ 관리자 페이지 바로가기 (개발용)
          </Link>
        </div>
      </div>
    </div>
  );
}