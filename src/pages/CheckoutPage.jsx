import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import supabase from '../supabaseClient';
import InvoiceView from '../components/InvoiceView';
import { CheckCircle2, FileText, MapPin, Truck, HelpCircle, Phone } from 'lucide-react';

export const CheckoutPage = () => {
  const { t, isRtl, lang } = useLanguage();
  const { cartItems, subtotal, totalDiscount, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSec, setPhoneSec] = useState('');
  const [university, setUniversity] = useState('جامعة طرابلس');
  const [college, setCollege] = useState('كلية طب الأسنان');
  const [notes, setNotes] = useState('');
  const [shippingOption, setShippingOption] = useState('faculty'); // faculty, tripoli_home, other_cities
  
  // States
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill logged-in profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setPhoneSec(profile.phone_secondary || '');
      setUniversity(profile.university || 'جامعة طرابلس');
      setCollege(profile.college || 'كلية طب الأسنان');
    }
  }, [profile]);

  // Calculate Shipping fee
  const getShippingFee = () => {
    if (shippingOption === 'faculty') return 0;
    if (shippingOption === 'tripoli_home') return 10;
    return 25;
  };

  const finalTotal = subtotal + getShippingFee();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setSubmitting(true);
    setErrorMsg('');

    // Generate Order number: e.g. SD-98234-5819
    const orderNum = `SD-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const orderData = {
        order_number: orderNum,
        user_id: user?.id || null,
        customer_name: fullName,
        customer_phone: phone,
        customer_phone_secondary: phoneSec || null,
        university,
        college,
        notes: notes || null,
        status: 'new',
        total_price: finalTotal,
        discount_amount: totalDiscount,
        shipping_fee: getShippingFee(),
        created_at: new Date().toISOString()
      };

      // 1. Insert order record
      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Insert items
      const orderItemsData = cartItems.map((item) => ({
        order_id: newOrder.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsErr) throw itemsErr;

      // 3. Update stock levels on products (only if running on Mock DB, live Supabase would use trigger or backend)
      if (supabase.isMock) {
        const productsBuilder = supabase.from('products');
        for (const item of cartItems) {
          const currentQty = item.stock_quantity || 0;
          const updatedQty = Math.max(0, currentQty - item.quantity);
          const availability = updatedQty === 0 ? 'unavailable' : (updatedQty < 5 ? 'limited_quantity' : 'available');
          await productsBuilder.eq('id', item.id).update({
            stock_quantity: updatedQty,
            availability
          });
        }
      }

      // Add notification for Admin in DB
      await supabase.from('notifications').insert({
        title_ar: `طلب جديد وارد #${orderNum}`,
        title_en: `New Order Received #${orderNum}`,
        message_ar: `طلب جديد من الطالب ${fullName} بقيمة ${finalTotal} د.ل`,
        message_en: `New order from student ${fullName} for ${finalTotal} LYD`,
        type: 'order_status'
      });

      // Clear Shopping Cart & Save placed order reference for rendering
      clearCart();
      setPlacedOrder({ ...newOrder, order_items: cartItems });

    } catch (err) {
      console.error('Checkout failed', err);
      setErrorMsg('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً. / Checkout process failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // SUCCESS VIEW RENDER
  // -------------------------------------------------------------
  if (placedOrder) {
    return (
      <div className="container" style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        
        {/* Success header animation block */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--success)' }} className="animate-pulse-smile" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            {t('checkout.success_title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px' }}>
            {t('checkout.success_desc', { order_number: placedOrder.order_number })}
          </p>
        </div>

        {/* Action Button Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <Link to={`/invoice/${placedOrder.id}`} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <FileText size={18} />
            {t('checkout.print_invoice')}
          </Link>
          <Link to={`/track?order=${placedOrder.order_number}&phone=${placedOrder.customer_phone}`} className="btn btn-outline">
            {t('checkout.track_order')}
          </Link>
          <Link to="/" className="btn btn-outline" style={{ border: 'none', color: 'var(--secondary)' }}>
            العودة للرئيسية / Go Home
          </Link>
        </div>

        {/* Inline Printable invoice preview */}
        <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '1rem' }}>
          <InvoiceView order={placedOrder} />
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // FORM ENTRY VIEW RENDER
  // -------------------------------------------------------------
  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
          {t('checkout.title')}
        </h1>
      </div>

      {errorMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }} className="checkout-grid">
        
        {/* Checkout Form */}
        <form onSubmit={handlePlaceOrder} className="card" style={{ padding: '2rem', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row">
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('checkout.full_name')} *</label>
              <input
                type="text"
                className="form-input"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('checkout.phone')} *</label>
              <input
                type="tel"
                className="form-input"
                required
                placeholder="09XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row">
            {/* Secondary Phone */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('checkout.phone_sec')}</label>
              <input
                type="tel"
                className="form-input"
                value={phoneSec}
                onChange={(e) => setPhoneSec(e.target.value)}
              />
            </div>

            {/* University selection dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('checkout.university')} *</label>
              <select
                className="form-input"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              >
                <option value="جامعة طرابلس">جامعة طرابلس (Tripoli University)</option>
                <option value="جامعة بنغازي">جامعة بنغازي (Benghazi University)</option>
                <option value="جامعة مصراتة">جامعة مصراتة (Misrata University)</option>
                <option value="جامعة الزاوية">جامعة الزاوية (Zawia University)</option>
                <option value="جامعة أخرى / كليات خاصة">جامعة أخرى / كليات خاصة</option>
              </select>
            </div>
          </div>

          {/* College */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('checkout.college')} *</label>
            <input
              type="text"
              className="form-input"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          {/* Delivery Options Selector */}
          <div>
            <label className="form-label">{t('checkout.delivery_options')} *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              
              {/* Tripoli College Delivery */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '1rem',
                  border: shippingOption === 'faculty' ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: shippingOption === 'faculty' ? 'var(--accent)' : 'transparent',
                  transition: 'var(--transition-fast)'
                }}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingOption === 'faculty'}
                  onChange={() => setShippingOption('faculty')}
                  style={{ accentColor: 'var(--secondary)' }}
                />
                <MapPin size={20} style={{ color: 'var(--secondary)' }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('checkout.delivery_faculty')}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>مجانًا تمامًا - تسليم مباشر بالكلية</p>
                </div>
              </label>

              {/* Home Delivery Tripoli */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '1rem',
                  border: shippingOption === 'tripoli_home' ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: shippingOption === 'tripoli_home' ? 'var(--accent)' : 'transparent',
                  transition: 'var(--transition-fast)'
                }}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingOption === 'tripoli_home'}
                  onChange={() => setShippingOption('tripoli_home')}
                  style={{ accentColor: 'var(--secondary)' }}
                />
                <Truck size={20} style={{ color: 'var(--secondary)' }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('checkout.delivery_tripoli_home')}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>توصيل للمنزل أو المعمل داخل طرابلس في غضون 24-48 ساعة</p>
                </div>
              </label>

              {/* Nationwide Libya delivery */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '1rem',
                  border: shippingOption === 'other_cities' ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: shippingOption === 'other_cities' ? 'var(--accent)' : 'transparent',
                  transition: 'var(--transition-fast)'
                }}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingOption === 'other_cities'}
                  onChange={() => setShippingOption('other_cities')}
                  style={{ accentColor: 'var(--secondary)' }}
                />
                <Truck size={20} style={{ color: 'var(--secondary)' }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('checkout.delivery_out')}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>شحن سريع لمدن: بنغازي، مصراتة، الزاوية، الخمس، سبها وغيرها</p>
                </div>
              </label>

            </div>
          </div>

          {/* Notes */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('checkout.notes')}</label>
            <textarea
              className="form-input"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: رقم المجموعة الدراسية، أو تفاصيل إضافية لمكان التوصيل..."
              style={{ resize: 'none' }}
            />
          </div>

          {/* Checkout Submit trigger */}
          <button
            type="submit"
            disabled={submitting || cartItems.length === 0}
            className="btn btn-secondary"
            style={{ padding: '0.8rem', fontSize: '1rem', width: '100%', marginTop: '1rem' }}
          >
            {submitting ? 'جاري إرسال الطلب... / Submitting...' : t('checkout.place_order')}
          </button>

        </form>

        {/* Cart items Recap side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              الأدوات المطلوبة / Ordered Items
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name_en} <strong style={{ color: 'var(--secondary)' }}>x{item.quantity}</strong>
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {(item.price * item.quantity).toFixed(2)} {t('cart.currency')}
                  </span>
                </div>
              ))}
            </div>

            {/* Sum details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('cart.subtotal')}:</span>
                <span style={{ fontWeight: 600 }}>{(subtotal + totalDiscount).toFixed(2)} {t('cart.currency')}</span>
              </div>
              {totalDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <span>{t('cart.discounts')}:</span>
                  <span style={{ fontWeight: 600 }}>-{totalDiscount.toFixed(2)} {t('cart.currency')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t('cart.shipping')}:</span>
                <span style={{ fontWeight: 600 }}>
                  {getShippingFee() === 0 ? t('cart.tripoli_free') : `${getShippingFee()} ${t('cart.currency')}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--secondary)', paddingTop: '0.6rem', fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 800 }}>
                <span>{t('cart.total')}:</span>
                <span>{finalTotal.toFixed(2)} {t('cart.currency')}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .form-row {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
