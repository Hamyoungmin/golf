'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  UsersIcon,
  CubeIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
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
      icon: ClipboardDocumentListIcon 
    },
    { 
      name: '입금 관리', 
      href: '/admin/payments', 
      icon: BanknotesIcon 
    },
    { 
      name: '사용자 관리', 
      href: '/admin/users', 
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
      icon: SpeakerWaveIcon 
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
    <div className="bg-white w-64 min-h-screen border-r border-gray-200">
      {/* 골프 관리자 제목 - 독립적으로 위치 조정 */}
      <div style={{ paddingTop: '8px', paddingBottom: '15px', paddingLeft: '24px', paddingRight: '24px', borderBottom: '1px solid #e5e7eb', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link href="/admin" className="text-2xl font-bold text-gray-800 block text-center">
          골프 관리자
        </Link>
      </div>
      
      {/* 좌측 메뉴 - 고정된 위치에서 시작 */}
      <nav style={{ marginTop: '30px' }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                color: isActive ? '#333' : '#666',
                backgroundColor: isActive ? '#fff' : 'transparent',
                borderRadius: isActive ? '0' : '0',
                transition: 'all 0.2s ease',
                borderBottom: '1px solid #e5e5e5',
                borderTop: index === 0 ? '1px solid #e5e5e5' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.color = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              <Icon style={{ 
                width: '18px', 
                height: '18px', 
                marginRight: '12px',
                color: isActive ? '#666' : '#999'
              }} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 bg-white">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          ← 쇼핑몰로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
