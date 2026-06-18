import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import supabase from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { SlidersHorizontal, ChevronRight, ChevronLeft, ArrowDownUp } from 'lucide-react';

export const SubjectPage = () => {
  const { slug } = useParams();
  const { lang, t, isRtl } = useLanguage();

  const [subjectData, setSubjectData] = useState(null);
  const [yearData, setYearData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedStock, setSelectedStock] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchSubjectData = async () => {
      setLoading(true);
      try {
        // Fetch subject details
        const { data: subject } = await supabase
          .from('subjects')
          .select('*')
          .eq('slug', slug)
          .single();

        if (subject) {
          setSubjectData(subject);
          
          // Fetch parent year details
          const { data: year } = await supabase
            .from('years')
            .select('*')
            .eq('id', subject.year_id)
            .single();
          if (year) setYearData(year);

          // Fetch products under subject
          const { data: prods } = await supabase
            .from('products')
            .select('*')
            .eq('subject_id', subject.id)
            .eq('is_active', true)
            .eq('is_archived', false);
          
          if (prods) {
            setProducts(prods);
            
            // Set max price slider dynamically based on products
            if (prods.length > 0) {
              const prices = prods.map((p) => p.price);
              const maxP = Math.max(...prices);
              setMaxPrice(Math.ceil(maxP));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching subject catalog', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectData();
  }, [slug]);

  // Apply sorting and filtering logic on client side
  const getFilteredProducts = () => {
    let list = [...products];

    // 1. Filter by price
    list = list.filter((p) => p.price <= maxPrice);

    // 2. Filter by stock availability
    if (selectedStock !== 'all') {
      if (selectedStock === 'discount') {
        list = list.filter((p) => p.compare_at_price !== null);
      } else {
        list = list.filter((p) => p.availability === selectedStock);
      }
    }

    // 3. Sort by
    if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      list.sort((a, b) => b.sort_order - a.sort_order);
    }

    return list;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="skeleton" style={{ height: '30px', width: '350px', marginBottom: '2rem' }}></div>
        <SkeletonLoader type="card-grid" count={4} />
      </div>
    );
  }

  if (!subjectData) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>عذراً، المادة المطلوبة غير موجودة.</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sorry, this subject was not found.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {t('nav.home')}
        </Link>
      </div>
    );
  }

  const filteredList = getFilteredProducts();

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }} className="no-print">
        <Link to="/" style={{ color: 'var(--text-muted)' }}>{t('nav.home')}</Link>
        {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        {yearData && (
          <>
            <Link to={`/year/${yearData.slug}`} style={{ color: 'var(--text-muted)' }}>
              {lang === 'ar' ? yearData.name_ar : yearData.name_en}
            </Link>
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </>
        )}
        <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>
          {lang === 'ar' ? subjectData.name_ar : subjectData.name_en}
        </span>
      </div>

      {/* Header Info */}
      <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
          {lang === 'ar' ? subjectData.name_ar : subjectData.name_en}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          {lang === 'ar' ? subjectData.description_ar : subjectData.description_en}
        </p>
      </div>

      {/* Filter / Layout Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }} className="subject-layout">
        
        {/* Sidebar Filters (Desktop) */}
        <aside className={`filters-aside ${showMobileFilters ? 'mobile-filters-show' : ''}`}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SlidersHorizontal size={18} />
              التصفية والفلترة
            </span>
            {showMobileFilters && (
              <button onClick={() => setShowMobileFilters(false)} style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>
                إغلاق
              </button>
            )}
          </div>

          {/* Price Range Slider */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.6rem' }}>{t('subject.filter_price')}</h4>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--secondary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              <span>0 {t('cart.currency')}</span>
              <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{maxPrice} {t('cart.currency')}</span>
            </div>
          </div>

          {/* Availability Status Filter */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.6rem' }}>{t('subject.filter_availability')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {[
                { key: 'all', label: t('subject.all_statuses') },
                { key: 'available', label: t('subject.available') },
                { key: 'limited_quantity', label: t('subject.limited') },
                { key: 'discount', label: t('subject.discounted_only') }
              ].map((opt) => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="stock"
                    checked={selectedStock === opt.key}
                    onChange={() => setSelectedStock(opt.key)}
                    style={{ accentColor: 'var(--secondary)' }}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* Product Grid Area */}
        <div>
          {/* Sorting Actions row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem' }} className="sorting-row">
            
            <button
              onClick={() => setShowMobileFilters(true)}
              className="btn btn-outline mobile-filter-trigger"
              style={{ display: 'none', padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.3rem' }}
            >
              <SlidersHorizontal size={14} />
              الفلاتر
            </button>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              تم العثور على {filteredList.length} منتج
            </span>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <ArrowDownUp size={14} style={{ color: 'var(--secondary)' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <option value="recent">{t('subject.sort_recent')}</option>
                <option value="price_asc">{t('subject.sort_price_asc')}</option>
                <option value="price_desc">{t('subject.sort_price_desc')}</option>
                <option value="popular">{t('subject.sort_popular')}</option>
              </select>
            </div>

          </div>

          {/* Product grid list */}
          {filteredList.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--surface-color)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--text-muted)' }}>لا توجد منتجات تطابق خيارات التصفية المدخلة.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.5rem' }}>
              {filteredList.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .subject-layout {
            grid-template-columns: 1fr !important;
          }
          .filters-aside {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--surface-color);
            z-index: 1000;
            padding: 2rem;
            overflow-y: auto;
          }
          .mobile-filters-show {
            display: block !important;
          }
          .mobile-filter-trigger {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SubjectPage;
