import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import supabase from '../supabaseClient';
import SkeletonLoader from '../components/SkeletonLoader';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export const YearPage = () => {
  const { slug } = useParams();
  const { lang, t, isRtl } = useLanguage();
  
  const [yearData, setYearData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYearAndSubjects = async () => {
      setLoading(true);
      try {
        // Fetch year details
        const { data: year } = await supabase
          .from('years')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (year) {
          setYearData(year);
          // Fetch associated subjects
          const { data: subs } = await supabase
            .from('subjects')
            .select('*')
            .eq('year_id', year.id);
          
          if (subs) setSubjects(subs);
        }
      } catch (err) {
        console.error('Error loading year info', err);
      } finally {
        setLoading(false);
      }
    };

    fetchYearAndSubjects();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="skeleton" style={{ height: '35px', width: '220px', marginBottom: '2rem' }}></div>
        <SkeletonLoader type="subjects" count={3} />
      </div>
    );
  }

  if (!yearData) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>عذراً، لم يتم العثور على هذه السنة الدراسية.</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sorry, this year was not found.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {t('nav.home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Breadcrumb / Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }} className="no-print">
        <Link to="/" style={{ color: 'var(--text-muted)' }}>{t('nav.home')}</Link>
        {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>
          {lang === 'ar' ? yearData.name_ar : yearData.name_en}
        </span>
      </div>

      {/* Page Title */}
      <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
          {lang === 'ar' ? yearData.name_ar : yearData.name_en}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          {lang === 'ar' ? 'اختر المادة لتصفح الأدوات والملحقات المطلوبة لها.' : 'Choose the subject to browse clinical and lab instruments.'}
        </p>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', backgroundColor: 'var(--surface-color)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-muted)' }}>{t('subject.no_products')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {subjects.map((sub) => (
            <Link
              to={`/subject/${sub.slug}`}
              key={sub.id}
              className="card subject-link-card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                backgroundColor: 'var(--surface-color)',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ backgroundColor: 'var(--accent)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--secondary)' }}>
                <BookOpen size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', transition: 'var(--transition-fast)' }} className="subject-title">
                  {sub.name_en}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {lang === 'ar' ? sub.description_ar : sub.description_en}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .subject-link-card:hover {
          background-color: var(--accent) !important;
          border-color: var(--secondary) !important;
        }
        .subject-link-card:hover .subject-title {
          color: var(--secondary) !important;
        }
      `}</style>
    </div>
  );
};

export default YearPage;
