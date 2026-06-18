import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import supabase from '../../supabaseClient';
import { Plus, Edit, Trash2, Archive, Check, X, FileEdit, PlusCircle, Search } from 'lucide-react';

export const Products = () => {
  const { t, lang } = useLanguage();

  const [products, setProducts] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingProduct, setEditingProduct] = useState(null); // null if adding new
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Field States
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [detailsAr, setDetailsAr] = useState('');
  const [detailsEn, setDetailsEn] = useState('');
  const [price, setPrice] = useState(0);
  const [comparePrice, setComparePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState(10);
  const [availability, setAvailability] = useState('available');
  const [yearId, setYearId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [extraImageUrlsText, setExtraImageUrlsText] = useState('');
  const [usageVideoUrl, setUsageVideoUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load products (all, including archived and inactive)
      const { data: prods } = await supabase
        .from('products')
        .select(`
          *,
          years (*),
          subjects (*)
        `)
        .order('created_at', { ascending: false });
      if (prods) setProducts(prods);

      // Load years and subjects for form dropdown selectors
      const { data: yrs } = await supabase.from('years').select('*');
      if (yrs) setYears(yrs);

      const { data: subs } = await supabase.from('subjects').select('*');
      if (subs) setSubjects(subs);

    } catch (err) {
      console.error('Error fetching admin product catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setNameAr('');
    setNameEn('');
    setDescriptionAr('');
    setDescriptionEn('');
    setDetailsAr('');
    setDetailsEn('');
    setPrice(0);
    setComparePrice('');
    setStockQuantity(10);
    setAvailability('available');
    setYearId(years.length > 0 ? years[0].id : '');
    setSubjectId('');
    setMainImageUrl('');
    setExtraImageUrlsText('');
    setUsageVideoUrl('');
    setIsFeatured(false);
    setIsActive(true);
    setShowFormModal(true);
  };

  const openEditModal = async (prod) => {
    setEditingProduct(prod);
    setNameAr(prod.name_ar || '');
    setNameEn(prod.name_en || '');
    setDescriptionAr(prod.description_ar || '');
    setDescriptionEn(prod.description_en || '');
    setDetailsAr(prod.details_ar || '');
    setDetailsEn(prod.details_en || '');
    setPrice(prod.price || 0);
    setComparePrice(prod.compare_at_price || '');
    setStockQuantity(prod.stock_quantity || 0);
    setAvailability(prod.availability || 'available');
    setYearId(prod.year_id || '');
    setSubjectId(prod.subject_id || '');
    setMainImageUrl(prod.image_url || '');
    setUsageVideoUrl(prod.usage_video_url || '');
    setIsFeatured(prod.is_featured || false);
    setIsActive(prod.is_active !== false);

    // Fetch extra images
    const { data: extraImgs } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', prod.id);
    
    if (extraImgs) {
      setExtraImageUrlsText(extraImgs.map((img) => img.image_url).join('\n'));
    } else {
      setExtraImageUrlsText('');
    }

    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const productPayload = {
      name_ar: nameAr.trim(),
      name_en: nameEn.trim(),
      description_ar: descriptionAr.trim(),
      description_en: descriptionEn.trim(),
      details_ar: detailsAr.trim() || null,
      details_en: detailsEn.trim() || null,
      price: parseFloat(price),
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
      stock_quantity: parseInt(stockQuantity),
      availability,
      year_id: yearId || null,
      subject_id: subjectId || null,
      image_url: mainImageUrl.trim(),
      usage_video_url: usageVideoUrl.trim() || null,
      is_featured: isFeatured,
      is_active: isActive
    };

    try {
      let productId = null;

      if (editingProduct) {
        // Edit existing product
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        productId = editingProduct.id;
      } else {
        // Add new product
        const { data, error } = await supabase
          .from('products')
          .insert({ ...productPayload, is_archived: false })
          .select()
          .single();
        
        if (error) throw error;
        productId = data.id;
      }

      // Add supplementary images
      if (productId) {
        // Clear old ones first
        await supabase.from('product_images').delete().eq('product_id', productId);
        
        const extraUrls = extraImageUrlsText
          .split('\n')
          .map((url) => url.trim())
          .filter(Boolean);

        if (extraUrls.length > 0) {
          const insertPayload = extraUrls.map((url, index) => ({
            product_id: productId,
            image_url: url,
            sort_order: index
          }));
          await supabase.from('product_images').insert(insertPayload);
        }
      }

      setShowFormModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ التغييرات. / Error saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleArchive = async (prod) => {
    const nextArchiveState = !prod.is_archived;
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_archived: nextArchiveState })
        .eq('id', prod.id);
      
      if (!error) {
        setProducts((prev) =>
          prev.map((item) => (item.id === prod.id ? { ...item, is_archived: nextArchiveState } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟ / Confirm permanent delete?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', prodId);
      if (!error) {
        setProducts((prev) => prev.filter((item) => item.id !== prodId));
      } else {
        alert('لا يمكن حذف المنتج لأنه مرتبط بطلبات سابقة، يمكنك أرشفتة بدلاً من ذلك. / Cannot delete, product linked to orders. Try archiving.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter products by year selection inside form
  const filteredSubjects = subjects.filter((sub) => sub.year_id === yearId);

  // Filter main products list by search query
  const getFilteredProducts = () => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name_ar.toLowerCase().includes(q) ||
        p.name_en.toLowerCase().includes(q)
    );
  };

  const filteredList = getFilteredProducts();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
          {t('admin.products')}
        </h1>
        <button onClick={openAddModal} className="btn btn-secondary" style={{ gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <PlusCircle size={16} />
          {t('admin.add_new')}
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="ابحث بالاسم عن أداة طبية..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
      </div>

      {/* Table list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '70px', width: '100%' }}></div>
          <div className="skeleton" style={{ height: '70px', width: '100%' }}></div>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--surface-color)' }}>
          لا توجد منتجات مسجلة بالموقع حالياً.
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto', backgroundColor: 'var(--surface-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'start' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--accent)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 700 }}>
                <th style={{ padding: '1rem 0.75rem' }}>الصورة</th>
                <th style={{ padding: '1rem 0.75rem' }}>الاسم بالعربية</th>
                <th style={{ padding: '1rem 0.75rem' }}>السعر</th>
                <th style={{ padding: '1rem 0.75rem' }}>المخزن</th>
                <th style={{ padding: '1rem 0.75rem' }}>الحالة</th>
                <th style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>الخيارات</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: prod.is_archived ? 0.6 : 1 }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <img src={prod.image_url} alt="thumbnail" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    <p style={{ fontWeight: 700 }}>{prod.name_ar}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.name_en}</p>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 800 }}>{prod.price} د.ل</td>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>{prod.stock_quantity}</td>
                  <td style={{ padding: '0.6rem 0.75rem' }}>
                    {prod.is_archived ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '1px 6px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)' }}>أرشيف</span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '1px 6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', borderRadius: 'var(--radius-sm)' }}>نشط</span>
                    )}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button onClick={() => openEditModal(prod)} className="action-btn" title="Edit"><Edit size={14} /></button>
                      <button onClick={() => handleToggleArchive(prod)} className="action-btn" title={prod.is_archived ? "Unarchive" : "Archive"} style={{ color: 'var(--secondary)' }}><Archive size={14} /></button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="action-btn" title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -------------------------------------------------------------
          ADD / EDIT PRODUCT FORM MODAL
          ------------------------------------------------------------- */}
      {showFormModal && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--surface-color)',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingProduct ? 'تعديل بيانات المنتج / Edit Product' : 'إضافة منتج جديد / Add Product'}</h3>
              <button onClick={() => setShowFormModal(false)} className="action-btn"><X size={18} /></button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="modal-form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.product_name_ar')} *</label>
                  <input type="text" className="form-input" required value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.product_name_en')} *</label>
                  <input type="text" className="form-input" required value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="modal-form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.price')} (د.ل) *</label>
                  <input type="number" step="0.1" className="form-input" required value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.compare_price')} (د.ل)</label>
                  <input type="number" step="0.1" className="form-input" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="modal-form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.stock')} *</label>
                  <input type="number" className="form-input" required value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('subject.filter_availability')} *</label>
                  <select className="form-input" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                    <option value="available">متوفر / Available</option>
                    <option value="limited_quantity">كمية محدودة / Limited Qty</option>
                    <option value="coming_soon">قريباً / Coming Soon</option>
                    <option value="unavailable">غير متوفر / Out of Stock</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="modal-form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.year')} *</label>
                  <select className="form-input" value={yearId} onChange={(e) => setYearId(e.target.value)}>
                    <option value="">اختر السنة الدراسية</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>{y.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.subject')} *</label>
                  <select className="form-input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                    <option value="">اختر المادة الدراسية</option>
                    {filteredSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name_ar}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">رابط الصورة الرئيسية للمنتج (Main Image URL) *</label>
                <input type="url" className="form-input" required value={mainImageUrl} onChange={(e) => setMainImageUrl(e.target.value)} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('admin.image_urls')}</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={extraImageUrlsText}
                  onChange={(e) => setExtraImageUrlsText(e.target.value)}
                  placeholder="https://example.com/photo2.jpg&#10;https://example.com/photo3.jpg"
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('admin.video_url')}</label>
                <input type="url" className="form-input" value={usageVideoUrl} onChange={(e) => setUsageVideoUrl(e.target.value)} placeholder="https://www.youtube.com/embed/XXXX" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }} className="modal-form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.description_ar')} *</label>
                  <textarea className="form-input" rows="2" required value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} style={{ resize: 'none' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.description_en')} *</label>
                  <textarea className="form-input" rows="2" required value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} style={{ resize: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }} className="modal-form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.details_ar')}</label>
                  <textarea className="form-input" rows="3" value={detailsAr} onChange={(e) => setDetailsAr(e.target.value)} placeholder="• مصنوع من الفولاذ&#10;• مقبض ملون" style={{ resize: 'none' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{t('admin.details_en')}</label>
                  <textarea className="form-input" rows="3" value={detailsEn} onChange={(e) => setDetailsEn(e.target.value)} placeholder="• Stainless steel&#10;• Anodized handle" style={{ resize: 'none' }} />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} style={{ accentColor: 'var(--secondary)' }} />
                  <strong>منتج مميز (أكثر طلباً)</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ accentColor: 'var(--secondary)' }} />
                  <strong>متاح للعرض بالمتجر</strong>
                </label>
              </div>

              {/* Form buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-outline">{t('admin.cancel')}</button>
                <button type="submit" disabled={submitting} className="btn btn-secondary">{submitting ? 'جاري الحفظ...' : t('admin.save')}</button>
              </div>

            </form>
          </div>
        </div>
      , document.body)}

      <style>{`
        @media (max-width: 768px) {
          .modal-form-row {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Products;
