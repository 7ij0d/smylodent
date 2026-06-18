import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import supabase from '../supabaseClient';
import InvoiceView from '../components/InvoiceView';
import { ArrowLeft, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';

export const InvoicePage = () => {
  const { id } = useParams();
  const { lang, t, isRtl } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (*)
            )
          `)
          .eq('id', id)
          .single();
        
        if (data) setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="skeleton animate-pulse-smile" style={{ height: '300px', width: '100%', maxWidth: '700px', margin: '0 auto', borderRadius: 'var(--radius-md)' }}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>عذراً، لم نجد الفاتورة المطلوبة.</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sorry, this invoice was not found.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          العودة للرئيسية / Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Back to track link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '1.5rem' }} className="no-print">
        <Link to="/" style={{ color: 'var(--text-muted)' }}>{t('nav.home')}</Link>
        {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        <Link to="/track" style={{ color: 'var(--text-muted)' }}>{t('tracking.title')}</Link>
        {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>فاتورة #{order.order_number}</span>
      </div>

      <InvoiceView order={order} />
    </div>
  );
};

export default InvoicePage;
