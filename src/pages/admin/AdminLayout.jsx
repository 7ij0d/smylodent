import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BookOpen,
  Image,
  Inbox,
  Settings,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, profile, isAdmin, loading } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Loading state guard
  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="skeleton animate-pulse-smile" style={{ height: '200px', width: '100%', maxWidth: '600px', margin: '0 auto', borderRadius: 'var(--radius-lg)' }}></div>
      </div>
    );
  }

  // Security Access Denied fallback
  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '50%', color: 'var(--danger)' }}>
          <ShieldAlert size={48} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>عذرًا، غير مسموح بالدخول</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            هذه الصفحة مخصصة لمدراء النظام فقط. يرجى تسجيل الدخول بحساب أدمن للوصول إليها.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/signin" className="btn btn-primary">
            {t('nav.signin')}
          </Link>
          <Link to="/" className="btn btn-outline">
            العودة للرئيسية / Go Home
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
    { path: '/admin/orders', label: t('admin.orders'), icon: ShoppingCart },
    { path: '/admin/products', label: t('admin.products'), icon: Package },
    { path: '/admin/subjects', label: t('admin.subjects'), icon: BookOpen },
    { path: '/admin/banners', label: t('admin.banners'), icon: Image },
    { path: '/admin/messages', label: t('admin.messages'), icon: Inbox },
    { path: '/admin/settings', label: t('admin.settings'), icon: Settings }
  ];

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem' }} className="admin-grid-layout">
      
      {/* Sidebar Navigation */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="admin-sidebar-pane no-print">
        
        {/* Admin identifier */}
        <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UserCheck size={20} style={{ color: 'var(--secondary)' }} />
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{profile?.full_name}</p>
            <span style={{ fontSize: '0.65rem', padding: '1px 6px', backgroundColor: 'var(--secondary)', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>ADMIN</span>
          </div>
        </div>

        {/* Links list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-main)',
                  transition: 'var(--transition-fast)'
                }}
                className={isActive ? '' : 'admin-nav-item'}
              >
                <IconComponent size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to main storefront */}
        <Link
          to="/"
          className="btn btn-outline"
          style={{
            marginTop: 'auto',
            padding: '0.5rem',
            fontSize: '0.8rem',
            borderRadius: 'var(--radius-sm)',
            justifyContent: 'center'
          }}
        >
          {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          <span style={{ margin: '0 0.2rem' }}>عرض المتجر / Storefront</span>
        </Link>
      </aside>

      {/* Main Admin Pages pane */}
      <main style={{ minHeight: '500px' }} className="admin-main-pane">
        <Outlet />
      </main>

      <style>{`
        .admin-nav-item:hover {
          background-color: var(--accent);
          color: var(--secondary);
        }
        @media (max-width: 860px) {
          .admin-grid-layout {
            grid-template-columns: 1fr !important;
          }
          .admin-sidebar-pane {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 1rem !important;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1.5rem;
            margin-bottom: 1rem;
          }
          .admin-sidebar-pane nav {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
