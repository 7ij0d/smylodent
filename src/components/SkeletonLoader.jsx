import React from 'react';

export const SkeletonLoader = ({ type = 'card-grid', count = 4 }) => {
  const renderCardSkeleton = () => (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        padding: '1rem',
        minHeight: '340px'
      }}
    >
      <div className="skeleton" style={{ height: '180px', width: '100%', borderRadius: 'var(--radius-sm)' }}></div>
      <div className="skeleton" style={{ height: '14px', width: '40%' }}></div>
      <div className="skeleton" style={{ height: '20px', width: '85%' }}></div>
      <div className="skeleton" style={{ height: '20px', width: '50%', marginTop: 'auto' }}></div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <div className="skeleton" style={{ height: '32px', flexGrow: 1 }}></div>
        <div className="skeleton" style={{ height: '32px', width: '32px' }}></div>
      </div>
    </div>
  );

  const renderDetailsSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginTop: '1.5rem' }} className="responsive-details-skeleton">
      <div className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-md)' }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="skeleton" style={{ height: '32px', width: '80%' }}></div>
        <div className="skeleton" style={{ height: '20px', width: '30%' }}></div>
        <div className="skeleton" style={{ height: '45px', width: '50%' }}></div>
        <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div className="skeleton" style={{ height: '48px', width: '140px' }}></div>
          <div className="skeleton" style={{ height: '48px', width: '140px' }}></div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .responsive-details-skeleton {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );

  const renderSubjectListSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className="skeleton"
          style={{
            height: '80px',
            borderRadius: 'var(--radius-md)',
            opacity: 0.8
          }}
        ></div>
      ))}
    </div>
  );

  return (
    <>
      {type === 'card-grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[...Array(count)].map((_, idx) => (
            <React.Fragment key={idx}>{renderCardSkeleton()}</React.Fragment>
          ))}
        </div>
      )}
      {type === 'details' && renderDetailsSkeleton()}
      {type === 'subjects' && renderSubjectListSkeleton()}
    </>
  );
};

export default SkeletonLoader;
