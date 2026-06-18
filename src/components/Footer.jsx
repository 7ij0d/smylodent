import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import { Phone, Send, MapPin, Truck, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const { t, isRtl } = useLanguage();

  return (
    <footer
      style={{
        backgroundColor: 'var(--surface-color)',
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 0 1.5rem 0',
        marginTop: 'auto',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
      }}
    >
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Brand Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Logo width={160} />
          <p style={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
            {t('home.subtitle')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
            <a href="https://wa.me/218911234567" target="_blank" rel="noopener noreferrer" className="social-icon-footer" title="WhatsApp">
              <Phone size={18} />
            </a>
            <a href="https://t.me/smylodent_libya" target="_blank" rel="noopener noreferrer" className="social-icon-footer" title="Telegram">
              <Send size={18} />
            </a>
            <a href="https://instagram.com/smylodent" target="_blank" rel="noopener noreferrer" className="social-icon-footer" title="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://facebook.com/smylodent" target="_blank" rel="noopener noreferrer" className="social-icon-footer" title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        {/* Academic years quick shortcuts */}
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600, position: 'relative' }} className="footer-title">
            {t('nav.years')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link to="/year/1st-year" className="footer-link">{t('years.y1')}</Link></li>
            <li><Link to="/year/2nd-year" className="footer-link">{t('years.y2')}</Link></li>
            <li><Link to="/year/3rd-year" className="footer-link">{t('years.y3')}</Link></li>
            <li><Link to="/year/4th-year" className="footer-link">{t('years.y4')}</Link></li>
          </ul>
        </div>

        {/* General Store pages */}
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }} className="footer-title">
            {t('nav.about')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link to="/about" className="footer-link">{t('nav.about')}</Link></li>
            <li><Link to="/contact" className="footer-link">{t('nav.contact')}</Link></li>
            <li><Link to="/faq" className="footer-link">{t('nav.faq')}</Link></li>
            <li><Link to="/shipping-returns" className="footer-link">{t('checkout.delivery_options')}</Link></li>
          </ul>
        </div>

        {/* Delivery / Guarantee Quick Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '0.2rem', fontWeight: 600 }}>
            {t('home.why_us')}
          </h4>
          
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <MapPin size={28} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>{t('home.delivery_tripoli')}</p>
              <p style={{ fontSize: '0.75rem' }}>{t('home.delivery_tripoli_desc')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Truck size={28} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>{t('home.delivery_libya')}</p>
              <p style={{ fontSize: '0.75rem' }}>{t('home.delivery_libya_desc')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <ShieldCheck size={28} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>{t('home.cod')}</p>
              <p style={{ fontSize: '0.75rem' }}>{t('home.cod_desc')}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright border */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          textAlign: 'center',
          fontSize: '0.8rem'
        }}
      >
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem' }}>
          <p>© {new Date().getFullYear()} Smylodent. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/faq" style={{ hover: 'color: var(--secondary)' }}>FAQ</Link>
            <span>•</span>
            <Link to="/shipping-returns">Shipping & Returns</Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          transition: var(--transition-fast);
        }
        .footer-link:hover {
          color: var(--secondary);
          padding-left: 4px;
        }
        [dir="rtl"] .footer-link:hover {
          padding-left: 0;
          padding-right: 4px;
        }
        .social-icon-footer {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          background-color: var(--bg-color);
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }
        .social-icon-footer:hover {
          color: white;
          background-color: var(--secondary);
          border-color: var(--secondary);
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
