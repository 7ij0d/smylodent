import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import supabase from '../supabaseClient';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';

export const ProductCard = ({ product, onFavChanged }) => {
  const { lang, t, isRtl } = useLanguage();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);
  const [avgRating, setAvgRating] = useState(0);

  // Check if product is in favorites
  useEffect(() => {
    if (user) {
      const checkFav = async () => {
        const { data } = await supabase
          .from('favorites')
          .select('*')
          .match({ user_id: user.id, product_id: product.id })
          .single();
        if (data) setIsFavorite(true);
      };
      checkFav();
    }
  }, [user, product.id]);

  // Load reviews average rating
  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id)
        .eq('is_approved', true);
      
      if (data && data.length > 0) {
        const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
        setAvgRating((sum / data.length).toFixed(1));
      } else {
        // Fallback to random stable mock rating for presentation if none exists
        const mockRating = (3.8 + (parseInt(product.id.substring(1)) % 10) * 0.1 || 4.5).toFixed(1);
        setAvgRating(mockRating);
      }
    };
    fetchRating();
  }, [product.id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert(t('auth.fav_need_login'));
      navigate('/signin');
      return;
    }
    
    setLoadingFav(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user.id, product_id: product.id });
        setIsFavorite(false);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: product.id });
        setIsFavorite(true);
      }
      if (onFavChanged) onFavChanged();
    } catch (err) {
      console.error('Failed toggling favorite', err);
    } finally {
      setLoadingFav(false);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    
    // Quick micro-feedback trigger
    const btn = e.currentTarget;
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<span style="font-size:0.8rem">✓ Added</span>`;
    btn.style.backgroundColor = 'var(--success)';
    btn.style.borderColor = 'var(--success)';
    
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.style.backgroundColor = '';
      btn.style.borderColor = '';
    }, 1200);
  };

  // Availability badge selector
  const renderAvailabilityBadge = () => {
    switch (product.availability) {
      case 'available':
        return <span className="badge badge-available">{t('subject.available')}</span>;
      case 'limited_quantity':
        return <span className="badge badge-limited">{t('subject.limited')}</span>;
      case 'coming_soon':
        return <span className="badge badge-limited" style={{ backgroundColor: 'var(--primary)' }}>{t('subject.coming_soon')}</span>;
      case 'unavailable':
      default:
        return <span className="badge badge-unavailable">{t('subject.unavailable')}</span>;
    }
  };

  // Calculate discount percentage
  const discountPercent = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="card product-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Floating Badges */}
      <div style={{ position: 'absolute', top: '0.8rem', left: isRtl ? 'auto' : '0.8rem', right: isRtl ? '0.8rem' : 'auto', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
        {renderAvailabilityBadge()}
        {discountPercent > 0 && (
          <span className="badge badge-discount">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Favorite Heart Toggler */}
      <button
        onClick={toggleFavorite}
        disabled={loadingFav}
        style={{
          position: 'absolute',
          top: '0.8rem',
          right: isRtl ? 'auto' : '0.8rem',
          left: isRtl ? '0.8rem' : 'auto',
          zIndex: 10,
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '34px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isFavorite ? 'var(--danger)' : 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)'
        }}
        className="fav-toggle-btn"
      >
        <Heart size={16} fill={isFavorite ? 'var(--danger)' : 'none'} style={{ transition: 'var(--transition-fast)' }} />
      </button>

      {/* Product Image Link */}
      <Link to={`/product/${product.id}`} style={{ display: 'block', overflow: 'hidden', height: '200px', backgroundColor: 'var(--border-color)' }}>
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=500&auto=format'}
          alt={lang === 'ar' ? product.name_ar : product.name_en}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="product-card-img"
        />
      </Link>

      {/* Product Details Section */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.4rem' }}>
        
        {/* Rating and Reviews */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--warning)' }}>
          <div style={{ display: 'flex' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < Math.round(avgRating) ? 'var(--warning)' : 'none'} strokeWidth={1.5} />
            ))}
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{avgRating}</span>
        </div>

        {/* Product Name */}
        <Link to={`/product/${product.id}`} style={{ display: 'block' }}>
          <h3
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.4,
              height: '42px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
            className="product-title-link"
          >
            {lang === 'ar' ? product.name_ar : product.name_en}
          </h3>
        </Link>

        {/* Price Tag line */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.4rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {product.price} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{t('cart.currency')}</span>
          </span>
          {product.compare_at_price && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {product.compare_at_price} {t('cart.currency')}
            </span>
          )}
        </div>

      </div>

      {/* Action Footer Button Group */}
      <div style={{ padding: '0 1rem 1rem 1rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
        
        <button
          onClick={handleAddToCart}
          disabled={product.availability === 'unavailable'}
          className="btn btn-outline"
          style={{
            padding: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            width: '100%',
            opacity: product.availability === 'unavailable' ? 0.5 : 1
          }}
        >
          <ShoppingCart size={14} />
          {t('product.add_to_cart')}
        </button>

        <Link
          to={`/product/${product.id}`}
          className="btn btn-primary"
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
          }}
          title={t('product.buy_now')}
        >
          <Eye size={14} />
        </Link>

      </div>

      <style>{`
        .product-card:hover .product-card-img {
          transform: scale(1.08);
        }
        .product-title-link:hover {
          color: var(--secondary) !important;
        }
        .fav-toggle-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
