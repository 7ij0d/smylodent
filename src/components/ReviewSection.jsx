import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import supabase from '../supabaseClient';
import { Star, MessageSquare, Plus } from 'lucide-react';

export const ReviewSection = ({ productId }) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (data) setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Autocomplete student name if logged in
  useEffect(() => {
    if (profile?.full_name) {
      setReviewerName(profile.full_name);
    }
  }, [profile]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) return;

    setSubmitting(true);
    setMessage('');
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user?.id || null,
        reviewer_name: reviewerName,
        rating,
        comment,
        is_approved: true // Autopre-approved for rapid local testing, admin can moderate in admin page
      });

      if (!error) {
        setComment('');
        setMessage('تم إرسال التقييم بنجاح! / Review submitted successfully!');
        fetchReviews();
      } else {
        setMessage('حدث خطأ أثناء الإرسال. / Error submitting review.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAverage = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, item) => sum + item.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        <MessageSquare size={20} style={{ color: 'var(--secondary)' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{t('product.reviews_count', { count: reviews.length })}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        
        {/* Left Side: Reviews list */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
              <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', backgroundColor: 'var(--surface-color)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--text-muted)' }}>{t('product.no_reviews')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ padding: '1rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <h4 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{rev.reviewer_name}</h4>
                    <div style={{ display: 'flex', color: 'var(--warning)' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < rev.rating ? 'var(--warning)' : 'none'} strokeWidth={1.5} />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{rev.comment}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem', textAlign: 'end' }}>
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Review input form */}
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', alignSelf: 'start' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Plus size={16} style={{ color: 'var(--secondary)' }} />
            {t('product.add_review')}
          </h4>

          {message && (
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent)', border: '1px solid var(--secondary)', color: 'var(--text-main)', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Rating Stars Input Selector */}
            <div>
              <span className="form-label">{t('product.rating')}</span>
              <div style={{ display: 'flex', gap: '0.4rem', color: 'var(--warning)', cursor: 'pointer' }}>
                {[...Array(5)].map((_, i) => {
                  const currentStar = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(currentStar)}
                      onMouseEnter={() => setHoveredRating(currentStar)}
                      onMouseLeave={() => setHoveredRating(0)}
                      style={{ padding: '2px' }}
                    >
                      <Star
                        size={22}
                        fill={currentStar <= (hoveredRating || rating) ? 'var(--warning)' : 'none'}
                        strokeWidth={1.5}
                        style={{ transition: 'var(--transition-fast)' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('checkout.full_name')}</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder={t('product.name_placeholder')}
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
              />
            </div>

            {/* Comment Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{t('product.comment')}</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder={t('product.comment_placeholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem' }}
            >
              {t('product.submit_review')}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default ReviewSection;
