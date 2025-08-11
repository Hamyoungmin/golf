'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  ShoppingBagIcon,
  ClipboardListIcon,
  UsersIcon,
  CubeIcon,
  ChartBarIcon,
  SpeakerphoneIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const menuItems = [
    { 
      name: '대시보드', 
      href: '/admin', 
      icon: HomeIcon 
    },
    { 
      name: '상품 관리', 
      href: '/admin/products', 
      icon: ShoppingBagIcon 
    },
    { 
      name: '주문 관리', 
      href: '/admin/orders', 
      icon: ClipboardListIcon 
    },
    { 
      name: '고객 관리', 
      href: '/admin/customers', 
      icon: UsersIcon 
    },
    { 
      name: '재고 관리', 
      href: '/admin/inventory', 
      icon: CubeIcon 
    },
    { 
      name: '매출 통계', 
      href: '/admin/analytics', 
      icon: ChartBarIcon 
    },
    { 
      name: '공지사항', 
      href: '/admin/notices', 
      icon: SpeakerphoneIcon 
    },
    { 
      name: 'FAQ 관리', 
      href: '/admin/faq', 
      icon: QuestionMarkCircleIcon 
    },
    { 
      name: '리뷰 관리', 
      href: '/admin/reviews', 
      icon: StarIcon 
    },
    { 
      name: '설정', 
      href: '/admin/settings', 
      icon: CogIcon 
    },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen">
      <div className="p-6">
        <Link href="/admin" className="text-2xl font-bold">
          골프 어드민
        </Link>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive 
                  ? 'bg-gray-900 text-white border-l-4 border-green-500' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-6">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-200"
        >
          ← 쇼핑몰로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
