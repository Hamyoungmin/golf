'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  category: string;
  hasDropdown?: boolean;
}

const Header = () => {
  const pathname = usePathname();
  const [isNewArrivalsOpen, setIsNewArrivalsOpen] = useState(false);
  const [isLostBallsOpen, setIsLostBallsOpen] = useState(false);
  
  const navigationItems: NavigationItem[] = [
    { name: '홈', href: '/', category: 'home' },
    { name: '신규입고', href: '/new-arrivals', category: 'new', hasDropdown: true },
    { name: '로스트볼', href: '/lost-balls', category: 'lost', hasDropdown: true },
    { name: '드라이버', href: '/drivers', category: 'drivers' },
    { name: '우드', href: '/woods', category: 'woods' },
    { name: '유틸리티', href: '/utilities', category: 'utilities' },
    { name: '아이언', href: '/irons', category: 'irons' },
    { name: '웨지', href: '/wedges', category: 'wedges' },
    { name: '퍼터', href: '/putters', category: 'putters' },
    { name: '여성용', href: '/womens', category: 'womens' },
    { name: '왼손용', href: '/left-handed', category: 'left' },
    { name: '키즈', href: '/kids', category: 'kids' }
  ];

  const newArrivalsItems = [
    { name: '25년05월 입고', href: '/new-arrivals/2025-05' },
    { name: '25년06월 입고', href: '/new-arrivals/2025-06' }
  ];

  const lostBallsItems = [
    { name: '브랜드 혼합', href: '/lost-balls/brand-mix' },
    { name: '타이틀리스트', href: '/lost-balls/titleist' },
    { name: '캘러웨이', href: '/lost-balls/callaway' },
    { name: '테일러메이드', href: '/lost-balls/taylormade' }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <Link href="/" className="logo">
            골프용품 도매몰
          </Link>
          <div className="auth-buttons">
            <Link href="/login" className="auth-button">
              로그인
            </Link>
            <Link href="/register" className="auth-button">
              회원가입
            </Link>
          </div>
        </div>
      </div>
      
      <nav className="navigation">
        <div className="container">
          <ul className="nav-list">
            {navigationItems.map((item) => {
              const isNewArrivals = item.category === 'new';
              const isLostBalls = item.category === 'lost';
              const dropdownItems = isNewArrivals ? newArrivalsItems : isLostBalls ? lostBallsItems : [];
              const isDropdownOpen = isNewArrivals ? isNewArrivalsOpen : isLostBalls ? isLostBallsOpen : false;
              
              return (
                <li 
                  key={item.category} 
                  className={`nav-item ${item.hasDropdown ? 'dropdown-item' : ''}`}
                  onMouseEnter={item.hasDropdown ? () => {
                    if (isNewArrivals) setIsNewArrivalsOpen(true);
                    if (isLostBalls) setIsLostBallsOpen(true);
                  } : undefined}
                  onMouseLeave={item.hasDropdown ? () => {
                    if (isNewArrivals) setIsNewArrivalsOpen(false);
                    if (isLostBalls) setIsLostBallsOpen(false);
                  } : undefined}
                >
                  {item.hasDropdown ? (
                    <>
                      <Link href={item.href} className={`nav-link dropdown-trigger ${isActiveLink(item.href) ? 'active' : ''}`}>
                        {item.name}
                      </Link>
                      {isDropdownOpen && (
                        <ul className="dropdown-menu">
                          {dropdownItems.map((dropdownItem, index) => (
                            <li key={index} className="dropdown-menu-item">
                              <Link href={dropdownItem.href} className="dropdown-link">
                                {dropdownItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link 
                      href={item.href} 
                      className={`nav-link ${isActiveLink(item.href) ? 'active' : ''}`}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
