import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, User, Phone, Landmark, Lock, HelpCircle } from 'lucide-react';

export const SignInPage = () => {
  const { t, isRtl } = useLanguage();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Mode state: signin vs signup
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('جامعة طرابلس');
  const [college, setCollege] = useState('كلية طب الأسنان');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await signUp(email, password, {
          full_name: fullName,
          phone: phone,
          university: university,
          college: college,
          role: 'student'
        });
        if (error) throw error;
        navigate('/profile');
      } else {
        // Sign In
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        navigate('/profile');
      }
    } catch (err) {
      console.error('Auth handler failed', err);
      setErrorMsg(err.message || 'حدث خطأ في عملية التحقق، يرجى المحاولة لاحقاً. / Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '3.5rem 0', display: 'flex', justifyContent: 'center' }}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: '2.5rem 2rem',
          backgroundColor: 'var(--surface-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Heading Toggles */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem' }}>
            {isSignUp ? t('auth.signup_title') : t('auth.signin_title')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            سجل دخولك لتتبع طلباتك وحفظ أدواتك المفضلة.
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
            {errorMsg}
          </div>
        )}



        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {isSignUp && (
            <>
              {/* Full name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('checkout.full_name')} *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Phone */}
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

              {/* University */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('checkout.university')} *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>

              {/* College */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{t('checkout.college')} *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('auth.email')} *</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('auth.password')} *</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'جاري التحقق... / Please wait...' : (isSignUp ? t('auth.btn_signup') : t('auth.btn_signin'))}
          </button>

        </form>

        {/* Toggle Mode Link */}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg('');
          }}
          style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }}
        >
          {isSignUp ? t('auth.have_account') : t('auth.no_account')}
        </button>

      </div>
    </div>
  );
};

export default SignInPage;
