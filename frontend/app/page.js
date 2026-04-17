'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user, login, register, loading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/catalog');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Pintu akses terbuka.');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Identitas terdaftar. Silakan masuk.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      console.error('[Auth Error]', err);
      toast.error(err.message || 'Kredensial tidak valid.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="skeleton" style={{ width: '120px', height: '2px' }}></div>
      </div>
    );
  }

  return (
    <div className="split-auth-container">
      {/* Left Side: Branding / Pattern */}
      <div className="auth-brand-side">
        <div className="brand-content animate-fade-in-up">
          <div className="brand-logo" style={{background: 'var(--primary-gradient)', color: '#fff', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px'}}>SE</div>
          <h1 className="brand-heading">Membentuk <br/>Masa Depan Literasi.</h1>
          <p className="brand-subtext">
            Sistem sirkulasi pustaka cerdas rancangan tim ahli untuk mengoptimalkan manajemen literatur Anda.
          </p>
        </div>
        <div className="brand-pattern"></div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper animate-fade-in">
          <div className="auth-header-minimal">
            <h2>{isLogin ? 'Selamat Datang' : 'Buat Akun'}</h2>
            <p>{isLogin ? 'Masuk dengan kredensial sistem Anda.' : 'Registrasikan diri sebagai member baru.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-core">
            {!isLogin && (
              <div className="form-group-clean">
                <label htmlFor="name">Nama Lengkap</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group-clean">
              <label htmlFor="email">Alamat Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-clean">
              <label htmlFor="password">Kata Sandi</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn-primary-clean"
              disabled={submitting}
            >
              {submitting ? 'Memproses...' : (isLogin ? 'Lanjutkan' : 'Daftar')}
            </button>

            <div className="auth-separator" style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px', gap: '12px' }}>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border)' }}></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>atau</span>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border)' }}></div>
            </div>

            <button
              type="button"
              className="btn-google flex items-center justify-center shadow-sm"
              onClick={() => nextAuthSignIn('google')}
              disabled={submitting}
              style={{ width: '100%', padding: '10px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', gap: '10px', fontSize: '0.95rem' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Lanjutkan dengan Google
            </button>
          </form>

          <div className="auth-footer-clean">
            <span>{isLogin ? 'Anggota baru?' : 'Sudah terdaftar?'}</span>
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: '', email: '', password: '' });
              }}
            >
              {isLogin ? 'Buat identitas' : 'Masuk portal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
