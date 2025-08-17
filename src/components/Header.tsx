'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface NavigationItem {
  name: string;
  href: string;
  category: string;
  hasDropdown?: boolean;
}

const Header = () => {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { cartItemCount } = useCart();
  const [isDriversOpen, setIsDriversOpen] = useState(false);
  const [isWoodsOpen, setIsWoodsOpen] = useState(false);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [isWedgesOpen, setIsWedgesOpen] = useState(false);
  const [isPuttersOpen, setIsPuttersOpen] = useState(false);
  const [isLeftHandedOpen, setIsLeftHandedOpen] = useState(false);
  const [isWomensOpen, setIsWomensOpen] = useState(false);
  
  const navigationItems: NavigationItem[] = [
    { name: '홈', href: '/', category: 'home' },
    { name: '드라이버', href: '/drivers', category: 'drivers', hasDropdown: true },
    { name: '우드', href: '/woods', category: 'woods', hasDropdown: true },
    { name: '유틸리티', href: '/utilities', category: 'utilities', hasDropdown: true },
    { name: '웨지', href: '/wedges', category: 'wedges', hasDropdown: true },
    { name: '퍼터', href: '/putters', category: 'putters', hasDropdown: true },
    { name: '왼손용', href: '/left-handed', category: 'left', hasDropdown: true },
    { name: '여성용', href: '/womens', category: 'womens', hasDropdown: true }
  ];



  const driversItems = [
    { name: '타이틀리스트', href: '/drivers/titleist' },
    { name: '캘러웨이', href: '/drivers/callaway' },
    { name: '테일러메이드', href: '/drivers/taylormade' },
    { name: '혼마', href: '/drivers/honma' },
    { name: '젝시오', href: '/drivers/xxio' },
    { name: '브리지스톤', href: '/drivers/bridgestone' },
    { name: '기타', href: '/drivers/others' }
  ];

  const woodsItems = [
    { name: '타이틀리스트', href: '/woods/titleist' },
    { name: '캘러웨이', href: '/woods/callaway' },
    { name: '테일러메이드', href: '/woods/taylormade' },
    { name: '혼마', href: '/woods/honma' },
    { name: '젝시오', href: '/woods/xxio' },
    { name: '브리지스톤', href: '/woods/bridgestone' },
    { name: '기타', href: '/woods/others' }
  ];

  const utilitiesItems = [
    { name: '타이틀리스트', href: '/utilities/titleist' },
    { name: '캘러웨이', href: '/utilities/callaway' },
    { name: '테일러메이드', href: '/utilities/taylormade' },
    { name: '혼마', href: '/utilities/honma' },
    { name: '젝시오', href: '/utilities/xxio' },
    { name: '브리지스톤', href: '/utilities/bridgestone' },
    { name: '기타', href: '/utilities/others' }
  ];

  const wedgesItems = [
    { name: '타이틀리스트', href: '/wedges/titleist' },
    { name: '캘러웨이', href: '/wedges/callaway' },
    { name: '테일러메이드', href: '/wedges/taylormade' },
    { name: '혼마', href: '/wedges/honma' },
    { name: '젝시오', href: '/wedges/xxio' },
    { name: '브리지스톤', href: '/wedges/bridgestone' },
    { name: '기타', href: '/wedges/others' }
  ];

  const puttersItems = [
    { name: '타이틀리스트', href: '/putters/titleist' },
    { name: '캘러웨이', href: '/putters/callaway' },
    { name: '테일러메이드', href: '/putters/taylormade' },
    { name: '혼마', href: '/putters/honma' },
    { name: '젝시오', href: '/putters/xxio' },
    { name: '브리지스톤', href: '/putters/bridgestone' },
    { name: '기타', href: '/putters/others' }
  ];

  const leftHandedItems = [
    { name: '타이틀리스트', href: '/left-handed/titleist' },
    { name: '캘러웨이', href: '/left-handed/callaway' },
    { name: '테일러메이드', href: '/left-handed/taylormade' },
    { name: '혼마', href: '/left-handed/honma' },
    { name: '젝시오', href: '/left-handed/xxio' },
    { name: '브리지스톤', href: '/left-handed/bridgestone' },
    { name: '기타', href: '/left-handed/others' }
  ];

  const womensItems = [
    { name: '타이틀리스트', href: '/womens/titleist' },
    { name: '캘러웨이', href: '/womens/callaway' },
    { name: '테일러메이드', href: '/womens/taylormade' },
    { name: '혼마', href: '/womens/honma' },
    { name: '젝시오', href: '/womens/xxio' },
    { name: '브리지스톤', href: '/womens/bridgestone' },
    { name: '기타', href: '/womens/others' }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // 로그아웃 후 홈페이지로 이동하지 않고 현재 페이지에 머물기
    } catch (error) {
      console.error('로그아웃 오류:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
                  <Link href="/" className="logo">
          골프상회
        </Link>
          <div className="auth-buttons">
            {/* 장바구니 아이콘 */}
            <Link href="/cart" className="auth-button" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="m1 1 4 4 1 6 8 0 9-10H6"></path>
              </svg>
              {cartItemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#ff6b35',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            
            {loading ? (
              <div className="auth-button">로딩중...</div>
            ) : user ? (
              <>
                <Link href="/mypage" className="auth-button">
                  마이페이지
                </Link>
                <button 
                  onClick={handleSignOut} 
                  className="auth-button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="auth-button">
                  로그인
                </Link>
                <Link href="/register" className="auth-button">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      <nav className="navigation">
        <div className="container">
          <ul className="nav-list">
            {navigationItems.map((item) => {
              const isDrivers = item.category === 'drivers';
              const isWoods = item.category === 'woods';
              const isUtilities = item.category === 'utilities';
              const isWedges = item.category === 'wedges';
              const isPutters = item.category === 'putters';
              const isLeftHanded = item.category === 'left';
              const isWomens = item.category === 'womens';
              
              const dropdownItems = isDrivers ? driversItems 
                : isWoods ? woodsItems
                : isUtilities ? utilitiesItems
                : isWedges ? wedgesItems
                : isPutters ? puttersItems
                : isLeftHanded ? leftHandedItems
                : isWomens ? womensItems
                : [];
                
              const isDropdownOpen = isDrivers ? isDriversOpen
                : isWoods ? isWoodsOpen
                : isUtilities ? isUtilitiesOpen
                : isWedges ? isWedgesOpen
                : isPutters ? isPuttersOpen
                : isLeftHanded ? isLeftHandedOpen
                : isWomens ? isWomensOpen
                : false;
              
              return (
                <li 
                  key={item.category} 
                  className={`nav-item ${item.hasDropdown ? 'dropdown-item' : ''}`}
                  onMouseEnter={item.hasDropdown ? () => {
                    if (isDrivers) setIsDriversOpen(true);
                    if (isWoods) setIsWoodsOpen(true);
                    if (isUtilities) setIsUtilitiesOpen(true);
                    if (isWedges) setIsWedgesOpen(true);
                    if (isPutters) setIsPuttersOpen(true);
                    if (isLeftHanded) setIsLeftHandedOpen(true);
                    if (isWomens) setIsWomensOpen(true);
                  } : undefined}
                  onMouseLeave={item.hasDropdown ? () => {
                    if (isDrivers) setIsDriversOpen(false);
                    if (isWoods) setIsWoodsOpen(false);
                    if (isUtilities) setIsUtilitiesOpen(false);
                    if (isWedges) setIsWedgesOpen(false);
                    if (isPutters) setIsPuttersOpen(false);
                    if (isLeftHanded) setIsLeftHandedOpen(false);
                    if (isWomens) setIsWomensOpen(false);
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
