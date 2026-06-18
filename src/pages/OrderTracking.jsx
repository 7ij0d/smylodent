import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import supabase from '../supabaseClient';
import InvoiceView from '../components/InvoiceView';
import { Search, MapPin, ClipboardList, CheckCircle2, Clock, Truck, ShieldAlert } from 'lucide-react';

export const OrderTracking = () => {
  const { t, lang, isRtl } = useLanguage();
  const location = useLocation();

  // Search parameters
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  
  // Results
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto query if parameters exist in URL (e.g. /track?order=SD-12&phone=091)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderParam = queryParams.get('order');
    const phoneParam = queryParams.get('phone');
    if (orderParam && phoneParam) {
      setOrderNumber(orderParam);
      setPhone(phoneParam);
      handleTrackOrder(null, orderParam, phoneParam);
    }
  }, [location]);

  const handleTrackOrder = async (e, forceOrder, forcePhone) => {
    if (e) e.preventDefault();
    
    const oNum = forceOrder || orderNumber;
    const oPhone = forcePhone || phone;

    if (!oNum || !oPhone) return;

    setLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      // Fetch matching order details
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('order_number', oNum.trim())
        .eq('customer_phone', oPhone.trim())
        .single();
      
      if (data) {
        setOrder(data);
      }
    } catch (err) {
      console.error('Order tracking lookup error', err);
    } finally {
      setLoading(false);
    }
  };

  // Status mapping to timeline steps (0-5 index)
  const statusSteps = [
    { key: 'new', label_ar: 'طلب جديد', label_en: 'New Order', icon: Clock },
    { key: 'under_review', label_ar: 'قيد المراجعة', label_en: 'Under Review', icon: ClipboardList },
    { key: 'accepted', label_ar: 'تم القبول', label_en: 'Accepted', icon: CheckCircle2 },
    { key: 'preparing', label_ar: 'جاري التجهيز', label_en: 'Preparing Tools', icon: ClipboardList },
    { key: 'out_for_delivery', label_ar: 'خرج للتوصيل', label_en: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label_ar: 'تم التسليم', label_en: 'Delivered', icon: CheckCircle2 }
  ];

  const getActiveStepIndex = (status) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex((step) => step.key === status);
  };

  const activeIndex = order ? getActiveStepIndex(order.status) : -1;

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
          {t('tracking.title')}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          {t('tracking.search_desc')}
        </p>
      </div>

      {/* Query inputs card */}
      <form
        onSubmit={(e) => handleTrackOrder(e)}
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface-color)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          alignItems: 'end',
          gap: '1rem'
        }}
        className="tracking-form-row"
      >
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('tracking.order_number')} *</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="SD-XXXXX-XXXX"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{t('checkout.phone')} *</label>
          <input
            type="tel"
            required
            className="form-input"
            placeholder="09XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-secondary" style={{ padding: '0.8rem 1.5rem', gap: '0.5rem' }}>
          <Search size={18} />
          {t('tracking.track_btn')}
        </button>
      </form>

      {/* Tracking results display */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 0' }}>
          <div className="skeleton" style={{ height: '120px', width: '100%' }}></div>
          <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
        </div>
      ) : searched && !order ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--danger)', backgroundColor: 'var(--surface-color)' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto' }} />
          <h3>{t('tracking.not_found')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            يرجى التأكد من رقم الطلب (SD-XXXXX-XXXX) ومطابقة رقم الهاتف المدخل عند الشراء.
          </p>
        </div>
      ) : order ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
          
          {/* Cancelled Alert Banner */}
          {order.status === 'cancelled' && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', fontWeight: 700, textAlign: 'center' }}>
              {t('tracking.status_cancelled')} - هذا الطلب قد تم إلغاؤه من قبل الإدارة.
            </div>
          )}

          {/* Timeline chart block */}
          {order.status !== 'cancelled' && (
            <div className="card" style={{ padding: '2rem 1.5rem', backgroundColor: 'var(--surface-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {t('tracking.timeline')}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }} className="timeline-flow">
                {/* Horizontal connection line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '5%',
                    right: '5%',
                    height: '4px',
                    backgroundColor: 'var(--border-color)',
                    zIndex: 1
                  }}
                  className="timeline-line-bg"
                ></div>
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: isRtl ? 'auto' : '5%',
                    right: isRtl ? '5%' : 'auto',
                    width: `${(activeIndex / 5) * 90}%`,
                    height: '4px',
                    backgroundColor: 'var(--secondary)',
                    transition: 'width 0.8s ease-in-out',
                    zIndex: 2
                  }}
                  className="timeline-line-active"
                ></div>

                {statusSteps.map((step, idx) => {
                  const IconComponent = step.icon;
                  const isCompleted = idx <= activeIndex;
                  const isCurrent = idx === activeIndex;

                  return (
                    <div
                      key={step.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.6rem',
                        zIndex: 3,
                        flex: 1,
                        textAlign: 'center'
                      }}
                    >
                      {/* Step Bubble icon */}
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? 'var(--secondary)' : 'var(--surface-color)',
                          color: isCompleted ? 'white' : 'var(--text-muted)',
                          border: `3px solid ${isCurrent ? 'var(--primary)' : 'var(--border-color)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isCurrent ? '0 0 0 4px var(--accent)' : 'none',
                          transition: 'all 0.4s ease'
                        }}
                      >
                        <IconComponent size={18} />
                      </div>

                      {/* Text Step labels */}
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isCurrent ? 800 : (isCompleted ? 600 : 500),
                          color: isCurrent ? 'var(--primary)' : (isCompleted ? 'var(--text-main)' : 'var(--text-muted)')
                        }}
                      >
                        {lang === 'ar' ? step.label_ar : step.label_en}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sales invoice preview */}
          <div>
            <InvoiceView order={order} />
          </div>

        </div>
      ) : null}

      <style>{`
        @media (max-width: 768px) {
          .tracking-form-row {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .timeline-flow {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.5rem !important;
            padding-left: 2rem !important;
          }
          .timeline-line-bg, .timeline-line-active {
            display: none !important;
          }
          .timeline-flow > div {
            flex-direction: row !important;
            gap: 1rem !important;
            text-align: start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
