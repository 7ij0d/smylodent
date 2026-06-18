import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import {
  Sun,
  Moon,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  LayoutDashboard,
  LogOut,
  Search,
  Globe,
  HelpCircle,
  PhoneCall,
  Info,
  ClipboardList
} from 'lucide-react';

export const Navbar = () => {
  const { lang, toggleLanguage, t, isRtl } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const { cartCount } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`sticky-nav ${scrolled ? 'nav-scrolled' : ''}`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 99,
          width: '100%',
          backgroundColor: scrolled ? 'var(--surface-color)' : 'rgba(255, 255, 255, 0.01)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
          transition: 'var(--transition-smooth)',
          padding: '0.8rem 0'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo Section */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo width={150} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '0 1.5rem' }}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active-link' : ''}`}>
              {t('nav.home')}
            </Link>
            <div className="dropdown-trigger" style={{ position: 'relative', cursor: 'pointer' }}>
              <span className="nav-link">{t('nav.years')}</span>
              <div className="nav-dropdown">
                <Link to="/year/1st-year">{t('years.y1')}</Link>
                <Link to="/year/2nd-year">{t('years.y2')}</Link>
                <Link to="/year/3rd-year">{t('years.y3')}</Link>
                <Link to="/year/4th-year">{t('years.y4')}</Link>
              </div>
            </div>
            <Link to="/about" className="nav-link">{t('nav.about')}</Link>
            <Link to="/track" className={`nav-link ${location.pathname === '/track' ? 'active-link' : ''}`}>{t('nav.track')}</Link>
            <Link to="/contact" className="nav-link">{t('nav.contact')}</Link>
            <Link to="/faq" className="nav-link">{t('nav.faq')}</Link>
          </nav>

          {/* Search Bar Input */}
          <form onSubmit={handleSearchSubmit} className="no-print desktop-search" style={{ position: 'relative', width: '220px' }}>
            <input
              type="text"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.2rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                fontSize: '0.85rem'
              }}
            />
            <button type="submit" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>
              <Search size={16} />
            </button>
          </form>

          {/* Right Action Icons Group */}
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            
            {/* Lang Switcher */}
            <button onClick={toggleLanguage} className="action-btn" title="Toggle Language" style={{ position: 'relative' }}>
              <Globe size={20} />
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold', display: 'block', marginTop: '-3px' }}>
                {lang === 'ar' ? 'EN' : 'AR'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="action-btn" title="Toggle Theme">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart Link with Badge */}
            <Link to="/cart" className="action-btn cart-btn-nav" title="Shopping Cart" style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile Access */}
            <div style={{ position: 'relative' }} className="desktop-profile-wrapper">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  border: user ? '1px solid var(--border-color)' : 'none',
                  padding: user ? '0.3rem 0.6rem' : '0.4rem',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <User size={20} />
                {user && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name?.split(' ')[0] || 'حسابي'}
                  </span>
                )}
              </button>

              {profileDropdownOpen && (
                <div
                  className="profile-menu"
                  style={{
                    position: 'absolute',
                    right: isRtl ? 'auto' : 0,
                    left: isRtl ? 0 : 'auto',
                    top: '100%',
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    width: '180px',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.5rem 0',
                    zIndex: 999
                  }}
                >
                  {user ? (
                    <>
                      {isAdmin && (
                        <Link to="/admin" className="p-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                          <LayoutDashboard size={16} />
                          {t('nav.admin')}
                        </Link>
                      )}
                      <Link to="/favorites" className="p-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                        <Heart size={16} />
                        {t('nav.favorites')}
                      </Link>
                      <Link to="/profile" className="p-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                        <User size={16} />
                        {t('nav.profile')}
                      </Link>
                      <button onClick={signOut} className="p-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.85rem', color: 'var(--danger)', width: '100%', textAlign: 'start' }}>
                        <LogOut size={16} />
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <Link to="/signin" className="p-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                      <User size={16} />
                      {t('nav.signin')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-toggle action-btn">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </header>

      {/* Slide-out Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer glass no-print"
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 98,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-color)',
              }}
            />
            <button type="submit" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }}>
              <Search size={18} />
            </button>
          </form>

          {/* Links list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '1.1rem', fontWeight: 600 }}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>{t('nav.home')}</Link>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('nav.years')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                <Link to="/year/1st-year" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem' }}>{t('years.y1')}</Link>
                <Link to="/year/2nd-year" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem' }}>{t('years.y2')}</Link>
                <Link to="/year/3rd-year" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem' }}>{t('years.y3')}</Link>
                <Link to="/year/4th-year" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '0.95rem' }}>{t('years.y4')}</Link>
              </div>
            </div>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} /> {t('nav.about')}
            </Link>
            <Link to="/track" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardList size={18} /> {t('nav.track')}
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={18} /> {t('nav.contact')}
            </Link>
            <Link to="/faq" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} /> {t('nav.faq')}
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                    <LayoutDashboard size={18} /> {t('nav.admin')}
                  </Link>
                )}
                <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Heart size={18} /> {t('nav.favorites')}
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} /> {t('nav.profile')}
                </Link>
                <button onClick={() => { signOut(); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 600, textAlign: 'start' }}>
                  <LogOut size={18} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/signin" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                <User size={18} /> {t('nav.signin')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Styled css helper for dropdown navigation and nav bar links */}
      <style>{`
        .sticky-nav {
          background-color: var(--surface-color);
        }
        .nav-link {
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-main);
          padding: 0.4rem 0;
          position: relative;
          transition: var(--transition-smooth);
        }
        .nav-link:hover, .active-link {
          color: var(--secondary);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--secondary);
          transition: var(--transition-smooth);
        }
        [dir="rtl"] .nav-link::after {
          left: auto;
          right: 0;
        }
        .nav-link:hover::after, .active-link::after {
          width: 100%;
        }
        .dropdown-trigger:hover .nav-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .nav-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          min-width: 160px;
          padding: 0.5rem 0;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: var(--transition-smooth);
          box-shadow: var(--shadow-md);
          z-index: 100;
          display: flex;
          flex-direction: column;
        }
        [dir="rtl"] .nav-dropdown {
          left: auto;
          right: 0;
        }
        .nav-dropdown a {
          padding: 0.5rem 1.2rem;
          font-size: 0.9rem;
          transition: var(--transition-fast);
        }
        .nav-dropdown a:hover {
          background-color: var(--accent);
          color: var(--secondary);
        }
        .action-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-color);
          color: var(--text-main);
          border: 1px solid var(--border-color);
          transition: var(--transition-smooth);
        }
        .action-btn:hover {
          color: var(--secondary);
          background-color: var(--accent);
          border-color: var(--secondary);
        }
        .p-item {
          transition: var(--transition-fast);
        }
        .p-item:hover {
          background-color: var(--accent);
          color: var(--secondary);
        }
        .desktop-search, nav, .desktop-profile-wrapper {
          display: flex;
        }
        .mobile-toggle {
          display: none;
        }
        @media (max-width: 860px) {
          .desktop-search, nav, .desktop-profile-wrapper {
            display: none !important;
          }
          .mobile-toggle {
            display: flex;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
