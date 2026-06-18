import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import supabase from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { Award, ShieldCheck, MapPin, Truck, ChevronRight, ChevronLeft } from 'lucide-react';

export const Home = () => {
  const { lang, t, isRtl } = useLanguage();
  
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [years, setYears] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Load Banners, Products & Years
  useEffect(() => {
    const fetchBanners = async () => {
      setLoadingBanners(true);
      const { data } = await supabase.from('banners').select('*').eq('is_active', true);
      if (data) setBanners(data);
      setLoadingBanners(false);
    };

    const fetchProducts = async () => {
      setLoadingProducts(true);
      // Fetch featured
      const { data: featured } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .eq('is_archived', false)
        .limit(4);
      if (featured) setFeaturedProducts(featured);

      // Fetch discounted
      const { data: discounted } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_archived', false)
        .not('compare_at_price', 'is', null)
        .limit(4);
      if (discounted) setDiscountedProducts(discounted);
      setLoadingProducts(false);
    };

    const fetchYears = async () => {
      try {
        const { data } = await supabase.from('years').select('*').order('slug', { ascending: true });
        if (data && data.length > 0) setYears(data);
      } catch (err) {
        console.warn('Failed to load years from Supabase', err);
      }
    };

    fetchBanners();
    fetchProducts();
    fetchYears();
  }, []);

  // Banner slider automatic cycle
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleNextBanner = () => {
    setActiveBannerIdx((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    setActiveBannerIdx((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Get years list with fallbacks
  const getYearsList = () => {
    if (years.length > 0) {
      const yearColors = {
        '1st-year': '#00a896',
        '2nd-year': '#028090',
        '3rd-year': '#028090',
        '4th-year': '#02c39a'
      };
      return years.map(y => ({
        id: y.id,
        key: y.slug,
        label: lang === 'ar' ? y.name_ar : y.name_en,
        desc: lang === 'ar' ? `المواد والأدوات الخاصة بـ ${y.name_ar}` : `Subjects and supplies for ${y.name_en}`,
        color: yearColors[y.slug] || '#028090',
        image_url: y.image_url
      }));
    }

    // Static fallback
    return [
      { key: '1st-year', label: t('years.y1'), desc: t('years.y1_desc'), color: '#00a896', image_url: null },
      { key: '2nd-year', label: t('years.y2'), desc: t('years.y2_desc'), color: '#028090', image_url: null },
      { key: '3rd-year', label: t('years.y3'), desc: t('years.y3_desc'), color: '#028090', image_url: null },
      { key: '4th-year', label: t('years.y4'), desc: t('years.y4_desc'), color: '#02c39a', image_url: null }
    ];
  };

  const yearsList = getYearsList();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '3rem' }}>
      
      {/* 1. HERO SLIDER BANNER */}
      <section style={{ position: 'relative', height: '380px', overflow: 'hidden', borderRadius: 'var(--radius-lg)', margin: '1rem 0' }}>
        {loadingBanners ? (
          <div className="skeleton animate-fade-in" style={{ width: '100%', height: '100%' }}></div>
        ) : banners.length === 0 ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
              textAlign: 'center'
            }}
          >
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.8rem' }}>{t('home.welcome')}</h1>
            <p style={{ maxWidth: '600px', opacity: 0.9 }}>{t('home.subtitle')}</p>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {banners.map((ban, idx) => (
              <div
                key={ban.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `linear-gradient(to right, rgba(10, 51, 92, 0.85), rgba(10, 51, 92, 0.35)), url(${ban.image_url || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: idx === activeBannerIdx ? 1 : 0,
                  visibility: idx === activeBannerIdx ? 'visible' : 'hidden',
                  transition: 'opacity 0.6s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '3rem'
                }}
              >
                <div style={{ maxWidth: '500px', color: '#ffffff', textAlign: isRtl ? 'right' : 'left' }} className="animate-fade-in">
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.8rem' }}>
                    {lang === 'ar' ? ban.title_ar : ban.title_en}
                  </h1>
                  <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
                    {lang === 'ar' ? ban.subtitle_ar : ban.subtitle_en}
                  </p>
                  {ban.link_url && (
                    <Link to={ban.link_url} className="btn btn-secondary">
                      {t('home.view_all')}
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Slider Navigation arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={handlePrevBanner}
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                  className="action-btn"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextBanner}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                  className="action-btn"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* 2. CHOOSE ACADEMIC YEAR GRID */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            {t('home.select_year')}
          </h2>
          <div style={{ height: '3px', width: '60px', backgroundColor: 'var(--secondary)', margin: '0.5rem auto' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }} className="years-grid">
          {yearsList.map((y) => (
            <Link
              to={`/year/${y.key}`}
              key={y.key}
              className="card year-nav-card"
              style={{
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                alignItems: 'center',
                borderLeft: `4px solid ${y.color}`,
                position: 'relative',
                overflow: 'hidden',
                justifyContent: 'center',
                minHeight: '180px'
              }}
            >
              {y.image_url && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${y.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(3px) brightness(0.35)',
                    transform: 'scale(1.15)',
                    zIndex: 0,
                    transition: 'var(--transition-smooth)'
                  }}
                />
              )}
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                <Award size={36} style={{ color: y.image_url ? '#ffffff' : y.color, filter: y.image_url ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'none' }} />
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: y.image_url ? '#ffffff' : 'var(--text-main)',
                  textShadow: y.image_url ? '0 2px 4px rgba(0,0,0,0.8)' : 'none'
                }}>
                  {y.label}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: y.image_url ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-muted)',
                  lineHeight: 1.5,
                  textShadow: y.image_url ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                  fontWeight: y.image_url ? 500 : 400
                }}>
                  {y.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. PROMOTIONAL SERVICE VALUE POINTS */}
      <section
        style={{
          backgroundColor: 'var(--surface-color)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          padding: '2rem 0'
        }}
        className="no-print"
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--accent)', padding: '0.8rem', borderRadius: '50%', color: 'var(--secondary)' }}>
              <MapPin size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t('home.delivery_tripoli')}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('home.delivery_tripoli_desc')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--accent)', padding: '0.8rem', borderRadius: '50%', color: 'var(--secondary)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t('home.delivery_libya')}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('home.delivery_libya_desc')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--accent)', padding: '0.8rem', borderRadius: '50%', color: 'var(--secondary)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t('home.cod')}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('home.cod_desc')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FEATURED PRODUCTS GRID */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
            {t('home.featured')}
          </h2>
          <div style={{ height: '2px', flexGrow: 1, margin: '0 1rem', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {loadingProducts ? (
          <SkeletonLoader type="card-grid" count={4} />
        ) : featuredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('subject.no_products')}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 5. CURRENT SPECIAL DISCOUNT PRODUCTS */}
      {discountedProducts.length > 0 && (
        <section className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--danger)' }}>
              {t('home.discounted')}
            </h2>
            <div style={{ height: '2px', flexGrow: 1, margin: '0 1rem', backgroundColor: 'var(--border-color)' }}></div>
          </div>

          {loadingProducts ? (
            <SkeletonLoader type="card-grid" count={4} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {discountedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </section>
      )}

      <style>{`
        .year-nav-card {
          transition: var(--transition-smooth);
        }
        .year-nav-card:hover {
          background-color: var(--accent);
          transform: translateY(-5px);
        }
        .year-nav-card:hover div {
          transform: scale(1.2) !important;
          filter: blur(2px) brightness(0.45) !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
