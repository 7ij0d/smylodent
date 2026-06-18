import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Copy, Check, QrCode } from 'lucide-react';

export const QRModal = ({ isOpen, onClose, productUrl, productName }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate QR Code URL from qrserver API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productUrl)}`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        className="card glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '340px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', opacity: 0.6 }}
          className="action-btn"
        >
          <X size={16} />
        </button>

        <QrCode size={32} style={{ color: 'var(--secondary)' }} />
        
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {t('product.qr_code')}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {productName}
          </p>
        </div>

        {/* QR Code Image */}
        <div
          style={{
            border: '8px solid white',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'white',
            display: 'inline-block',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <img src={qrCodeUrl} alt="Product QR Code" style={{ width: '180px', height: '180px' }} />
        </div>

        {/* Copy Link button */}
        <button
          onClick={handleCopyLink}
          className="btn btn-outline"
          style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
        >
          {copied ? (
            <>
              <Check size={16} style={{ color: 'var(--success)' }} />
              {t('product.link_copied')}
            </>
          ) : (
            <>
              <Copy size={16} />
              {t('product.share')}
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default QRModal;
