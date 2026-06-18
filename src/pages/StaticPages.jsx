import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import supabase from '../supabaseClient';

export const StaticPages = ({ pageKey }) => {
  const { lang, t } = useLanguage();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageContent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pages_content')
          .select('*')
          .eq('key', pageKey)
          .single();

        if (data) {
          setPageData(data);
        }
      } catch (err) {
        console.error('Error fetching static content', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, [pageKey]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="skeleton" style={{ height: '35px', width: '300px' }}></div>
        <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
        <div className="skeleton" style={{ height: '120px', width: '100%' }}></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>عذراً، لم يتم العثور على هذه الصفحة.</h2>
        <p style={{ color: 'var(--text-muted)' }}>Page content not loaded.</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 0', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Heading */}
      <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
          {lang === 'ar' ? pageData.title_ar : pageData.title_en}
        </h1>
      </div>

      {/* Rich HTML Content */}
      <div
        style={{
          lineHeight: 1.8,
          fontSize: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
        className="static-content-rich"
        dangerouslySetInnerHTML={{
          __html: lang === 'ar' ? pageData.content_ar : pageData.content_en
        }}
      />

      <style>{`
        .static-content-rich h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--primary);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .static-content-rich p {
          color: var(--text-muted);
          margin-bottom: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default StaticPages;
